import _ from 'lodash'

class Player {
  constructor(g, world, wi, is_main_player) {
    this.g = g;
    this.world = world;
    this.wi = wi;
    this.player = g.sprite(g.filmstrip("res/walkcycle.png", 64, 64));
    this.title = g.text(wi.nickname);
    let spawn_x = world.getObject("mplayer").x;
    let spawn_y = world.getObject("mplayer").y;
    this.player.x = wi.x || g.randomInt(spawn_x - 50, spawn_x + 50);
    this.player.y = wi.y || g.randomInt(spawn_y - 50, spawn_y + 50);

    //Add the player sprite the map's "objects" layer group
    let playersLayer = world.getObject("players");
    playersLayer.addChild(this.player);
    playersLayer.addChild(this.title);
    this.player.putTop(this.title);

    if (is_main_player) {
      this.camera = g.worldCamera(world, g.canvas);
      this.camera.centerOver(this.player);
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

    this.sign = this.g.sprite("sell.png");   
    playersLayer.addChild(this.sign); 
    this.show_sign(wi.seller)
  }
  show_sign( flag ){
    
    if(flag){
      this.sign.visible = true;
    } else{
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
  is_blocked() {
    let obstaclesMapArray = this.world.getObject("obstacles").data;
    let playerVsGround = this.g.hitTestTile(this.player, obstaclesMapArray, 0, this.world, "every");

    //If the player isn't touching any ground tiles, it means its touching
    //an obstacle, like a bush, the bottom of a wall, or the bottom of a
    //tree
    if (!playerVsGround.hit) {
      //To prevent the player from moving, subtract its velocity from its position
      this.player.x -= this.player.vx;
      this.player.y -= this.player.vy;
      this.player.vx = 0;
      this.player.vy = 0;
      //You can find the gid number of the thing the player hit like this:
      //console.log(obstaclesMapArray[playerVsGround.index]);
    }
  }
  update() {
    this.player.putTop(this.title);
    this.title.putTop(this.sign);
    this.animate()
    this.do_move()
    this.is_blocked()
    this.camera && this.camera.follow(this.player);
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
    this.player.x = Math.max(-18, Math.min(this.player.x + this.player.vx, this.world.width - this.player.width + 18));
    this.player.y = Math.max(-10, Math.min(this.player.y + this.player.vy, this.world.height - this.player.height));
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
      player.vx = Math.abs(player.vx) > 0.6 ? Math.max(0, (Math.abs(player.vx) - 0.1)) * Math.sign(player.vx) : 0;
      player.vy = Math.abs(player.vy) > 0.6 ? Math.max(0, (Math.abs(player.vy) - 0.1)) * Math.sign(player.vy) : 0;
      if (Math.abs(player.vx) > 0 || Math.abs(player.vy)) {
        player.fatigue_tm = setTimeout(fatigue, 1000);
      }
    })();
  }
  init() {

  }
}

export default Player;