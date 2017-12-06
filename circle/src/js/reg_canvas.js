import recognizer from "./dollar";
import adb from "../db";
import Noty from 'noty';

function round(n, d) // round 'n' to 'd' decimals
{
    d = Math.pow(10, d);
    return Math.round(n * d) / d
}
function Point(x, y) // constructor
{
    this.X = x;
    this.Y = y;
}
function load_gestures() {
    adb.then(db => {
        let doc = db.gestures.findOne({})
        if (doc) {
            recognizer.ParseInGestures(doc.gestures)
            console.log('load gestures from db; length=' + recognizer.Unistrokes.length)
        } else {
            // phonon.ajax({
            //     method: 'GET',
            //     url: '/static/default_gestures.txt',
            //     dataType: 'text',
            //     success: function(res, xhr) {
            //         console.log(res);
            //     }
            // });
            $.get("/circle/static/default_gestures.txt", (data, status) => {
                if (status == 'success') {
                    recognizer.ParseInGestures(data)
                    db.gestures.insert({
                        gestures: data
                    })
                    console.log('load gestures from ajax')
                } else {
                    new Noty({
                        layout: 'center',
                        timeout: 3000,
                        text: `获取默认手势失败:${status}`
                    }).show();
                }
            });
        }
    })

}
load_gestures()
export default class RegCanvas {
    points = [];

    constructor(canvas, dealer) {
        this.dealer = dealer;
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.isDrawing = false;
        this.init()
    }

    clear() {
        this.points.length = 0;
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    touchstart(p) {
        this.context.beginPath();
        this.context.moveTo(p.x, p.y);
        this.isDrawing = true;

        this.points.push(new Point(p.x, p.y));
        if (this.dealer && this.dealer.touchstart) {
            this.dealer.touchstart(this)
        }
    }
    touchmove(p) {
        if (this.isDrawing) {
            this.context.lineTo(p.x, p.y);
            this.context.stroke();
            this.points.push(new Point(p.x, p.y));
        }
    }
    touchend(p) {

        if (this.isDrawing) {
            this.touchmove(p);
            this.isDrawing = false;
            if (this.points.length >= 10) {
                var result = recognizer.Recognize(this.points, false);
                if (result.Score > 0.85 && this.dealer && this.dealer[result.Name]) {
                    this.dealer[result.Name](result, this.points)
                } else {
                    this.dealer && this.dealer.no_recognize && this.dealer.no_recognize(this.points)
                }
                // alert("Result: " + result.Name + " (" + round(result.Score,2) + ").");
            }
            else // fewer than 10 points were inputted
            {
                // alert("Too few points made. Please try again.");
                this.dealer && this.dealer.few_touch && this.dealer.few_touch(this.points, this.last_evt)
            }
            if (this.dealer && this.dealer.touchend) {
                this.dealer.touchend(this)
            }
        }
    }
    draw_stroke(name) {
        this.clear()
        this.context.beginPath();
        let origin = {
            X: this.canvas.width / 2,
            Y: this.canvas.height / 2 + 5
        };
        let scale = Math.min(this.canvas.width, this.canvas.height)
        var ps = recognizer.GetGesturePoints(name, scale, origin);
        // console.log(ps);
        this.context.moveTo(ps[0].X, ps[0].Y);
        for (var i = 1; i < ps.length; ++i) {
            this.context.lineTo(ps[i].X, ps[i].Y);
            this.context.stroke();
        }
        this.points = ps;
    }
    draw(event) {
        let type = null;
        // map mouse events to touch events
        let ox = event.offsetX, oy = event.offsetY;
        switch (event.type) {
            case "mousedown":
                this.last_evt = event;
                event.touches = [];
                event.touches[0] = {
                    pageX: event.pageX,
                    pageY: event.pageY
                };
                type = "touchstart";
                break;
            case "mousemove":
                event.touches = [];
                event.touches[0] = {
                    pageX: event.pageX,
                    pageY: event.pageY
                };
                type = "touchmove";
                break;
            case "mouseup":
                event.touches = [];
                event.touches[0] = {
                    pageX: event.pageX,
                    pageY: event.pageY
                };
                type = "touchend";
                break;
        }
        // var offset = $('.recognize-area canvas').offset()
        var offset = $(event.target).offset()
        // console.log(offset.left, offset.top);
        // touchend clear the touches[0], so we need to use changedTouches[0]
        var coors;
        if (event.type === "touchend") {
            // console.log("touchend", event.changedTouches[0])
            coors = {
                x: event.changedTouches[0].pageX - offset.left,
                y: event.changedTouches[0].pageY - offset.top
            };
        }
        else {
            this.last_evt = event;
            // get the touch coordinates
            let can = event.touches[0].target;
            // console.log(can.offsetLeft, can.offsetTop, can.parentNode.parentNode.offsetLeft, can.parentNode.parentNode.offsetTop) 
            coors = {
                x: event.touches[0].pageX - offset.left,
                y: event.touches[0].pageY - offset.top
            };
        }
        type = type || event.type
        // pass the coordinates to the appropriate handler
        // console.log(type)
        this[type](coors);
    }
    save(name, comments) {
        let ret = recognizer.UpdateGesture(name, this.points, comments)
        adb.then(db => {
            let data = recognizer.StringifyGestures();
            db.gestures.remove(db.gestures.find({}));
            db.gestures.insert({
                gestures: data
            });
        });
    }
    init() {
        // detect touch capabilities
        var touchAvailable = ('createTouch' in document) || ('ontouchstart' in window);

        // attach the touchstart, touchmove, touchend event listeners.
        if (touchAvailable) {
            this.canvas.addEventListener('touchstart', this.draw.bind(this), false);
            this.canvas.addEventListener('touchmove', this.draw.bind(this), false);
            this.canvas.addEventListener('touchend', this.draw.bind(this), false);
        }
        // attach the mousedown, mousemove, mouseup event listeners.
        else {
            this.canvas.addEventListener('mousedown', this.draw.bind(this), false);
            this.canvas.addEventListener('mousemove', this.draw.bind(this), false);
            this.canvas.addEventListener('mouseup', this.draw.bind(this), false);
        }

        // prevent elastic scrolling
        // document.body.addEventListener('touchmove', function (event) {
        //     event.preventDefault();
        // }, false); // end body.onTouchMove
    }

}