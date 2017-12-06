var fs = require('fs');
var path = require('path');
var app = require('express')();
const nunjucks = require('nunjucks');
var helmet = require('helmet');
var cors = require('cors');
var session = require('express-session');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
var xmlparser = require('express-xml-bodyparser');
var request = require('request');
const querystring = require('querystring');
var jsSHA = require('jssha');
var xml = require('xml');
const favicon = require('serve-favicon');
const moment = require('moment');
var SPPay = require('sp-pay');
var _ = require('lodash');
var md5 = require('md5');
const uuidv1 = require('uuid/v1');
const uuidv4 = require('uuid/v4');
let mongo = require('mongodb'),
    MongoClient = mongo.MongoClient,
    ObjectId = mongo.ObjectID,
    Binary = mongo.Binary,
    g_db,
    m_url = 'mongodb://freego:freego2016@cninone.com:27017/wxgames';

MongoClient.connect(m_url)
    .then(db => {
        g_db = db;
        console.log('connect to mongodb success')
    })
    .catch(err => console.log('connect to mongodb failed', err))
app.set('port', process.env.PORT || 7900);

nunjucks.configure('views', {
    autoescape: true,
    express: app
});
app.use(session({ secret: 'freego2017-11-07' }));
app.use(require('express').static(__dirname + '/public'));

app.use(helmet());
app.use(cors());
app.use(xmlparser());
app.use(cookieParser());
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));
global.winston = require('winston');
var logDir = 'log';
// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}
global.winston = new (winston.Logger)({
    transports: [
        new (require('winston-daily-rotate-file'))({
            filename: logDir + '/-ssm.log',
            timestamp: function () {
                return new moment().format("YYYY-MM-DD HH:mm:ss SSS");
            },
            datePattern: 'yyyy-MM-dd',
            prepend: true,
            localTime: true
        })
    ]
});

server.listen(app.get('port')
    // , 'localhost'
    , () => {
        console.log("Express server listening on port " + app.get('port'));
    });
var sp_pay = new SPPay({
    mch_id: "102580087392",
    partner_key: "324a076a3f4ea0d6be16893ffef53a16"
});
let uuid2sock = {}, pending_order_map = {};

get_myurl_by_req = (req) => {
    //depend on nginx config
    var host = req.headers['host'];
    let proto = req.headers['x-forwarded-proto'];
    let port = req.headers['x-forwarded-port'];
    let url = `${proto}://${host}:${port}`
    // console.log(req.headers);
    console.log(url);
    return url;
}
get_myurl_by_sock = (sock) => {
    //depend on nginx config
    var host = sock.handshake.headers['host'];
    let proto = sock.handshake.headers['x-forwarded-proto'];
    let port = sock.handshake.headers['x-forwarded-port'];
    let url = `${proto}://${host}:${port}`
    // console.log(sock.handshake.headers);
    console.log(url);
    return url;
}
function get_sock_remote_ip(sock) {
    var rip = sock.handshake.headers['x-forwarded-for'];
    //console.log(rip);
    return rip;
}
function get_req_ip(req) {
    var cli_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    cli_ip = Array.isArray(cli_ip) ? cli_ip[0] : cli_ip;
    if (cli_ip.indexOf(',') > 0) {
        cli_ip = cli_ip.substring(0, cli_ip.indexOf(','));
    }
    return cli_ip;
}
app.post('/notify', (req, res) => {
    var resp = req.body.xml;
    console.log("swiftpass callback...");
    // console.log(resp);
    if (resp.result_code[0] == "0") {
        var order_id = Array.isArray(resp.out_trade_no) ? resp.out_trade_no[0] : resp.out_trade_no;
        var cli_dealer = pending_order_map[order_id];
        if (cli_dealer) {
            cli_dealer.notify_pay_success(resp);
        } else {
            console.log(`can not find ${order_id} dealer`, pending_order_map);
        }
    } else {
        console.log(resp.err_msg);
    }
    res.end('success');
});
app.post('/save_gestures', (req, res) => {
    // winston.info(`in save_gestures`, req.body);
    let fn = new moment().format("YYYYMMDDHHmmssSSS");
    fs.writeFile(fn, JSON.stringify(req.body), err => {
        res.end('ok');
    })
});

app.post('/buy_product', function (req, res) {
    if (!req.body) return res.sendStatus(400);
    let data = req.body;
    console.log(data)
    let order_id = data.openid.substring(0, 4) + new moment().format("YYYYMMDDHHmmssSSS");//uuidv1(); too long
    let order_info = {
        notify_url: get_myurl_by_req(req) + '/notify',
        mch_id: '102580087392',
        body: data.title,
        out_trade_no: order_id,
        total_fee: data.total,
        sub_openid: data.openid,
        mch_create_ip: get_req_ip(req)
    };
    sp_pay.get_wx_jspay_para(order_info, function (err, result) {
        // console.log(err, result);
        if (result && result.result_code == '0') {
            // let url = `https://pay.swiftpass.cn/pay/jspay?token_id=${result.token_id}&showwxtitle=1`;
            let pi = JSON.parse(result.pay_info);
            delete pi.status;
            delete pi.callback_url;
            cache_order(order_id, data);
            // console.log(pi);
            res.json(pi);
        } else {
            res.json({
                ret: -1
            });
        }
    });
});

app.get('/', function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(JSON.stringify(req.query));
});


