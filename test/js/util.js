const world_width = 512;
const world_height = 512;
let designed_world ={
    1:{2:0}
    //...
}

function cur_worlds(x, y){
    return [
        [x, y],
        [x, y-1],
        [x+1, y-1],
        [x+1, y],
        [x+1, y+1],
        [x, y+1],
        [x-1, y+1],
        [x-1, y],
        [x-1, y-1]
    ];
}
function load_own_world(world, player){
    let map_x = Math.floor(player.x / world_width);
    let map_y = Math.floor(player.y / world_height);
    if(player.last_map && player.last_map.x == map_x && player.last_map.y == map_y ){
        return world;
    }
    player.last_map = {
        x:map_x,
        y:map_y
    }
    let adjacent_sw_array = cur_worlds(map_x, map_y);
    // console.log(adjacent_sw_array);
    let loaded_map = world.loaded_world_map;
    let small_worlds = adjacent_sw_array.map( coor =>{
        let map_x = coor[0], map_y = coor[1];
        if( !loaded_map[ map_x ] ){
            loaded_map[ map_x ] = {}
        }
        if( !loaded_map[map_x][map_y] ){
            //let's skip designed_world for now
            if(world.candidate.length > 0){
                let sel_index = g.randomInt(0, world.candidate.length -1);
                let thisMap = world.candidate[sel_index].clone()
                thisMap.map_x = map_x;
                thisMap.map_y = map_y;
                world.addChild(thisMap)
                thisMap.setPosition(map_x*world_width, map_y*world_height);
                // console.log(thisMap.x, thisMap.y, thisMap.layer);
                loaded_map[map_x][map_y] = thisMap;                
            }
        }
        return loaded_map[map_x][map_y];
    })
    player.layer = 9;
    console.log('world.children.length:' + world.children.length);
    console.log('world.width:' + world.width + '; world.height:' + world.height);
    console.log('world.x:' + world.x + '; world.y:' + world.y);
    if(world.children.length > 10){
        world.children.forEach( m =>{
            if( Math.abs( Math.abs(m.x) - Math.abs(player.x) ) > 512 
                && Math.abs( Math.abs(m.y) - Math.abs(player.y) ) > 512) {
                loaded_map[m.map_x][m.map_y] = null;
                g.remove(m);
            }
        })
    }
    console.log('after clean world.children.length=' + world.children.length);
    return world;
}