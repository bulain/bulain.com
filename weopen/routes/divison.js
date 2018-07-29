var express = require('express');
var request = require('superagent');
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
        request.get(url)
            .end((err, resx) => {
                var data = resx.text;

                var $ = cheerio.load(data);
                var trs = $('tbody').find('tr');
                var arr = [];
                for (var i = 3; i < trs.length; i++) {
                    var tds = $(trs[i]).find('td');
                    if ($(tds[1]).text())
                        arr.push({ code: $(tds[1]).text(), ltext: $(tds[2]).text() });
                }

                mongo.drop('divison');
                mongo.insertMany('divison', arr);

                res.render('divison', { title: 'Divison' });
            });

    } else if (req.body.action == 'taobao') {

        (async function () {
            await mongo.drop('taobao');
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
    } else if (req.body.action == 'town') {
        //https://lsp.wuliu.taobao.com/locationservice/addr/output_address_town_array.do?l1=440000&l2=440700&l3=440785&lang=zh-S&_ksTS=1532877390692_7890&callback=jsonp
        function jsonp(data) {
            console.log(data.result);
        };

        request.get('https://lsp.wuliu.taobao.com/locationservice/addr/output_address_town_array.do')
            .query({ l1: '440000', l2: '440700', l3: '440785', lang: 'zh-S', _ksTS: '1532877390692_7890', callback: 'jsonp' })
            .end((err, resx) => {
                eval(resx.text);
                res.render('divison', { title: 'Divison' });
            });
    }

});

module.exports = router;
