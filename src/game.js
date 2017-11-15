import './libs/ga.all.min.js';
// require('./libs/plugins.min.js')


var world, mplayer, faceTo, camera;
var g = ga(1080, 1920, setup,
  [
    "res/ornament.png",
    "res/walkcycle.png",
    "res/bazaar.json"
  ]
);

// g.scaleToWindow('#D8EE94');
//Set the frames per second to 30
g.fps = 30;
function setup() {

  //Make the world from the Tiled JSON data and the tileset PNG image
  world = g.makeTiledWorld(
    "res/bazaar.json",
    "res/ornament.png"
  );
  function resize() {
    g.canvas.width = window.innerWidth;
    g.canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();
  g.state = play;
}
function play() {

}
export let init_game = ()=>{
    g.start();
}