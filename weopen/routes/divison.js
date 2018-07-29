var express = require('express');
var http = require('http');
var cheerio = require('cheerio');
var mongo = require('../lib/mongo');
var taobao = require('../lib/taobao');

var router = express.Router();
router.get('/', function (req, res, next) {
    var data = {};

    res.render('divison', { title: 'Divison', data: data });
});
router.post('/', function (req, res, next) {

    console.log(req.body);

    if (req.body.action == 'civil') {

        var url = req.body.url || 'http://preview.www.mca.gov.cn/article/sj/xzqh/2018/201805/20180506280855.html';
        var buffers = [];
        var reqx = http.request(url, function (resx) {
            resx.on('data', function (chunk) {
                buffers.push(chunk);
            }).on('end', function () {
                var data = Buffer.concat(buffers);
                var $ = cheerio.load(data);
                var trs = $('tbody').find('tr');
                var arr = [];
                for (var i = 3; i < trs.length; i++) {
                    var tds = $(trs[i]).find('td');
                    if ($(tds[1]).text())
                        arr.push({ code: $(tds[1]).text(), ltext: $(tds[2]).text() });
                }

                mongo.dropCollection('divison');
                mongo.insertMany('divison', arr);

                res.render('divison', { title: 'Divison' });
            });
        }).on('error', function (e) {
            console.log(e);
            res.render('divison', { title: 'Divison' });
        });
        reqx.end();

    } else if (req.body.action == 'taobao') {

        (async function () {
            await mongo.dropCollection('taobao');
            var arr = [];
            var hm = [];

            hm = taobao.province;
            for (var a in hm) {
                for (var b in hm[a]) {
                    arr.push({ code: hm[a][b][0], text: hm[a][b][1][0] });
                }
            }
            await mongo.insertMany('taobao', arr);
            arr = [];

            hm = taobao.city;
            for (var b in hm) {
                if (hm[b][3] == '0') {
                    arr.push({ code: hm[b][0], text: hm[b][1][0], parent: hm[b][2] });
                } else if (hm[b][3] == '1') {
                } else if (hm[b][3] == '2') {
                } else if (hm[b][3] == '3') {
                }
            }
            await mongo.insertMany('taobao', arr);
            arr = [];

            hm = taobao.hkmc;
            for (var b in hm) {
                if (hm[b][2] == '1') {
                    arr.push({ code: hm[b][0], text: hm[b][1][0] });
                } else {
                    arr.push({ code: hm[b][0], text: hm[b][1][0], parent: hm[b][2] });
                }
            }
            await mongo.insertMany('taobao', arr);
            arr = [];

            hm = taobao.taiwan;
            for (var b in hm) {
                if (hm[b][2] == '2') {
                    arr.push({ code: hm[b][0], text: hm[b][1][0] });
                } else {
                    arr.push({ code: hm[b][0], text: hm[b][1][0], parent: hm[b][2] });
                }
            }
            await mongo.insertMany('taobao', arr);
        })();


        res.render('divison', { title: 'Divison' });
    }

});

module.exports = router;
