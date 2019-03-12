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
  var bd_hash = crypto.createHash('sha512').update(ws.user.auth.sid).digest('hex');
  var query = 'DELETE FROM tb_user_auth WHEER user_auth_hash=\''+bd_hash+'\'';
  await database.query(query);
  ws.send(JSON.stringify( { f: 'logout', error: false, tid: obj.tid } ));
};
