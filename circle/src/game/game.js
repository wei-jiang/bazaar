
import Player from './player.js';
import Robot from './robot';
import _ from 'lodash'
import net from '../net'
import util from '../common/util'
let camera;

class Game {
  players = [];
  robots = [];
  constructor() {
    this.fps = 60;
    this.map = new BMap.Map("allmap");    // 创建Map实例
    //here? 112.745415, 27.23847
    let start_point = new BMap.Point(util.getRandFloat(112.745, 112.746), util.getRandFloat(27.238, 27.239) )
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
    //////////////////////////////////////
    this.spawn_robots()
    //////////////////////////////////////
    setInterval(() => this.update(), 1000 / this.fps);
  }
  spawn_robots(){
    this.destroy_robots()
    let i = 0;
    for(; i < 100; ++i){
      let wi = {
        openid: "robot"+i,
        nickname: "路人甲"+i,
        sex: "1",
        language: "中文",
        city: "长沙",
        province: "湖南",
        country: "中国",
        headimgurl: "res/hi0.jpg"
      };
      let start_point = new BMap.Point(util.getRandFloat(112.744, 112.747), util.getRandFloat(27.237, 27.240) )
      _.assign(wi, {
        x: start_point.lng,
        y: start_point.lat
      });
      let r = new Robot(this.map, wi)
      this.robots.push(r)
    }
    // for(; i < 600; ++i){
    //   let wi = {
    //     openid: "robot"+i,
    //     nickname: "路人甲"+i,
    //     sex: "1",
    //     language: "中文",
    //     city: "长沙",
    //     province: "湖南",
    //     country: "中国",
    //     headimgurl: "res/hi0.jpg"
    //   };
    //   let start_point = new BMap.Point(util.getRandFloat(112.70, 112.79), util.getRandFloat(27.20, 27.29) )
    //   _.assign(wi, {
    //     x: start_point.lng,
    //     y: start_point.lat
    //   });
    //   let r = new Robot(this.map, wi)
    //   this.robots.push(r)
    // }
  }
  destroy_robots(){
    _.each(this.robots, r=>{
      r.vanish()
    })
    this.robots = [];
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
    _.each(this.robots, r => r.update.call(r))
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