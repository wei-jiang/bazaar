const request = require('request');
const querystring = require('querystring');
const moment = require('moment');
const _ = require('lodash');
const uuidv1 = require('uuid/v1');
const uuidv4 = require('uuid/v4');
const jwt = require('jsonwebtoken');
const credential = require('../secret')

let token2sock_map = {}
//winston is global
function do_login(app, io, db) {
    let nsp = io.of('/io_login');
    nsp.on('connection', function (socket) {
        console.log('io_login namespace been connected');
        socket.on('reg_login_cli', function (data) {
            token2sock_map[data.token] = socket;
            socket.on('disconnect', function () {
                delete token2sock_map[data.token];
            });
        });
    });
    app.get('/login', (req, res) => {
        let sess = req.session;
        if (!req.query.rurl || !req.query.token) {
            res.redirect('http://www.baidu.com');
        }
        if (req.query.rurl) {
            sess.rurl = req.query.rurl;
        }
        if (req.query.token) {
            sess.token = req.query.token;
        }
        const qs = querystring.stringify({
            rurl: 'https://wx.cninone.com/usr_verify'
        });
        let ua = req.headers['user-agent'];
        if (/MicroMessenger/i.test(ua)) {
            // wx browser 
            res.redirect(`https://wx.ily365.cn/oid?${qs}`);
        } else if (/AlipayClient/i.test(ua)) {
            // ali browser           
            res.redirect(`https://ali.ily365.cn/oid?${qs}`);
        } else {
            //assuming pc browser
            let token = uuidv1();
            res.render('scan_login.html', {
                token: token,
                qr_code: `https://wx.cninone.com/usr_verify?token=${token}`
            });
        }
    });
    app.get('/usr_verify', (req, res) => {
        let sess = req.session;
        let rurl = sess.rurl;
        if (!rurl) return res.redirect('http://www.baidu.com');
        let ua = req.headers['user-agent'];
        if (/MicroMessenger/i.test(ua)) {
            // wx browser 
            let id = req.query.oid;
            db.collection('weixin').findOne({
                openid: id
            })
                .then(usr => {
                    if (usr) {
                        if (sess.token) {
                            //throuh pc
                            let sock = token2sock_map[sess.token];
                            if (sock) {

                            }
                        } else {
                            //mobile directly
                            const qs = querystring.stringify({
                                ret: '0',
                                token: jwt.sign(usr, credential.token_key)
                            });
                            res.redirect(`${rurl}?${qs}`);
                        }
                    } else {
                        if (sess.token) {
                            //throuh pc
                            let sock = token2sock_map[sess.token]
                            if (sock) {

                            }
                        } else {
                            //mobile directly
                            const qs = querystring.stringify({
                                ret: '0',
                                token: jwt.sign(usr, credential.token_key)
                            });
                            res.redirect(`${rurl}?${qs}`);
                        }
                    }
                })
        } else if (/AlipayClient/i.test(ua)) {
            // ali browser
        } else {
            //assuming pc browser
            res.redirect('http://www.baidu.com');
        }
    });
}

module.exports = do_login;