app.get('/bazaar', function (req, res) {
    let ua = req.headers['user-agent'];
    let is_wx_agent = /MicroMessenger/i.test(ua);
    if (!is_wx_agent) {
        return res.redirect('http://www.baidu.com');
    }
    var openid = req.query.openid;
    if (!openid) {
        const qs = querystring.stringify({
            rurl: 'http://wx.cninone.com/bazaar'
        });
        let r_url = `https://wx.ily365.cn/openid?${qs}`;
        // console.log(r_url);
        res.redirect(r_url);
    } else {
        res.render('bazaar.html', req.query);
    }
});

var get_sock_remote_ip = function (sock) {
    var rip = sock.handshake.headers['x-forwarded-for'];
    //console.log(rip);
    return rip;
}
io.on('connection', function (socket) {
    console.log('connection');
    socket.on('player_online', function (data, fn) {
        socket.player = data;
        uuid2sock[data.openid] = socket;
        socket.on('disconnect', function () {
            // socket.removeAllListeners();
            // console.log('disconnect:' + data.openid);
            delete uuid2sock[data.openid];
            socket.broadcast.emit('player_offline', data);
        });
        let online_players = _.map(uuid2sock, s => {
            return s.player;
        });
        socket.broadcast.emit('new_player_online', data);
        console.log('online_players', data);
        fn(online_players);
    });
    socket.on('stop_move', function (data) {
        if (socket.player) {
            socket.player.x = data.x;
            socket.player.y = data.y;
        }
        // console.log('stop_move', data)
        socket.broadcast.emit('stop_move', data);
    });
    socket.on('player_move', function (data) {
        if (socket.player) {
            socket.player.x = data.x;
            socket.player.y = data.y;
        }
        // console.log('player_move', data)
        socket.broadcast.emit('player_move', data);
    });
    socket.on('test', function (data) {
        console.log('test', data)
    });
    socket.on('speak_to_all', function (data) {
        // console.log('speak_to_all', data)
        socket.broadcast.emit('speak_to_all', data);
    });
    socket.on('notify_seller_status', function (data) {
        // console.log('notify_seller_status', data)
        socket.broadcast.emit('notify_seller_status', data);
    });
    socket.on('get_target_goods', function (data, cb) {
        // console.log('get_target_goods', data)
        let target_sock = uuid2sock[data];
        if (target_sock) {
            target_sock.emit('get_target_goods', data, goods => {
                // console.log(goods)
                cb(goods)
            });
        } else {
            cb({ ret: -1 })
        }
    });
    socket.on('speak_to_target', function (data) {
        // console.log('speak_to_target', data)
        let target_sock = uuid2sock[data.target_oid];
        delete data.target_oid;
        target_sock && target_sock.emit('speak_to_target', data);
    });
    socket.on('change_order_status', function (data) {
        // console.log('change_order_status', data)
        g_db.collection('bazaar_orders').findOneAndUpdate(
            {
                oid: data.oid
            },
            {
                "$set": {
                    "status": data.to_status
                }
            }
        )
        .then( r=>{
            let order = r.value;
            // console.log(order)
            let noty = `买家:${order.buyer_nickname}，购买的商品（${order.title}），总价：${order.total}元。${data.to_status}`;
            let sock = uuid2sock[order.buyer_id];
            if (sock) {
                sock.emit('system_notification', noty);
            }
            sock = uuid2sock[order.seller_id];
            if (sock) {
                sock.emit('system_notification', noty);
            }
        })
    });
    socket.on('get_orders', function (openid, cb) {
        g_db.collection('bazaar_orders')
        .find({ $or: [ { buyer_id: openid }, { seller_id: openid } ] })
        .toArray()
        .then(orders=>{
            // console.log(orders)
            cb(orders)
        })
    });
    socket.on('ferret', function (name, fn) {
        fn('woot');
        socket.emit('ww', 'pp', function (data) {
            console.log('emit ww return:', data); // data will be 'woot'
        });
    });
});


// 备注：服务端签名用timeStamp、客户端发送用timestamp
function sign_jsapi_pay_data(param) {
    const partner_key = 'X5i69E6ZxL5ip15By0oUi3Fr8hINscgO';
    var querystring = Object.keys(param).filter(function (key) {
        return param[key] !== undefined && param[key] !== '' && ['pfx', 'partner_key', 'key'].indexOf(key) < 0;
    }).sort();
    // console.log(querystring);
    querystring = querystring.map(function (key) {
        return key + '=' + param[key];
    }).join("&") + "&key=" + partner_key;
    // console.log(querystring);
    return md5(querystring).toUpperCase();
}

function cache_order(oid, info) {
    pending_order_map[oid] = {
        start_point: new Date(),
        notify_pay_success: () => {
            info.oid = oid;
            info.status = '已付款';
            info.dt = moment().format("YYYY-MM-DD HH:mm:ss");
            g_db.collection('bazaar_orders').insert(info)
                .then(() => {
                    let noty = `买家:${info.buyer_nickname}，购买(${info.seller_nickname})的商品:${info.title}，总价：${info.total}元。已付款`;
                    let sock = uuid2sock[info.buyer_id];
                    if (sock) {
                        sock.emit('system_notification', noty);
                    }
                    sock = uuid2sock[info.seller_id];
                    if (sock) {
                        sock.emit('system_notification', noty);
                    }
                })
            delete pending_order_map[oid];
            console.log(`${oid} pay success!!!`);
        }
    }
}
setInterval(() => {
    //can not use _.filter, cause not a array
    _.each(pending_order_map, (o, key) => {
        let n = new Date();
        let ts = n.getTime() - o.start_point.getTime()
        //half hour
        if (ts > 30 * 60 * 1000) {
            delete pending_order_map[key];
        }
    })
}, 10 * 1000);