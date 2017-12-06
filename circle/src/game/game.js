
import Player from './player.js';
import _ from 'lodash'
import net from '../net'
let camera;

class Game {
  players = [];
  constructor() {
    this.fps = 30;
    this.map = new BMap.Map("allmap");    // 创建Map实例
    //here? 112.745415, 27.23847
    let start_point = new BMap.Point(this.getRandFloat(112.745, 112.746), this.getRandFloat(27.238, 27.239) )
    this.map.centerAndZoom(start_point, 19);  // 初始化地图,设置中心点坐标和地图级别
    _.assign(wi, {
      x: start_point.lng,
      y: start_point.lat
    });
    let mp = this.new_player( wi );    
    this.map.setCurrentCity("南岳");
    this.mplayer = mp
    this.cam = this.worldCamera();
    net.post_online(this.mplayer)
    setInterval(() => this.update(), 1000 / this.fps);
  }
  getRandFloat(min, max) {
    return Math.random() * (max - min) + min;
  }
  getRandInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  worldCamera() {
    return camera = {
      follow(player) {
        player.set_center()
      }
    };
  };
  update() {
    this.cam.follow(this.mplayer)
    _.each(this.players, p => p.update.call(p))
  }
  player_infos() {
    return _.map(this.players, p => p.wi);
  }
  get_player_by_id(oid) {
    return _.find(this.players, p => p.wi.openid == oid);
  }
  test_hit(x, y) {
    let sel_p = _.find(this.players, p => p.test_hit(x, y));
    sel_p && sel_p.on_hit()
    return sel_p;
  }
  new_player(wi) {
    let p = new Player(this.map, wi)
    this.players.push(p)
    return p;
  }
  remove_player(oid) {
    this.players = _.filter(this.players, p => {
      if (p.wi.openid != oid) return true;
      p.vanish();
      return false;
    })
  }
  init() {

  }
}

export default new Game;