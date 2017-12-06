import _ from 'lodash'
import AniClip from './clip'
import net from '../net'

//position for lng/lat, point/pos for x/y in pixel
class Player extends BMap.Overlay {
  constructor(map, wi) {
    super();
    
    this.wi = wi;
    //in pixel
    this.vx = this.vy = 0;
    this.position = new BMap.Point(wi.x, wi.y);
    //can not use width/height for confliction
    this._width = 64;
    this._height = 64;
    this.states = {
      up: 1,
      left: 10,
      down: 19,
      right: 28,
      walkUp: [2, 9],
      walkLeft: [11, 18],
      walkDown: [20, 27],
      walkRight: [29, 36]
    };
    this.last_face2 = this.states.right;
    this.can_play_anim = true;
    this.fatigue_tm = null;
    this.map = map;
    this.map.addOverlay(this);
  }
  initialize(map) {
    // 创建div元素，作为自定义覆盖物的容器
    var div = document.createElement("div");
    div.id = this.wi.openid;
    $(div).css({
      "background": "url(res/walkcycle.png) no-repeat",
      "text-align": "center",
      "position": "absolute"
    });
    // 可以根据参数设置元素外观
    div.style.width = this._width + "px";
    div.style.height = this._height + "px";
    div.style.zIndex = "9";
    this.div = div;
    this.map = map;
    map.getPanes().markerPane.appendChild(div);
    let hiu = /http/i.test(this.wi.headimgurl)
      ? this.wi.headimgurl
      : "res/hi0.jpg";
    $(div).append(`<img src="${hiu}" style="display:inline-block;width:45px;height:36px;"/>`)
    this.ani = new AniClip(div, {
      direction: 'vh',
      framerate: 15,
      width: 64,
      height: 64
    })
    // this.ani_walk_left()
    return div;
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
  stop_ani(dir) {
    this.ani.clearLoopBetween();
    this.ani.gotoAndStop(dir)
  }
  face_up() {
    this.ani.gotoAndStop(1)
  }
  face_left() {
    this.ani.gotoAndStop(10)
  }
  face_down() {
    this.ani.gotoAndStop(19)
  }
  face_right() {
    this.ani.gotoAndStop(28)
  }
  ani_walk_up() {
    this.ani.loopBetween(2, 9).play(true)
  }
  ani_walk_left() {
    this.ani.loopBetween(11, 18).play(true)
  }
  ani_walk_down() {
    this.ani.loopBetween(20, 27).play(true)
  }
  ani_walk_right() {
    this.ani.loopBetween(29, 36).play(true)
  }
  draw() {
    // 根据地理坐标转换为像素坐标，并设置给容器    
    let pos = this.map.pointToOverlayPixel(this.position);
    this.div.style.left = pos.x - this.width / 2 + "px";
    this.div.style.top = pos.y - this.height / 2 + "px";
  }
  //vx, vy in pixel
  pixel2LngLat(vx, vy) {
    let lngPerPixel = this.map.getBounds().toSpan().lng / this.map.getSize().width;
    let latPerPixel = this.map.getBounds().toSpan().lat / this.map.getSize().height;
    return {
      lng: vx * lngPerPixel,
      lat: vy * latPerPixel
    }
  }
  update() {
    this.animate();
    this.do_move()
    //main player
    if( this.is_main_player() ){
      window.vm.$emit('player_coordinate', this.get_loc());
    }    
  }
  vanish() {
    this.map.removeOverlay(this)
  }
  set_center() {
    this.map.setCenter(this.position)
  }
  get pos() {
    let offset = $(this.div).offset()
    return {
      x: offset.left,
      y: offset.top
    };
  }

  get x() {
    let offset = $(this.div).offset()
    return offset.left;
  }
  get y() {
    let offset = $(this.div).offset()
    return offset.top;
  }

  get width() {
    return $(this.div).width();
  }
  set width(w) {
    if (w) {
      $(this.div).width(w);
    }
  }
  get height() {
    return $(this.div).height();
  }
  set height(h) {
    if (h) {
      $(this.div).height(h);
    }
  }
  get_loc() {
    return {
      x: this.position.lng,
      y: this.position.lat,
    }
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

  do_move() {
    if (this.vx != 0 || this.vy != 0) {
      let delta = this.pixel2LngLat(this.vx, this.vy)
      this.position.lng += delta.lng;
      this.position.lat += delta.lat;
      this.draw();
    } else {

    }
  }
  is_main_player() {
    return this.wi.openid === wi.openid;
  }
  translate(x, y) {
    this.position.lng = x;
    this.position.lat = y;
  }
  stop_move() {
    this.vx = this.vy = 0;
  }
  move(dx, dy) {
    console.log(dx, dy)
    let magnitude = Math.sqrt(dx * dx + dy * dy);
    dx /= magnitude;
    dy /= magnitude * -1;

    this.vy = dy * 2;
    this.vx = dx * 2;
    let self = this;
    clearTimeout(this.fatigue_tm);
    (function fatigue() {
      self.vx = Math.abs(self.vx) > 0.5 ? Math.max(0, (Math.abs(self.vx) - 0.1)) * Math.sign(self.vx) : 0;
      self.vy = Math.abs(self.vy) > 0.5 ? Math.max(0, (Math.abs(self.vy) - 0.1)) * Math.sign(self.vy) : 0;
      if (Math.abs(self.vx) > 0 || Math.abs(self.vy) > 0) {
        self.fatigue_tm = setTimeout(fatigue, 1000);
      } else {
        console.log('this.vx,this.vy all == 0')
      }
    })();
  }
  init() {

  }
}

export default Player;