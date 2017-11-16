export default {
    "帮助": function (result, points) {
        //h
        phonon.navigator().changePage('help', '');
    },
    "移动": function (result, points) {
        //随便一杠
        alert("移动 功能开发中……")
    },
    "聊天": function (result, points) {
        //c
        alert("聊天 功能开发中……")
    },
    "商品": function (result, points) {
        //p
        alert("商品 功能开发中……")
    },
    "订单": function (result, points) {
        //o
        alert("订单 功能开发中……")
    },
    "通知": function (result, points) {
        //n
        alert("通知 界面开发中……")
    },
    "手势": function (result, points) {
        //g
        phonon.navigator().changePage('gestures', '');
    },
    //ch stand for canvas handler
    touchstart:function( ch ) {

    },
    touchend:function( ch ) {
        ch.clear()
    }
}