import '../libs/ga.all.min.js';
// require('./libs/plugins.min.js')
import Player from './player.js';
import _ from 'lodash'

let g;
var world, mplayer, faceTo, camera;

class Game {  
  players = [];
  constructor() {
    g = ga(512, 896, this.setup.bind(this),
      [
        "res/ornament.png",
        "res/walkcycle.png",
        "res/bazaar.json"
      ]
    );
    g.fps = 30;    
  }

  setup() {
    this.world = g.makeTiledWorld(
      "res/bazaar.json",
      "res/ornament.png"
    );
    this.canvas = g.canvas;
    this.mplayer = this.new_player(wi, true)
    g.state = this.play.bind(this);

  }
  play() {
    _.each( this.players, p => p.update() )
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