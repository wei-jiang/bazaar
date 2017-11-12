import recognizer from "./dollar";

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
export default class RegCanvas {
    points = [];
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');    
        this.isDrawing = false;
        this.init()
    }
    touchstart ( p ) {
                    
        this.context.beginPath();            
        this.context.moveTo(p.x, p.y);
        
        this.isDrawing = true;
        this.points.length = 0;
        this.points.push( new Point(p.x, p.y) );
    }
    touchmove( p ) {
        if (this.isDrawing) {
            this.context.lineTo(p.x, p.y);
            this.context.stroke();                
            this.points.push( new Point(p.x, p.y) );
        }
    }
    touchend( p ) {
        
        if (this.isDrawing) {
            this.touchmove(p);
            this.isDrawing = false;
            if (this.points.length >= 10)
            {  
                var result = recognizer.Recognize(this.points, false);
                alert("Result: " + result.Name + " (" + round(result.Score,2) + ").");
            }
            else // fewer than 10 points were inputted
            {   
                alert("Too few points made. Please try again.");
            }
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    draw(event) {
        let type = null;
        // map mouse events to touch events
        let ox = event.offsetX, oy = event.offsetY ; 
        switch (event.type) {
            case "mousedown":
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
            console.log("touchend", event.changedTouches[0]) 
            coors = {
                x: event.changedTouches[0].pageX - offset.left,
                y: event.changedTouches[0].pageY - offset.top
            };
        }
        else {
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