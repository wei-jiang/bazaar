import _ from 'lodash'
import game from './game/game';

var wwwRoot = window.location.href;
if (wwwRoot.substr(wwwRoot.lenght - 1, 1) != "/") {
    wwwRoot = wwwRoot.substr(0, wwwRoot.lastIndexOf("/"));
}

class Net {
  constructor() {
    this.sock = io(wwwRoot);
    this.sock.on('connect', this.on_connect.bind(this) );
    this.sock.on('new_player_online', this.on_new_player_online.bind(this) );
    this.sock.on('player_offline', this.on_player_offline.bind(this) );
    this.sock.on('player_move', this.on_player_move.bind(this) );
  }
  on_connect(){
    let prd = window.db.products.findOne({})
    let mplayer = game.mplayer;
    var data = jQuery.extend(wi, mplayer.get_loc() );
    if(prd) data.seller = true;
    this.sock.emit('player_online', data, function(players) {
        // alert(JSON.stringify(players) );
        console.log('当前在线：'+players.length+'人');
        window.vm.$emit('count_changed', players.length);
        let nps = _.differenceBy(players, game.players, 'openid');
        _.each(nps, p => game.new_player(p) )
    }); 
  }
  emit(name, data){
    this.sock.emit(name, data)
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
    let t = game.get_player_by_id(p.openid)
    t && t.move(p.dx, p.dy)
  }
}
export default new Net;