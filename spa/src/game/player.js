import _ from 'lodash'

const world_width = 512;
const world_height = 512;
let designed_world ={
    1:{2:0}
    //...
}

function cur_worlds(x, y){
    return [
        [x, y],
        [x, y-1],
        [x+1, y-1],
        [x+1, y],
        [x+1, y+1],
        [x, y+1],
        [x-1, y+1],
        [x-1, y],
        [x-1, y-1]
    ];
}
function load_own_world(g, world, player){
    let map_x = Math.floor(player.x / world_width);
    let map_y = Math.floor(player.y / world_height);
    if(player.last_map && player.last_map.x == map_x && player.last_map.y == map_y ){
        return world;
    }
    player.last_map = {
        x:map_x,
        y:map_y
    }
    let adjacent_sw_array = cur_worlds(map_x, map_y);
    // console.log(adjacent_sw_array);
    let loaded_map = world.loaded_world_map;
    let small_worlds = adjacent_sw_array.map( coor =>{
        let map_x = coor[0], map_y = coor[1];
        if( !loaded_map[ map_x ] ){
            loaded_map[ map_x ] = {}
        }
        if( !loaded_map[map_x][map_y] ){
            //let's skip designed_world for now
            if(world.candidate.length > 0){
                let sel_index = g.randomInt(0, world.candidate.length -1);
                let thisMap = world.candidate[sel_index].clone()
                thisMap.map_x = map_x;
                thisMap.map_y = map_y;
                world.addChild(thisMap)
                thisMap.setPosition(map_x*world_width, map_y*world_height);
                // console.log(thisMap.x, thisMap.y, thisMap.layer);
                loaded_map[map_x][map_y] = thisMap;                
            }
        }
        return loaded_map[map_x][map_y];
    })    
    // console.log('world.children.length:' + world.children.length);
    // console.log('world.width:' + world.width + '; world.height:' + world.height);
    // console.log('world.x:' + world.x + '; world.y:' + world.y);
    // if(world.children.length > 30){
    //     world.children.forEach( m =>{
    //         if( Math.abs( Math.abs(m.x) - Math.abs(player.x) ) > 4096 
    //             && Math.abs( Math.abs(m.y) - Math.abs(player.y) ) > 4096) {
    //             loaded_map[m.map_x][m.map_y] = null;
    //             g.remove(m);
    //         }
    //     })
    //     console.log('after clean world.children.length=' + world.children.length);
    // }
    
    return world;
}

class Player {
  constructor(g, world, wi, is_main_player) {
    this.g = g;
    this.world = world;
    this.wi = wi;
    this.player = g.sprite(g.filmstrip("res/walkcycle.png", 64, 64));
    this.title = g.text(wi.nickname);
    this.sign = this.g.sprite("sell.png");
    this.player.x = wi.x || g.randomInt(world.world_center - 100, world.world_center + 100);
    this.player.y = wi.y || g.randomInt(world.world_center - 100, world.world_center + 100);

    world.add(this.player, this.title, this.sign);
    this.player.putTop(this.title);
    this.player.setLayer = layer=>{
      this.player.layer = layer
      this.title.layer = layer -1
      this.sign.layer = layer -2
    }
    if (is_main_player) {
      this.camera = g.worldCamera(world, g.canvas);
      this.camera.centerOver(this.player);
      load_own_world(g, world, this.player);
    }
    this.player.collisionArea = { x: 22, y: 44, width: 20, height: 20 };
    this.states = {
      up: 0,
      left: 9,
      down: 18,
      right: 27,
      walkUp: [1, 8],
      walkLeft: [10, 17],
      walkDown: [19, 26],
      walkRight: [28, 35]
    };
    //Use the `show` method to display the player's `right` state
    this.last_face2 = this.states.right;
    this.player.show(this.last_face2);
    this.player.fps = 18;

    
    this.show_sign(wi.seller)
  }
  show_sign(flag) {

    if (flag) {
      this.sign.visible = true;
    } else {
      this.sign.visible = false;
    }
  }
  get_loc() {
    return {
      x: this.player.x,
      y: this.player.y,
    }
  }
  on_hit() {
    window.vm.$emit('show_header', this.wi);
  }
  test_hit(x, y) {
    var hit = false;
    let sprite = this.player;
    //Is the sprite rectangular?
    if (!sprite.circular) {

      //Get the position of the sprite's edges using global
      //coordinates.
      var left = sprite.gx, // * ga.scale,
        right = (sprite.gx + sprite.width), // * ga.scale,
        top = sprite.gy, // * ga.scale,
        bottom = (sprite.gy + sprite.height), // * ga.scale;

        //Find out if the point is intersecting the rectangle.
        hit = x > left && x < right && y > top && y < bottom;
    }
    //Is the sprite circular?
    else {

      //Find the distance between the point and the
      //center of the circle.
      var vx = x - ((sprite.gx + sprite.halfWidth)), // * ga.scale),
        vy = y - ((sprite.gy + sprite.halfHeight)), // * ga.scale),
        magnitude = Math.sqrt(vx * vx + vy * vy);

      //The point is intersecting the circle if the magnitude
      //(distance) is less than the circle's radius.
      hit = magnitude < sprite.radius;
    }
    // console.log('player test_hit', hit)
    return hit;
  }
  vanish() {
    this.g.remove(this.sign)
    this.g.remove(this.title)
    this.g.remove(this.player)
  }

