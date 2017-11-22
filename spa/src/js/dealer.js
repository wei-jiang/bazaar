import game from '../game/game';
import net from '../net'
export default {
    "帮助": function (result, points) {
        //h
        phonon.navigator().changePage('help', '');
    },
    "移动": function (result, points) {
        //随便一杠
        if( !points[points.length - 1].X ){
            points.pop()
        }
        let p_begin = points[0],
            p_end = points[points.length - 1];
        let dx = p_end.X - p_begin.X,
            dy = p_end.Y - p_begin.Y;     
        game.mplayer.move(dx, dy)
    },
    "聊天": function (result, points) {
        //c
        phonon.notif("聊天 功能开发中……", 3000);
    },
    "商品": function (result, points) {
        //p
        phonon.navigator().changePage('goods', '');
    },
    "订单": function (result, points) {
        //o
        alert("订单 功能开发中……")
        game.remove_player(wi.openid)
    },
    "通知": function (result, points) {
        //n
        alert("通知 界面开发中……")
    },
    "手势": function (result, points) {
        //g
        phonon.navigator().changePage('gestures', '');
    },
    no_recognize : points =>{
        console.log('in no_recognize')
        if( !points[points.length - 1].X ){
            points.pop()
        }
        let p_begin = points[0],
            p_end = points[points.length - 1];
        let dx = p_end.X - p_begin.X,
            dy = p_end.Y - p_begin.Y;     
        game.mplayer.move(dx, dy)
        let data = game.mplayer.get_loc();
        data.openid = wi.openid;
        data.dx = dx;
        data.dy = dy;
        net.emit('player_move', data)
    },
    few_touch : (points, e) =>{
        // console.log('in few_touch', e)
        if( !points[points.length - 1].X ){
            points.pop()
        }
        let p = points[points.length - 1];
        game.test_hit(p.X, p.Y);
    },
    //ch stand for canvas handler
    touchstart:function( ch ) {

    },
    touchend:function( ch ) {
        ch.clear()
    }
}