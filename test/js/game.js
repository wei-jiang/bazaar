const world_size = 1024;
const world_center = world_size/2;
var g = ga(512, 512, setup,
    [
        "res/walkcycle.png",
        "res/gnd.png"
    ]
);
g.start();
// g.scaleToWindow();
//Set the frames per second to 30
g.fps = 30;

//Declare global sprites, objects, and variables
//that you want to access in all the game functions and states

var world, mplayer, camera, craft,coordinate;

//A `setup` function that will run only once.
//Use it for initialization tasks
function setup() {

    //Make the world from the Tiled JSON data and the tileset PNG image
    let small_world = {
        clone: () => {
            return g.sprite("res/gnd.png")
        }
    }
    world = g.staticGroup();
    world.width = world_size;
    world.height = world_size;
    // world.setPosition(-32768, -32768);
    // craft = g.emptyGroup();
    world.loaded_world_map = {};
    world.candidate = [];
    world.candidate.push(small_world);
    mplayer = g.sprite(g.filmstrip("res/walkcycle.png", 64, 64));
    // mplayer.title = g.text("外星人");
    // mplayer.update = function (){      
    //     mplayer.putTop( mplayer.title );
    // }
    coordinate = g.text("(0,0)", "40px sans-serif", "blue");
    coordinate.setPosition(10, 10);
    world.add(mplayer);
    mplayer.setPosition(world_center, world_center);
    load_own_world(world, mplayer);
    
    camera = g.worldCamera(world, g.canvas);
    camera.centerOver(mplayer);
    window.onload = window.onresize = function fit_canvas() {
        camera.width = g.canvas.width = window.innerWidth;
        camera.height = g.canvas.height = window.innerHeight;
    };

    mplayer.collisionArea = { x: 22, y: 44, width: 20, height: 20 };

    mplayer.states = {
        up: 0,
        left: 9,
        down: 18,
        right: 27,
        walkUp: [1, 8],
        walkLeft: [10, 17],
        walkDown: [19, 26],
        walkRight: [28, 35]
    };

    //Use the `show` method to display the mplayer's `right` state
    mplayer.show(mplayer.states.right);
    mplayer.fps = 18;

    //Create some keyboard objects
    leftArrow = g.keyboard(37);
    upArrow = g.keyboard(38);
    rightArrow = g.keyboard(39);
    downArrow = g.keyboard(40);

    //Assign key `press` and release methods that
    //show and play the mplayer's different states
    leftArrow.press = function () {
        mplayer.playSequence(mplayer.states.walkLeft);
        mplayer.vx = -2;
        mplayer.vy = 0;
    };
    leftArrow.release = function () {
        if (!rightArrow.isDown && mplayer.vy === 0) {
            mplayer.vx = 0;
            mplayer.show(mplayer.states.left);
        }
    };
    upArrow.press = function () {
        mplayer.playSequence(mplayer.states.walkUp);
        mplayer.vy = -2;
        mplayer.vx = 0;
    };
    upArrow.release = function () {
        if (!downArrow.isDown && mplayer.vx === 0) {
            mplayer.vy = 0;
            mplayer.show(mplayer.states.up);
        }
    };
    rightArrow.press = function () {
        mplayer.playSequence(mplayer.states.walkRight);
        mplayer.vx = 2;
        mplayer.vy = 0;
    };
    rightArrow.release = function () {
        if (!leftArrow.isDown && mplayer.vy === 0) {
            mplayer.vx = 0;
            mplayer.show(mplayer.states.right);
        }
    };
    downArrow.press = function () {
        mplayer.playSequence(mplayer.states.walkDown);
        mplayer.vy = 2;
        mplayer.vx = 0;
    };
    downArrow.release = function () {
        if (!upArrow.isDown && mplayer.vx === 0) {
            mplayer.vy = 0;
            mplayer.show(mplayer.states.down);
        }
    };
    console.log('mplayer',mplayer.x, mplayer.y);
    //Change the game state to `play`
    g.state = play;
}

//The `play` function will run in a loop
function play() {
    coordinate.content = `(${mplayer.x-world_center},${mplayer.y-world_center})`;
    g.move(mplayer)
    g.contain(mplayer, world)
    camera.follow(mplayer);
    load_own_world(world, mplayer);

    // var obstaclesMapArray = world.getObject("obstacles").data;
    // var elfVsGround = g.hitTestTile(mplayer, obstaclesMapArray, 0, world, "every");

    // if (!elfVsGround.hit) {
    //     //To prevent the mplayer from moving, subtract its velocity from its position
    //     mplayer.x -= mplayer.vx;
    //     mplayer.y -= mplayer.vy;
    //     mplayer.vx = 0;
    //     mplayer.vy = 0;

    // }

}
