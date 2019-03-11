'use strict';
var crypto = require('crypto');
var database = require(__dirname + '/../resource/database.js');

module.exports = {
  process: async function (req, ws, obj) {
    await exec(req, ws, obj);
  },
};

async function exec (req, ws, obj) {
  if (ws.user.auth.sid === '') {
    ws.send(JSON.stringify( { f: 'logout', error: 500, tid: obj.tid } ));
    return;
  }
  var query = 'DELETE FROM tb_user_auth WHEER user_auth_hash=\''+ws.user.auth.sid+'\'';
  await database.query(query);
};
