
class AniClip {
    constructor(elmts, params) {
        var t = this,
            str = elmts.toString();
        t.elmts = str === '[object Array]' || str === '[object NodeList]' || str === '[object HTMLCollection]' || str === '[object Object]' ? elmts : [elmts];
        str = null;
        t.playing = false;
        t.framerate = params.framerate || 25;
        t.frames = [];
        t.loop = false;
        t.elmtsLength = t.elmts.length;
        t.stopCallback = params.stopCallback || null;
        t.firstFrame = 1;
        t.lastFrame = 1;

        t._label = '';
        t._idx = 0;
        t._timer = null;
        t._tmpFrames = [];
        t._way = 1;
        t._framesNumber = params.frames_number || 0;

        t.updateFrames(params.frames, params.direction, params.width, params.height, params.frames_number);
    }
    _render() {
        var i = this.elmtsLength, t = this;
        while (i--) { this.elmts[i].style.backgroundPosition = this._tmpFrames[this._idx]; }
        if (t.playing) {
            if (t._idx >= t.lastFrame - 1) {
                if (!t.loop) {
                    t.stop();
                    return;
                }
                t._idx = t.firstFrame - 1;
            } else {
                t._idx++;
            }
        }
    }
    _enterFrame() {
        var t = this;
        t._render.call(t);
        if (t.playing) {
            t._timer = setTimeout(function () {
                t._enterFrame.call(t);
            }, 1000 / t.framerate);
        }
    }
    _calculateFrames() {
        this._tmpFrames = [];
        if (this._way === 1) {
            this._tmpFrames = this.frames;
        } else {
            var i = this.frames.length;
            while (i--) {
                this._tmpFrames.push(this.frames[i]);
            }
        }
        this._framesNumber = this.frames.length;
        return this.clearLoopBetween();
    }
    /**
     * concat each frame as a string, to better performance
     */
    _cacheFrames() {
        var frames = this.frames,
            i = frames.length;
        this.frames = [];
        while (i--) { this.frames[i] = '-' + frames[i].x + 'px -' + frames[i].y + 'px'; }
        return this;
    }
    //public method

    /**
     * @param frames array  (optional)
     * @param direction string (h for horyzontal of v for vertical) (optional)
     * @param width float (in case of a horizontal sprite) (optional)
     * @param height float height of a frame (in case of a vertical sprite)(optional)
     * @param nbframe float number of frames (optional)
     * @return this
     */
    updateFrames(frames, direction, width, height, nbframe) {
        if (direction === 'vh' && width && height) { 
            let div = this.elmts[0],
            frameWidth = width,
            frameHeight = height,
            columns = 576 / frameWidth,
            rows = 256 / frameHeight,
            spacing = 0,
            //Find the total number of frames.
            numberOfFrames = columns * rows;

            console.log(numberOfFrames)
          for (var i = 0; i < numberOfFrames; i++) {
      
            //Find the correct row and column for each frame
            //and figure out its x and y position.
            var x, y;
            x = (i % columns) * frameWidth;
            y = Math.floor(i / columns) * frameHeight;
      
            //Compensate for any optional spacing (padding) around the tiles if
            //there is any. This bit of code accumulates the spacing offsets from the
            //left side of the tileset and adds them to the current tile's position.
            if (spacing && spacing > 0) {
              x += spacing + (spacing * i % columns);
              y += spacing + (spacing * Math.floor(i / columns));
            }
      
            //Add the x and y value of each frame to the `positions` array.
            this.frames.push({x, y});
          }
          return this._cacheFrames()._calculateFrames();
        }
        if (frames) {
            this.frames = frames;
            return this._cacheFrames()._calculateFrames();
        }
        //some error reporting
        if (!frames && !direction) { throw "AniClip need at least frames array or a direction "; }
        if (direction === 'v' && !height) { throw "If you want to use a vertical sprite, JSMoviclip need a height"; }
        if (direction === 'h' && !width) { throw "If you want to use a horizontal sprite, JSMoviclip need a width"; }
        if (!nbframe) { throw "If you want to use a horizontal of vertical sprite, JSMoviclip need a number of frame"; }

        var i = 0;
        for (; i < nbframe; i++) {
            this.frames.push({
                x: (direction === 'h' ? i * width : 0),
                y: (direction === 'v' ? i * height : 0)
            });
        }
        i = null;
        return this._cacheFrames()._calculateFrames();
    }
    /**
     * @return way (int) of playing : 1 normal way, -1 inverted way
     */
    getWay() {
        return this._way;
    }
    /**
     * change the way of playing
     * @param way int : 1 normal way, -1 inverted way
     */
    changeWay(way, keepFrame) {
        if (way === this._way) { return this; }
        keepFrame = !!keepFrame;
        if (keepFrame === true) {
            this._idx = this._framesNumber - this._idx;
        }
        this._way = way;
        return this._calculateFrames();
    }
    clearLoopBetween() {
        this.firstFrame = 1;
        this.lastFrame = this._framesNumber;
        return this;
    }
    loopBetween(firstFrame, lastFrame) {
        if (firstFrame >= lastFrame) { firstFrame = lastFrame; throw 'Firstframe and lastframe are equals or inverted'; }
        this.firstFrame = Math.max(firstFrame, 1);
        this.lastFrame = Math.min(lastFrame, this._framesNumber);
        if (this._idx < this.firstFrame - 1 || this._idx > this.lastFrame - 1) { this._idx = this.firstFrame - 1; }
        return this;
    }
    currentFrame() {
        return this._idx + 1;
    }
    prevFrame() {
        var current = this.currentFrame();
        return this.gotoAndStop(current <= this.firstFrame ? this.lastFrame : current - 1);
    }
    nextFrame() {
        var current = this.currentFrame();
        return this.gotoAndStop(current >= this.lastFrame ? 1 : current + 1);
    }
    toggle(loop) {
        return !this.playing ? this.play(loop) : this.stop();
    }
    play(loop) {
        if (this.playing) { return this; }
        if (this._idx === this.lastFrame - 1) { this._idx = this.firstFrame - 1; }
        this.playing = true;
        this.loop = !!loop;
        this._enterFrame();
        return this;
    }
    stop() {
        this.playing = false;
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }
        if (this.stopCallback) { this.stopCallback(); }
        return this;
    }
    gotoAndPlay(frame, loop) {
        this._idx = Math.min(Math.max(frame, this.firstFrame), this.lastFrame) - 1;
        return this.play(loop);
    }
    gotoAndStop(frame) {
        this._idx = Math.min(Math.max(frame, this.firstFrame), this.lastFrame) - 1;
        this.loop = false;
        this.playing = false;
        this._enterFrame();
        return this;
    }
}
export default AniClip;