  update() {
    //for dynamiclly load terrain reorder
    this.player.setLayer(9);
    this.player.putTop(this.title);
    this.title.putTop(this.sign);
    this.animate()
    this.do_move()    
    if( this.camera ){
      //main player
      window.vm.$emit('player_coordinate', {
        x:this.player.x-this.world.world_center,
        y:this.player.y-this.world.world_center
      });
      // window.vm.$emit('debug_info', `vx=${this.player.vx}, vy=${this.player.vy}`);
      this.camera.follow(this.player);
      load_own_world(this.g, this.world, this.player);
    }
  }
  animate() {
    if (this.player.vx == 0 && this.player.vy == 0) {
      this.player.show(this.last_face2);
      this.player.can_play_anim = true;
      return;
    }
    if (this.player.vx > 0) {
      if (this.player.vx > Math.abs(this.player.vy)) {
        if (this.player.can_play_anim || this.last_face2 != this.states.right) {
          this.player.playSequence(this.states.walkRight);
          this.last_face2 = this.states.right;
          this.player.can_play_anim = false;
        }

      } else if (this.player.vy > 0) {
        if (this.player.can_play_anim || this.last_face2 != this.states.down) {
          this.player.playSequence(this.states.walkDown);
          this.last_face2 = this.states.down;
          this.player.can_play_anim = false;
        }
      } else {
        if (this.player.can_play_anim || this.last_face2 != this.states.up) {
          this.player.playSequence(this.states.walkUp);
          this.last_face2 = this.states.up;
          this.player.can_play_anim = false;
        }
      }
    } else {
      if (Math.abs(this.player.vx) > Math.abs(this.player.vy)) {
        if (this.player.can_play_anim || this.last_face2 != this.states.left) {
          this.player.playSequence(this.states.walkLeft);
          this.last_face2 = this.states.left;
          this.player.can_play_anim = false;
        }
      } else if (this.player.vy > 0) {
        if (this.player.can_play_anim || this.last_face2 != this.states.down) {
          this.player.playSequence(this.states.walkDown);
          this.last_face2 = this.states.down;
          this.player.can_play_anim = false;
        }
      } else {
        if (this.player.can_play_anim || this.last_face2 != this.states.up) {
          this.player.playSequence(this.states.walkUp);
          this.last_face2 = this.states.up;
          this.player.can_play_anim = false;
        }
      }
    }
  }
  do_move() {
    this.g.move(this.player)
    this.g.contain(this.player, this.world)
  }
  translate(x, y) {
    this.player.x = x;
    this.player.y = y;
  }
  move(dx, dy) {
    console.log(dx, dy)
    let magnitude = Math.sqrt(dx * dx + dy * dy);
    dx /= magnitude;
    dy /= magnitude;
    let player = this.player;
    player.vy = dy * 2;
    player.vx = dx * 2;

    clearTimeout(player.fatigue_tm);
    (function fatigue() {
      player.vx = Math.abs(player.vx) > 0.5 ? Math.max(0, (Math.abs(player.vx) - 0.1)) * Math.sign(player.vx) : 0;
      player.vy = Math.abs(player.vy) > 0.5 ? Math.max(0, (Math.abs(player.vy) - 0.1)) * Math.sign(player.vy) : 0;
      if (Math.abs(player.vx) > 0 || Math.abs(player.vy) > 0 ) {
        player.fatigue_tm = setTimeout(fatigue, 1000);
      } else{
        console.log('player.vx,player.vy all == 0')
      }
    })();
  }
  init() {

  }
}

export default Player;