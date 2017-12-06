import _ from 'lodash'
import game from './game/game';
import adb from "./db";
const moment = require('moment');

// var wwwRoot = window.location.href;
// if (wwwRoot.substr(wwwRoot.lenght - 1, 1) != "/") {
//   wwwRoot = wwwRoot.substr(0, wwwRoot.lastIndexOf("/"));
// }

class Net {
  constructor() {
    if (typeof io != "undefined") {
      this.sock = io();
      this.sock.on('connect', this.on_connect.bind(this));
      this.sock.on('new_player_online', this.on_new_player_online.bind(this));
      this.sock.on('player_offline', this.on_player_offline.bind(this));
      this.sock.on('player_move', this.on_player_move.bind(this));
      this.sock.on('stop_move', this.on_stop_move.bind(this));
      this.sock.on('speak_to_all', this.on_recieve_chat.bind(this));
      this.sock.on('speak_to_target', this.on_recieve_chat.bind(this));
      this.sock.on('notify_seller_status', this.on_notify_seller_status.bind(this));
      this.sock.on('get_target_goods', this.on_get_target_goods.bind(this));
      this.sock.on('system_notification', this.on_system_notification.bind(this));
    }
  }
  register_ui_evt() {
    vm.$on("notify_seller_status", data => {
      this.emit('notify_seller_status', data)
    });
  }
  on_system_notification(data) {
    //insert into local db
    adb.then(db => {      
      db.notification.insert({
        dt:moment().format("YYYY-MM-DD HH:mm:ss"),
        content:data
      });
      phonon.notif(data, 3000)
      vm.$emit('refresh_sys_noty', '');
      vm.$emit('refresh_order_status', '');
    })    
  }
  on_notify_seller_status(data) {
    let t = game.get_player_by_id(data.openid)
    if (t) {
      t.show_sign(data.seller)
    }
  }
  on_get_target_goods(data, cb) {
    adb.then(db => {
      let goods = db.products.find({});
      cb(goods)
    })
  }
  on_connect() {

  }
  get_orders(openid, cb) {
    this.emit('get_orders', openid, orders => {
      cb(orders)
    });
  }
  post_online(mplayer) {
    adb.then(db => {
      let prd = db.products.findOne({})
      var data = jQuery.extend(wi, mplayer.get_loc());
      if (prd) data.seller = true;
      this.emit('player_online', data, function (players) {
        // alert(JSON.stringify(players) );
        console.log('当前在线：' + players.length + '人');
        window.vm.$emit('count_changed', players.length);
        let nps = _.differenceBy(players, game.player_infos(), 'openid');
        _.each(nps, p => game.new_player(p))
      });
      this.register_ui_evt()
    })
  }
  on_recieve_chat(data) {
    phonon.notif(`${data.from}说:${data.content}`, 3000);
    adb.then(db => {
      db.chat_log.insert(data);
      vm.$emit('refresh_chat_log', '');
    });
  }
  emit(name, data, cb) {
    if (this.sock) {
      this.sock.emit(name, data, cb)
    }
  }
  on_new_player_online(p) {
    game.new_player(p)
    window.vm.$emit('count_changed', game.players.length);
  }
  on_player_offline(p) {
    game.remove_player(p.openid)
    window.vm.$emit('count_changed', game.players.length);
  }
  on_player_move(p) {
    console.log('on_player_move p', p);
    let t = game.get_player_by_id(p.openid)
    console.log('on_player_move t', t);
    if (t) {
      t.translate(p.x, p.y)
      t.move(p.dx, p.dy)
    }
  }
  on_stop_move(p) {
    let t = game.get_player_by_id(p.openid)
    if (t) {
      t.translate(p.x, p.y)
      t.stop_move()
    }
  }
}
export default new Net;