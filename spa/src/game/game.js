import '../libs/ga.all.min.js';
// require('./libs/plugins.min.js')
import Player from './player.js';
import _ from 'lodash'
import net from '../net'
let g;
var world, mplayer, faceTo, camera;
const world_size = 65536;
const world_center = world_size/2;
class Game {  
  players = [];
  constructor() {
    g = ga(512, 512, this.setup.bind(this),
      [
        "res/imgs.json",
        "res/walkcycle.png"
      ]
    );
    g.fps = 30;    
  }
  init_world(){
    let small_world = {
        clone: () => {
            return g.sprite("gnd.png")
        }
    }
    this.world = g.staticGroup();
    const world_size = 65536;
    this.world.world_center = world_size /2;
    this.world.width = world_size;
    this.world.height = world_size;
    this.world.loaded_world_map = {};
    this.world.candidate = [];
    this.world.candidate.push(small_world);
  }
  setup() {
    this.init_world();
    this.canvas = g.canvas;
    this.mplayer = this.new_player(wi, true)
    g.state = this.play.bind(this);
    net.post_online(this.mplayer)
  }
  play() {
    _.each( this.players, p => p.update() )
  }
  player_infos(){
    return _.map(this.players, p=> p.wi );
  }
  get_player_by_id(oid){
    return _.find(this.players, p=> p.wi.openid == oid );
  }
  test_hit(x, y){
    let sel_p = _.find(this.players, p=> p.test_hit(x, y) );
    sel_p && sel_p.on_hit()
    return sel_p;
  }
  new_player(wi, is_main_player) {
    let p = new Player(g, this.world, wi, is_main_player)
    this.players.push( p )
    return p;
  }
  remove_player(oid) {
    this.players = _.filter(this.players, p => {
      if(p.wi.openid != oid) return true;
      p.vanish();
      return false;
    })
  }
  init() {
    g.start();
  }
}

export default new Game;