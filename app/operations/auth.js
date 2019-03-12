'use strict';
var database = require(__dirname + '/../resource/database.js');
var user = require(__dirname + '/user.js');
var crypto = require('crypto');

module.exports = {
  process: async function(req, ws, obj) {
    await exec(req, ws, obj);
  },
};

async function exec (req, ws, obj) {
  if (obj.ltoken === null || obj.ltoken === undefined || obj.ltoken.trim() === '') {
    ws.send({f: 'auth', error: 401});
    user.unsubscribe(ws);
    return;
  }
  var bd_hash = crypto.createHash('sha512').update(obj.ltoken).digest('hex');
  var query = 'SELECT user_auth_user_id FROM tb_user_auth WHERE user_auth_hash=\''+bd_hash+'\' LIMIT 1';
  var res = await database.query(query);
  if (res === null) {
    ws.user = null;
    user.unsubscribe(ws);
    ws.send({f: 'auth', error: 401});
    return;
  }
  if (res.rowCount !== 1) {
    ws.user = null;
    user.unsubscribe(ws);
    ws.send({f: 'auth', error: 401});
    return;
  }
  query = 'SELECT '+user.query_elements+
    ' FROM v_users WHERE user_id=\''+res.rows[0].user_auth_user_id+'\' LIMIT 1';
  res = await database.query(query);
  if (res === null) {
    ws.user = null;
    user.unsubscribe(ws);
    ws.send({f: 'auth', error: 401});
    return;
  }
  var ans = user.create_obj(ws, res.rows[0]);
  user.subscribe(ws);
  ws.user.auth.keep = true;
  ws.user.auth.sid = obj.ltoken;
  ws.send(JSON.stringify(
  {
    f: 'auth',
    error: false,
    user: ans
  }));
}

