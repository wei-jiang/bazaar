import _ from 'lodash'

import net from '../net'
import util from '../common/util'

//position for lng/lat, point/pos for x/y in pixel
class Entity {
    constructor(map, wi) {
        this.wi = wi;
        //in pixel
        this.vx = this.vy = 0;
        this.position = new BMap.Point(wi.x, wi.y);
        this.fatigue_tm = null;
        this.map = map;
        Entity.entity.push(this);
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
    get_loc() {
        return {
            x: this.position.lng,
            y: this.position.lat,
        }
    }
    set_center() {
        this.map.setCenter(this.position)
    }
    update() {
        // this.animate();
        this.do_move()
    }
    destroy() {
        Entity.entity.splice(this, 1);
    }
    do_move() {
        if (this.vx != 0 || this.vy != 0) {
            let delta = this.pixel2LngLat(this.vx, this.vy)
            this.position.lng += delta.lng;
            this.position.lat += delta.lat;
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
        // console.log(dx, dy)
        let magnitude = Math.sqrt(dx * dx + dy * dy);
        dx /= magnitude;
        dy /= magnitude * -1; //invert dir

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
}
Entity.entity = [];
let _requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            return window.setTimeout(callback,
                1000 / 60);
        };
})();
(function gameLoop() {
    _requestAnimFrame(gameLoop);
    _.each(Entity.entity, e => e.update.call(e))
})();
export default Entity;