
/*
This file requires these convenience functions from `plugins.js`:
`hitTestTile`
`getIndex`
`getPoints`
`makeTiledWorld`
`worldCamera`
*/

/*
Ga supports game maps and levels created using the popular Tiled
Editor level designer:

www.mapeditor.org
   
See the example `tileEditorSupport.html` for instructions on how to
integrate Tiled Editor maps into your Ga code.

Before you read this source code, take a close look at the
'maps/fantasy.tmx' in Tiled Editor to see how it was structured.
Observe how Tiled Editor's layers were used to create depth layers.
Also notice that the hear, skull and marmot tileset images all have
custom `name` properties so that they're easy to access in the game
code.

This is a rather extreme example. In a production level game you
probably shouldn't blit so many individual tile sprites to so many 
depth levels, for performance reasons. It would be better to use a
single, solid background image for the whole game world, 
and just use Tiled Editor's layers to generate arrays of obstacle and
item positions. 
*/

//Create a new GA instance, and start it.
//Load the tileset PNG and the Tiled Editor JSON file

var g = ga(768, 768, setup,
    [
        "res/fantasy.png",
        "res/walkcycle.png",
        "res/puzzler.otf",
        "res/fantasy.json"
    ]
);
g.start();
g.scaleToWindow();
//Set the frames per second to 30
g.fps = 30;

//Declare global sprites, objects, and variables
//that you want to access in all the game functions and states

var world, elf, elfTextures, world, camera,
    itemsLayer, itemsMapArray, items, message,
    calculateNewPath, currentPathSprites = [],
    destinationX, destinationY;

