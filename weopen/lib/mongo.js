'use strict';
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

const url = 'mongodb://localhost:27017';
const dbname = 'weopen';

var client = null;

//初始化连接
var setup = async () => {
    if (client) return client;
    return client = await MongoClient.connect(url, {
        useNewUrlParser: true,
        poolSize: 50,
        noDelay: false,
        autoReconnect: true
    }).catch(function (err) {
        console.log(err);
    });
};

//关闭连接
var shutdown = () => {
    if (client) {
        client.close();
    }
    client = null;
};

var dropCollection = async (colname) => {
    const client = await setup();
    const db = client.db(dbname);

    return db.dropCollection(colname);
};

//保存单条记录
var saveOne = async (colname, obj) => {
    const client = await setup();
    const db = client.db(dbname);

    if (obj._id) obj._id = ObjectId(obj._id);
    return db.collection(colname).save(obj);
};

var insertMany = async (colname, arr) => {
    const client = await setup();
    const db = client.db(dbname);

    if(!arr){
        return null;
    }
    
    arr.forEach(obj => {
        if (obj._id) obj._id = ObjectId(obj._id);
    });

    return db.collection(colname).insertMany(arr);
};

//插入或更新单条记录
var insertOrUpdateOne = async (colname, obj) => {
    const client = await setup();
    const db = client.db(dbname);

    if (obj._id) {
        obj._id = ObjectId(obj._id);
        return db.collection(colname).updateOne({ "_id": obj._id }, { $set: obj });
    } else {
        return db.collection(colname).insertOne(obj);
    }
};

//查询
var find = async (colname, query, opt) => {
    const client = await setup();
    const db = client.db(dbname);

    var q = db.collection(colname).find(query);
    if (opt.skip) q = q.skip(opt.skip);
    if (opt.limit) q = q.limit(opt.limit);
    if (opt.sort) q = q.sort(opt.sort);
    return q.toArray();
};

//删除
var deleteOne = async (colname, obj) => {
    const client = await setup();
    const db = client.db(dbname);

    if (obj._id) obj._id = ObjectId(obj._id);
    return db.collection(colname).deleteOne(obj);
};

//模块导出
module.exports = {
    setup: setup,
    dropCollection: dropCollection,
    shutdown: shutdown,
    saveOne: saveOne,
    insertMany: insertMany,
    insertOrUpdateOne: insertOrUpdateOne,
    find: find,
    deleteOne: deleteOne
}