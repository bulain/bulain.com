'use strict';
const mysql = require('mysql');
const mysqlconf = require('../database').mysql;
const bluebird = require("bluebird");
bluebird.promisifyAll(require("mysql/lib/Connection").prototype);
bluebird.promisifyAll(require("mysql/lib/Pool").prototype);

var pool = null;

//创建连接池
var setup = () => {
    if (pool) return;
    pool = mysql.createPool(mysqlconf);
};
setup();

//关闭连接池
var shutdown = () => {
    pool.end();
    pool = null;
};

//将结果已对象数组返回
var row = async (sql, ...params) => {
    var conn = await pool.getConnectionAsync();
    var res = await conn.queryAsync(sql, params);
    conn.release();
    return res;
};
//返回一个对象
var first = async (sql, ...params) => {
    var conn = await pool.getConnectionAsync();
    var res = await conn.queryAsync(sql, params);
    conn.release();
    return res[0] || null;
};
//返回单个查询结果
var single = async (sql, ...params) => {
    var conn = await pool.getConnectionAsync();
    var res = await conn.queryAsync(sql, params);
    conn.release();
    for (let i in res[0]) {
        return res[0][i] || null;
    }
    return null;
}
//执行代码，返回执行结果
var execute = async (sql, ...params) => {
    var conn = await pool.getConnectionAsync();
    var res = await conn.queryAsync(sql, params);
    conn.release();
    return res;
}

//模块导出
module.exports = {
    setup: setup,
    shutdown: shutdown,
    row: row,
    first: first,
    single: single,
    execute: execute
}