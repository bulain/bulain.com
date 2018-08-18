'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.createTable('taobao', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    code: {type: 'string', length: 50},
    text: {type: 'string', length: 50},
    parent: {type: 'string', length: 50},
    lvl: {type: 'string', length: 50},
    remarks: {type: 'string', length: 50}
  });
};

exports.down = function(db) {
  return db.dropTable('taobao');
};
exports._meta = {
  "version": 1
};
