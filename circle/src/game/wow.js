import _ from 'lodash'

import net from '../net'
import util from '../common/util'

//position for lng/lat, point/pos for x/y in pixel
class GameWorld {
    constructor() {
        console.log( 'in GameWorld constructor' )
        this.m_app = b4w.require("app");
        this.m_cfg = b4w.require("config");
        this.m_data = b4w.require("data");    
        this.m_ver = b4w.require("version");    
        this.m_anim = b4w.require("animation");
        this.m_cont = b4w.require("container");
        this.m_scenes = b4w.require("scenes");
        console.log( this.m_ver.version_str() )
        this.init();
    }
    init() {
        this.m_app.init({
            canvas_container_id: "game",
            callback: (canvas_elem, success)=> {               
                        if (!success) {
                            console.log("b4w init failure");
                            return;
                        }
                        this.load();
                    },
            show_fps: true,
            console_verbose: true,
            autoresize: true
        });
    }
    load() {

    }
    
}

export default GameWorld;