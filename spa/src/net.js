import _ from 'lodash'
import game from './game/game';
import adb from "./db";
var wwwRoot = window.location.href;
if (wwwRoot.substr(wwwRoot.lenght - 1, 1) != "/") {
    wwwRoot = wwwRoot.substr(0, wwwRoot.lastIndexOf("/"));
}

class Net {
  constructor() {
    if(typeof io != "undefined"){
      this.sock = io(wwwRoot);
      this.sock.on('connect', this.on_connect.bind(this) );
      this.sock.on('new_player_online', this.on_new_player_online.bind(this) );
      this.sock.on('player_offline', this.on_player_offline.bind(this) );
      this.sock.on('player_move', this.on_player_move.bind(this) );
      this.sock.on('speak_to_all', this.on_recieve_chat.bind(this) );
      this.sock.on('speak_to_target', this.on_recieve_chat.bind(this) );
    }    
  }
  on_connect(){
       
  }
  post_online(mplayer){
    adb.then(db => {
      let prd = db.products.findOne({})
      var data = jQuery.extend(wi, mplayer.get_loc() );
      if(prd) data.seller = true;
      this.emit('player_online', data, function(players) {
          // alert(JSON.stringify(players) );
          console.log('当前在线：'+players.length+'人');
          window.vm.$emit('count_changed', players.length);
          let nps = _.differenceBy(players, game.player_infos(), 'openid');          
          _.each(nps, p => game.new_player(p) )
      }); 
    }) 
  }
  on_recieve_chat(data){    
    phonon.notif(`${data.from}说:${data.content}`, 3000);
    adb.then(db => {
      db.chat_log.insert(data);
    });
  }
  emit(name, data, cb){
    if(this.sock) {
      this.sock.emit(name, data, cb)
    }    
  }
  on_new_player_online( p ){
    game.new_player(p)
    window.vm.$emit('count_changed', game.players.length);
  }
  on_player_offline( p ){
    game.remove_player(p.openid)
    window.vm.$emit('count_changed', game.players.length);
  }
  on_player_move( p ){
    console.log('on_player_move p', p);
    let t = game.get_player_by_id(p.openid)
    console.log('on_player_move t', t);
    if(t){
      t.translate(p.x, p.y)
      t.move(p.dx, p.dy)
    } 
  }
}
export default new Net;