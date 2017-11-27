let designed_world ={
    1:{2:0}
    //...
}
let small_world_array = [
    //loaded tile layers as small world
];
let loaded_world_map = {};
function get_adjacent_indexes(x, y){
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
function load_world(x, y){
    let small_world = {};
    small_world.x = Math.floor(x / 1024);
    small_world.y = Math.floor(y / 1024);
    let adjacent_sw_array = get_adjacent_indexes(small_world.x, small_world.y);
    adjacent_sw_array.forEach( coor =>{
        if( !loaded_world_map[ coor[0] ] ){
            loaded_world_map[ coor[0] ] = {}
        }
        if( !loaded_world_map[coor[0]][coor[1]] ){
            //let's skip designed_world for now
            if(small_world_array.length > 0){
                let sel_index = g.randomInt(0, small_world_array.length -1);
                
                
                loaded_world_map[coor[0]][coor[1]] = sel_index;
            }
        }
    })
}