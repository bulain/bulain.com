var express = require('express');
var request = require('superagent');
var cheerio = require('cheerio');
var mongo = require('../lib/mongo');
var mysql = require('../lib/mysql');
var taobao = require('../lib/taobao');
var tsimple = require('../lib/tsimple');

var router = express.Router();
router.get('/', function (req, res, next) {
    var data = {};

    res.render('divison', { title: 'Divison', data: data });
});
router.post('/', function (req, res, next) {

    console.log(req.body);
    var action = req.body.action;
    var dbtype = req.body.dbtype;

    if (action == 'divison' && dbtype == 'mongodb') {

        var url = 'http://preview.www.mca.gov.cn/article/sj/xzqh/2018/201805/20180506280855.html';
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

    } else if (action == 'divison' && dbtype == 'mysql') {

        var url = 'http://preview.www.mca.gov.cn/article/sj/xzqh/2018/201805/20180506280855.html';
        var buffers = [];
        request.get(url)
            .end((err, resx) => {
                (async function () {
                    var data = resx.text;

                    var $ = cheerio.load(data);
                    var trs = $('tbody').find('tr');

                    await mysql.execute('delete from divison');
                    var d = {};
                    for (var i = 3; i < trs.length; i++) {
                        var tds = $(trs[i]).find('td');
                        if ($(tds[1]).text()) {
                            d = { code: $(tds[1]).text(), ltext: $(tds[2]).text() };
                            await mysql.execute('insert into divison (code, ltext) values (?, ?)', d.code, d.ltext);
                        };
                    }
                })();

                res.render('divison', { title: 'Divison' });
            });

    } else if (action == 'taobao' && dbtype == 'mongodb') {

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

            res.render('divison', { title: 'Divison' });
        })();

    } else if (action == 'taobao' && dbtype == 'mysql') {

        (async function () {
            await mysql.execute('delete from taobao');
            await mysql.execute('delete from talias');
            var hm = [];
            var d = {};

            hm = taobao.province;
            for (var a in hm) {
                for (var b in hm[a]) {
                    d = { code: hm[a][b][0], text: hm[a][b][1][0], remarks: a };
                    await mysql.execute('insert into taobao (code, text, parent, remarks) values (?, ?, ?, ?)', d.code, d.text, null, d.remarks);
                }
            }

            hm = taobao.city;
            var str = null;
            for (var b in hm) {
                if(hm[b][0].indexOf(',') > 0){
                    continue;
                }

                if (hm[b][3] == '0') {
                    d = { code: hm[b][0], text: hm[b][1][0], parent: hm[b][2] };
                    await mysql.execute('insert into taobao (code, text, parent) values (?, ?, ?)', d.code, d.text, d.parent);
                } else if (hm[b][3] == '1') {
                    str = hm[b][1][0].match(/(.*) \((.*)\)/);
                    d = { code: hm[b][0], ltext: str[1], rtext: str[2], text: hm[b][1][0], parent: hm[b][2], lvl: hm[b][3] };              
                    await mysql.execute('insert into talias (code, ltext, rtext, text, parent, lvl) values (?, ?, ?, ?, ?, ?)', d.code, d.ltext, d.rtext, d.text, d.parent, d.lvl);
                } else if (hm[b][3] == '2') {
                    str = hm[b][1][0].match(/(.*) \((.*)\)/);
                    d = { code: hm[b][0], ltext: str[1], rtext: str[2], text: hm[b][1][0], parent: hm[b][2], lvl: hm[b][3] };              
                    //await mysql.execute('insert into talias (code, ltext, rtext, text, parent, lvl) values (?, ?, ?, ?, ?, ?)', d.code, d.ltext, d.rtext, d.text, d.parent, d.lvl);
                } else if (hm[b][3] == '3') {
                    str = hm[b][1][0].split(' ');                    
                    d = { code: hm[b][0], ltext: str[0], rtext: str[2], text: hm[b][1][0], parent: hm[b][2], lvl: hm[b][3] };       
                        await mysql.execute('insert into talias (code, ltext, rtext, text, parent, lvl) values (?, ?, ?, ?, ?, ?)', d.code, d.ltext, d.rtext, d.text, d.parent, d.lvl);
                }
            }

            hm = taobao.hkmc;
            for (var b in hm) {
                if (hm[b][2] == '1') {
                    d = { code: hm[b][0], text: hm[b][1][0] };
                    await mysql.execute('insert into taobao (code, text, parent) values (?, ?, ?)', d.code, d.text, null);
                } else {
                    d = { code: hm[b][0], text: hm[b][1][0], parent: hm[b][2] };
                    await mysql.execute('insert into taobao (code, text, parent) values (?, ?, ?)', d.code, d.text, d.parent);
                }

            }

            hm = taobao.taiwan;
            for (var b in hm) {
                if (hm[b][2] == '2') {
                    d = { code: hm[b][0], text: hm[b][1][0] };
                    await mysql.execute('insert into taobao (code, text, parent) values (?, ?, ?)', d.code, d.text, null);
                } else {
                    d = { code: hm[b][0], text: hm[b][1][0], parent: hm[b][2] };
                    await mysql.execute('insert into taobao (code, text, parent) values (?, ?, ?)', d.code, d.text, d.parent);
                }
            }


            res.render('divison', { title: 'Divison' });
        })();
        
    } else if (action == 'tsimple' && dbtype == 'mysql') {

        (async function () {
            await mysql.execute('delete from tsimple');
            var hm = [];
            var d = {};

            hm = tsimple.city;
            for (var a in hm) {
                d = { code: a, text: hm[a][0], parent: hm[a][1] };
                await mysql.execute('insert into tsimple (code, ltext, parent) values (?, ?, ?)', d.code, d.text, d.parent);
            }

            res.render('divison', { title: 'Divison' });
        })();

        
    } else if (action == 'town' && dbtype == 'mysql') {
        //https://lsp.wuliu.taobao.com/locationservice/addr/output_address_town_array.do?l1=440000&l2=440700&l3=440785&lang=zh-S&_ksTS=1532877390692_7890&callback=jsonp
        async function jsonp(data) {
            var c = data.result[0][0].substr(0,6);
            var map = {'441901':'441900', '442001':'442000', '469003':'469003', '620201':'620200'};
            var p = map[c];
            for(var t in data.result){
                var d = { code: data.result[t][0], text: data.result[t][1], parent: p };
                await mysql.execute('insert into taobao (code, text, parent) values (?, ?, ?)', d.code, d.text, d.parent);
            }
        };

        (async function(){
            await mysql.execute("delete from taobao where parent in ('441900', '442000', '469003', '620200')");
        })();

        //441900,442000,469003,620200
        request.get('https://lsp.wuliu.taobao.com/locationservice/addr/output_address_town_array.do')
            .query({ l1: '440000', l2: '441900', l3: '', lang: 'zh-S', _ksTS: '1532877390692_7890', callback: 'jsonp' })
            .end((err, resx) => {
                eval(resx.text);                
            });
        request.get('https://lsp.wuliu.taobao.com/locationservice/addr/output_address_town_array.do')
            .query({ l1: '440000', l2: '442000', l3: '', lang: 'zh-S', _ksTS: '1532877390692_7890', callback: 'jsonp' })
            .end((err, resx) => {
                eval(resx.text);                
            });
        request.get('https://lsp.wuliu.taobao.com/locationservice/addr/output_address_town_array.do')
            .query({ l1: '460000', l2: '469003', l3: '', lang: 'zh-S', _ksTS: '1532877390692_7890', callback: 'jsonp' })
            .end((err, resx) => {
                eval(resx.text);                
            });
        request.get('https://lsp.wuliu.taobao.com/locationservice/addr/output_address_town_array.do')
            .query({ l1: '620000', l2: '620200', l3: '', lang: 'zh-S', _ksTS: '1532877390692_7890', callback: 'jsonp' })
            .end((err, resx) => {
                eval(resx.text);                
            });


        res.render('divison', { title: 'Divison' });
    } else {
        res.render('divison', { title: 'Divison' });
    }

});

module.exports = router;
