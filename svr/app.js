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
let uuid2sock = {}

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
    console.log(resp);
    if (resp.result_code[0] == "0") {
        var order_id = Array.isArray(resp.out_trade_no) ? resp.out_trade_no[0] : resp.out_trade_no;
        // var cli_dealer = pending_order_map[order_id];
        // if (cli_dealer) {
        //     cli_dealer.notify_pay_success(resp);
        // }
    }
    else {
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
    var data = req.body;
    let order_id = new moment().format("YYYYMMDDHHmmssSSS");
    let order_info = {
        notify_url: get_myurl_by_req(req) + '/notify',
        mch_id: '102580087392',
        body: "微信测试商品",
        out_trade_no: order_id,
        total_fee: 1,
        sub_openid: data.openid,
        mch_create_ip: get_req_ip(req)
    };
    sp_pay.get_wx_jspay_para(order_info, function (err, result) {
        console.log(err, result);
        if (result && result.result_code == '0') {
            // let url = `https://pay.swiftpass.cn/pay/jspay?token_id=${result.token_id}&showwxtitle=1`;
            let pi = JSON.parse(result.pay_info);
            delete pi.status;
            delete pi.callback_url;
            // delete pi.paySign;
            // pi.appId = 'wxa71182a49ab08050';
            // pi.paySign = sign_jsapi_pay_data(pi);
            console.log(pi);
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
    socket.on('player_online', function (data, fn) {
        socket.removeAllListeners();
        socket.player = data;
        uuid2sock[data.openid] = socket;
        socket.on('disconnect', function () {
            delete uuid2sock[data.openid];
            socket.broadcast.emit('player_offline', data);
        });
        let online_players = _.map(uuid2sock, s => {
            return s.player;
        });
        socket.broadcast.emit('new_player_online', data);
        // console.log(online_players);
        fn(online_players);
    });
    socket.on('player_move', function (data) {
        socket.player.x = data.x;
        socket.player.y = data.y;
        socket.broadcast.emit('player_move', data);
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
