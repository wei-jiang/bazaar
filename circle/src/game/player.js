import _ from 'lodash'

import net from '../net'
import util from '../common/util'
import Entity from './entity'
//position for lng/lat, point/pos for x/y in pixel
class Player extends Entity {
  constructor(map, wi) {
    super(map, wi)
  }

  animate() {
    if (this.vx == 0 && this.vy == 0) {
      this.stop_ani(this.last_face2);
      this.can_play_anim = true;
      return;
    }
    if (this.vx > 0) {
      if (this.vx > Math.abs(this.vy)) {
        if (this.can_play_anim || this.last_face2 != this.states.right) {
          this.ani_walk_right()
          this.last_face2 = this.states.right;
          this.can_play_anim = false;
        }

      } else if (this.vy > 0) {
        if (this.can_play_anim || this.last_face2 != this.states.up) {
          this.ani_walk_up()
          this.last_face2 = this.states.up;
          this.can_play_anim = false;
        }
      } else {
        if (this.can_play_anim || this.last_face2 != this.states.down) {
          this.ani_walk_down()
          this.last_face2 = this.states.down;
          this.can_play_anim = false;
        }
      }
    } else {
      if (Math.abs(this.vx) > Math.abs(this.vy)) {
        if (this.can_play_anim || this.last_face2 != this.states.left) {
          this.ani_walk_left()
          this.last_face2 = this.states.left;
          this.can_play_anim = false;
        }
      } else if (this.vy > 0) {
        if (this.can_play_anim || this.last_face2 != this.states.up) {
          this.ani_walk_up()
          this.last_face2 = this.states.up;
          this.can_play_anim = false;
        }
      } else {
        if (this.can_play_anim || this.last_face2 != this.states.down) {
          this.ani_walk_down()
          this.last_face2 = this.states.down;
          this.can_play_anim = false;
        }
      }
    }
  }
  
  is_nearby_mplayer() {
    let m_pos = this.map.mplayer.position;
    let span = this.map.getBounds().toSpan();
    let in_sight_lng = span.lng / 2 + span.lng / 4;
    let in_sight_lat = span.lat / 2 + span.lat / 4;
    if (Math.abs(this.position.lng - m_pos.lng) < in_sight_lng
      && Math.abs(this.position.lat - m_pos.lat) < in_sight_lat) {
      return true;
    }
    return false;
  }
  update() {
    // if (this.is_main_player()) {
    //   this.animate();
    //   this.do_move()
    //   window.vm.$emit('player_coordinate', this.get_loc());
    //   // window.vm.$emit('debug_info', '地图人数：'+this.map.getOverlays().length);

    // } else {
    //   if (this.is_nearby_mplayer()) {
    //     this.animate();
    //     this.do_move()
    //   } else {
    //     //far away from main player
    //     this.vanish();
    //   }
    // }
  }
  vanish() {
    super.destroy()
  }
  

  on_hit() {
    if (this.is_main_player()) {
      this.stop_move()
      let data = this.get_loc();
      data.openid = this.wi.openid;
      net.emit('stop_move', data)
    }
    window.vm.$emit('show_header', this.wi);
  }
  test_hit(x, y) {
    let left = this.x,
      right = this.x + this.width,
      top = this.y,
      bottom = (this.y + this.height);
    // console.log(this.pos)
    // console.log('test_hit', x, y, this.x, this.y, this.width, this.height)
    //Find out if the point is intersecting the rectangle.
    let hit = x > left && x < right && y > top && y < bottom;
    // console.log('player test_hit=', hit)
    return hit;
  }

}

export default Player;