//A `setup` function that will run only once.
//Use it for initialization tasks
function setup() {

    //Make the world from the Tiled JSON data and the tileset PNG image
    world = g.makeTiledWorld(
        "res/fantasy.json",
        "res/fantasy.png"
    );

    //Create the elf sprite using a filmstrip of animation frames
    elf = g.sprite(g.filmstrip("res/walkcycle.png", 64, 64));
    elf.title = g.text("外星人");
    elf.update = function (){      
        elf.putTop( elf.title );
    }
    /*
    Tiled Editor lets you create generic objects. Take a look at the
    `fantasy.tmx` file you'll see that the elf sprite was actually
    created using of these generic objects. The object doesn't define
    the elf's appearance, only its size and position. We're going to use
    the object's data to position the elf sprite in the game world.
    Position the elf sprite in the same place as the elf object
    */

    elf.x = world.getObject("elf").x;
    elf.y = world.getObject("elf").y;

    //Add the elf sprite the map's "objects" layer group
    var objectsLayer = world.getObject("objects");
    objectsLayer.addChild(elf);

    //If you want to, add the sprite to a different world layer,
    //you can do it like this:
    //world.getObject("treeTops").addChild(elf);

    //Use `world.getObjects` to get an array of objects on the map
    //console.log(world.getObjects("marmot", "skull", "heart"));

    //Get all the items on the items layer (the skull, marmot and heart). 
    //The `itemLayer` group's `children` array contains all of them.
    itemsLayer = world.getObject("items");

    //Clone the `itemLayer.children` array so that you have your own
    //array of all three item sprites (the heart, skull and marmot)
    items = itemsLayer.children.slice(0);

    /*
    If you ever need to extract sprites with specific gid numbers in a 
    layer that contains different kinds of things, you can do it like this:
  
    items = itemsLayer.children.map(function(sprite) {
      if (sprite.gid !== 0) return sprite; 
    });
  
    */
    //Get a reference to the array containing the map items
    itemsMapArray = world.getObject("items").data;

    /*
    Create the camera and center it over the elf.
    The `worldCamera` method returns a `camera` object
    with `x` and `y` properties. It has
    two useful methods: `centerOver`, to center the camera over
    a sprite, and `follow` to make it follow a sprite.
    `worldCamera` arguments: worldObject, theCanvas
    The worldObject needs to have a `width` and `height` property.
    */

    camera = g.worldCamera(world, g.canvas);
    camera.centerOver(elf);

    //Define a `collisionArea` on the elf that will be sensitive to
    //collisions. `hitTestTile` will use this information later to check
    //whether the elf is colliding with any of the tiles

    elf.collisionArea = { x: 22, y: 44, width: 20, height: 20 };

    /*
    Define the elf's animation states. These are names that correspond
    to frames and frame sequences in the elf's animation frames. It's
    entirely up to you to decide what you want to call these states.
    Define animation sequences as a 2-value array:
  
        wallkleft: [startFrame, endFrame]
  
    The first value is the frame number that the sequence should start
    at, and the second value is the frame number that the sequence
    should end at.
    */

    elf.states = {
        up: 0,
        left: 9,
        down: 18,
        right: 27,
        walkUp: [1, 8],
        walkLeft: [10, 17],
        walkDown: [19, 26],
        walkRight: [28, 35]
    };

    //Use the `show` method to display the elf's `right` state
    elf.show(elf.states.right);
    elf.fps = 18;

    //Create some keyboard objects
    leftArrow = g.keyboard(37);
    upArrow = g.keyboard(38);
    rightArrow = g.keyboard(39);
    downArrow = g.keyboard(40);

    //Assign key `press` and release methods that
    //show and play the elf's different states
    leftArrow.press = function () {
        elf.playSequence(elf.states.walkLeft);
        elf.vx = -2;
        elf.vy = 0;
    };
    leftArrow.release = function () {
        if (!rightArrow.isDown && elf.vy === 0) {
            elf.vx = 0;
            elf.show(elf.states.left);
        }
    };
    upArrow.press = function () {
        elf.playSequence(elf.states.walkUp);
        elf.vy = -2;
        elf.vx = 0;
    };
    upArrow.release = function () {
        if (!downArrow.isDown && elf.vx === 0) {
            elf.vy = 0;
            elf.show(elf.states.up);
        }
    };
    rightArrow.press = function () {
        elf.playSequence(elf.states.walkRight);
        elf.vx = 2;
        elf.vy = 0;
    };
    rightArrow.release = function () {
        if (!leftArrow.isDown && elf.vy === 0) {
            elf.vx = 0;
            elf.show(elf.states.right);
        }
    };
    downArrow.press = function () {
        elf.playSequence(elf.states.walkDown);
        elf.vy = 2;
        elf.vx = 0;
    };
    downArrow.release = function () {
        if (!upArrow.isDown && elf.vx === 0) {
            elf.vy = 0;
            elf.show(elf.states.down);
        }
    };

    //Make a text object and set it to be invisible when the game
    //first starts.
    message = g.text("No items found", "12px puzzler", "black");
    message.setPosition(10, 10);
    message.visible = false;
    calculateNewPath = false;

    //The mouse pointer's `release` function runs the code that
    //calculates the shortest path and draws that sprites that
    //represent it
    g.pointer.release = () => {

        //Set the new path's desination to the pointer's
        //current x and y position
        destinationX = g.pointer.x;
        destinationY = g.pointer.y;
        // console.log(destinationX, destinationY);
        //Set `calculateNewPath` to true
        calculateNewPath = true;
    };

    //Change the game state to `play`
    g.state = play;
}

//The `play` function will run in a loop
function play() {
    mov2dest();
    //Move the elf and constrain it to the world boundaries
    //(-10 and -18 are to compensate for image padding around the sprite)
    elf.x = Math.max(-18, Math.min(elf.x + elf.vx, world.width - elf.width + 18));
    elf.y = Math.max(-10, Math.min(elf.y + elf.vy, world.height - elf.height));

    //Make the camera follow the elf
    camera.follow(elf);

    //Get a reference to the obstacles map array and use `hitTestTile`
    //check for a collision between the elf and the ground tiles
    //(See the example `tiledEditorSupport.html` for details on how to
    //`hitTestTile` - it's not difficult)
    var obstaclesMapArray = world.getObject("obstacles").data;
    var elfVsGround = g.hitTestTile(elf, obstaclesMapArray, 0, world, "every");

    //If the elf isn't touching any ground tiles, it means its touching
    //an obstacle, like a bush, the bottom of a wall, or the bottom of a
    //tree
    if (!elfVsGround.hit) {
        //To prevent the elf from moving, subtract its velocity from its position
        elf.x -= elf.vx;
        elf.y -= elf.vy;
        elf.vx = 0;
        elf.vy = 0;

        //You can find the gid number of the thing the elf hit like this:
        //console.log(obstaclesMapArray[elfVsGround.index]);
    }

    //Check for a collision with the items
    var elfVsItems = g.hitTestTile(elf, itemsMapArray, 0, world, "some");

    //You'll know whether the elf is touching an item if `elfVsItem.hit`
    //isn't `0`. `0` indicates a empty cell in the array, so any tile
    //doesn't have a grid index number (`gid`) of `0` must be one of the
    //items (The heart, marmot or skull).
    //If the elf is touching an item tile, filter through all the items
    //in the `items` array and remove the item being touched.
    if (!elfVsItems.hit) {
        items = items.filter(function (item) {
            //Does the current item match the elf's position?
            if (item.index === elfVsItems.index) {
                //Display the message
                message.visible = true;
                message.content = "You found a " + item.name;
                //Make the message disappear after 3 seconds
                g.wait(3000, function () {
                    message.visible = false;
                });
                //Remove the item
                itemsMapArray[item.index] = 0;
                g.remove(item);
                return false;
            } else {
                return true;
            }
        });
    }
}

function mov2dest() {
    //Find out if the alien is centered over a tile cell
    if (isCenteredOverCell(elf)) {
        console.log()
        //If `calculateNewPath` has been set to `true` by the pointer,
        //Find the new shortest path between the alien and the pointer's
        //x and y position (`destinationX` and `destinationY`)
        if (calculateNewPath) {
            let obstaclesArray = world.getObject("obstacles").data;
            //calculate the shortest path
            let path = shortestPath(getIndex(elf.centerX, elf.centerY, 32, 32, 24), //The start map index
                getIndex(destinationX, destinationY, 32, 32, 24), //The destination index
                obstaclesArray, //The map array
                24, //Map width, in tiles
                [8, 9, 31, 32, 34, 35], //Obstacle gid array
                "manhattan" //Heuristic to use
            );

            //Remove the first node of the `path` array. That's because we
            //don't need it: the alien sprite's current location and the
            //first node in the `path` array share the same location.
            //In the code ahead we're going to tell the alien sprite to move
            //from its current location, to first new node in the path.
            path.shift();
            //Display the shortest path
            path.forEach(node => {

                //Figure out the x and y location of each square in the path by
                //multiplying the node's `column` and `row` by the height, in
                //pixels, of each square: 64
                let x = node.column * 64,
                    y = node.row * 64;

                //Create the square sprite and set it to the x and y location
                //we calculated above
                let square = g.circle(32, "green");
                square.x = x + 16;
                square.y = y + 16;

                //Push the sprites into the `currentPath` array,
                //so that we can easily remove them the next time
                //the mouse is clicked
                currentPathSprites.push(square);
            });
            //If the path isn't empty, fill the `wayPoints2DArray` with
            //sub arrays of x/y position value pairs.
            if (path.length !== 0) {

                //Get a 2D array of x/y points
                wayPoints2DArray = path.map(node => {

                    //Figure out the x and y location of each square in the path by
                    //multiplying the node's `column` and `row` by the height, in
                    //pixels, of each cell: 64
                    let x = node.column * 64,
                        y = node.row * 64;

                    //Return a sub-array containing the x and y position of each node
                    return [x, y];
                });
            }

            //Set `calculateNewPath` to `false` so that this block of code.
            //won't run again inside the game loop. (It can be set to `true`
            //again by clicking the pointer.)
            calculateNewPath = false;
        }

        if (wayPoints2DArray.length !== 0) {

            //Left
            if (wayPoints2DArray[0][0] < elf.x) {
                elf.vx = -2;
                elf.vy = 0;

                //Right
            } else if (wayPoints2DArray[0][0] > elf.x) {
                elf.vx = 2;
                elf.vy = 0;

                //Up
            } else if (wayPoints2DArray[0][1] < elf.y) {
                elf.vx = 0;
                elf.vy = -2;

                //Down
            } else if (wayPoints2DArray[0][1] > elf.y) {
                elf.vx = 0;
                elf.vy = 2;
            }

            //Remove the current way point, so that next time around
            //the first element in the `wayPoints2DArray` will correctly refer
            //to the next way point that that alien sprite has
            //to move to
            wayPoints2DArray.shift();
            g.remove(currentPathSprites.shift());
            //If there are no way points remaining,
            //set the alien's velocity to 0
        } else {

            elf.vx = 0;
            elf.vy = 0;
        }
    }
}