'use strict';
var crypto = require('crypto');
var database = require(__dirname + '/../resource/database.js');
var base = require(__dirname + '/../resource/base.js');
var email = require(__dirname + '/../resource/email.js');

module.exports = {
  process: function(req, ws, obj) {
    exec(req, ws, obj);
  },
};

async function exec (req, ws, obj) {
  if (obj.options.id === undefined ||
    ((obj.options.pass === undefined || obj.options.pass === '' ) && (obj.options.passcode === undefined || obj.options.passcode === '' )) ||
    obj.options.id === '') {
    ws.send(JSON.stringify({ f: 'login', error: 401, tid: obj.tid }));
    return;
  }
  var params = { password: '', passcode: '', id: ' ', keep: true };
  var res = null;
  var auth = null;
  var hash = null;
  var bd_hash = null;
  var query = '';

  try {
    switch(obj.options.f) {
      case 'login_password':
        params.password = crypto.createHash('whirlpool').update('--><'+crypto.createHash('sha256').update(obj.options.pass).digest('hex')+'-@-&').digest('hex');
        params.id = crypto.createHash('whirlpool').update('--><'+crypto.createHash('sha256').update(obj.options.id).digest('hex')+'---&').digest('hex');
        params.keep = obj.options.keep;
        query = 'SELECT user_id, uid FROM v_user_passwords WHERE (user_nickname=\''+params.id+'\' OR user_primaryemail=\''+params.id+'\') AND (user_password=\''+params.password+'\') LIMIT 1';
        var step1 = await database.query(query);
        if ( step1 === null) {
          ws.send(JSON.stringify({ f: 'login_password', auth: false, error: 500, tid: obj.tid }));
          return;
        }
        if (step1.rowCount !== 1) {
          ws.send(JSON.stringify({ f: 'login_password', auth: false, error: 404, tid: obj.tid }));
          return;
        }
        auth = async function() {
          hash = crypto.createHash('sha256').update('-&^'+(new Date().getTime())).digest('hex');
          bd_hash = crypto.createHash('sha512').update(hash).digest('hex');
          query = 'SELECT user_auth_id FROM tb_user_auth WHERE user_auth_hash=\''+bd_hash+'\' LIMIT 1';
          res = await database.query(query);
          if ( res === null) {
            ws.send(JSON.stringify({ f: 'login_password', auth: false, error: 500, tid: obj.tid }));
            return;
          }
          if (res.rowCount !== 0) {
            auth();
            return;
          }
              //must add user_auth_global_id
          query = 'INSERT INTO tb_user_auth ( user_auth_user_id, user_auth_hash, user_auth_global_id ) VALUES '+
                  '( \''+step1.rows[0].user_id+'\', \''+bd_hash+'\', \''+ws.token.token_id+'\' )';
          var step2 = await database.query(query);
          if (step2 === null) {
            ws.send(JSON.stringify({ f: 'login_password', auth: false, error: 500, tid: obj.tid }));
            return;
          }
          ws.send(JSON.stringify(
          {
            f: 'login_password',
            auth: true,
            error: false,
            tid: obj.tid,
            content:
            {
              ltoken: hash,
              keep: params.keep,
              user: {
                id: step1.uid,
              }
            }
          }));
        };
        auth();
        break;
      case 'autologin_passcode':
        try {
          params.id = base.base64decode(obj.options.id);
          params.passcode = base.base64decode(obj.options.pass);
          params.time = base.base64decode(obj.options.time);
          params.keep = obj.options.keep;
          query = 'SELECT * FROM tb_users WHERE user_attributes->\'usercode\'=\''+params.id+'\' AND user_attributes->\'passtime\'=\''+params.time+'\' AND user_attributes->\'passcode\'=\''+params.passcode+'\' AND (REGEXP_REPLACE(COALESCE(user_attributes->\'passtime\', \'0\'), \'[^0-9]*\' ,\'0\')::integer + 300) > '+Math.floor(Date.now() / 1000)+' LIMIT 1';
          var step1 = await database.query(query);
          if (step1.rowCount !== 1) {
            ws.send(JSON.stringify({ f: 'login_password', auth: false, error: 404, tid: obj.tid }));
            return;
          }
          auth = async function() {
            hash = crypto.createHash('sha256').update('-&^'+(new Date().getTime())).digest('hex');
            bd_hash = crypto.createHash('sha512').update(hash).digest('hex');
            query = 'SELECT user_auth_id FROM tb_user_auth WHERE user_auth_hash=\''+bd_hash+'\' LIMIT 1';
            res = await database.query(query);
            if (res.rowCount !== 0) {
              auth();
              return;
            }
              //must add user_auth_global_id
            query = 'INSERT INTO tb_user_auth ( user_auth_user_id, user_auth_hash, user_auth_global_id ) VALUES '+
                    '( \''+step1.rows[0].user_id+'\', \''+bd_hash+'\', \''+ws.token.token_id+'\' )';
            res = await database.query(query);
            query = 'UPDATE tb_users SET user_attributes = delete(user_attributes, \'passcode\')';
            res = await database.query(query);
            query = 'UPDATE tb_users SET user_attributes = delete(user_attributes, \'passtime\')';
            res = await database.query(query);
            query = 'UPDATE tb_users SET user_attributes = delete(user_attributes, \'usercode\')';
            res = await database.query(query);
            ws.send(JSON.stringify(
            {
              f: 'login_password',
              auth: true,
              error: false,
              tid: obj.tid,
              content:
              {
                ltoken: hash,
                keep: params.keep,
                user: {
                  id: step1.rows[0].user_id,
                }
              }
            }));
          }
          auth();
        } catch (e) {
          ws.send(JSON.stringify({ f: 'login_password', auth: false, error: 404, tid: obj.tid }));
          return;
        }
        break;
      case 'login_passcode':
        try {
          params.id = crypto.createHash('whirlpool').update('--><'+crypto.createHash('sha256').update(obj.options.id).digest('hex')+'---&').digest('hex');
          params.passcode = obj.options.pass;
          params.keep = obj.options.keep;
          query = 'SELECT * FROM tb_users WHERE (user_primaryemail_hashed = \''+params.id+'\' OR user_nickname_hashed=\''+params.id+'\') AND user_attributes->\'passcode\'=\''+params.passcode+'\' AND (REGEXP_REPLACE(COALESCE(user_attributes->\'passtime\', \'0\'), \'[^0-9]*\' ,\'0\')::integer + 300) > '+Math.floor(Date.now() / 1000)+' LIMIT 1';
          var step1 = await database.query(query);
          if (step1.rowCount !== 1) {
            ws.send(JSON.stringify({ f: 'login_password', auth: false, error: 404, tid: obj.tid }));
            return;
          }
          auth = async function() {
            hash = crypto.createHash('sha256').update('-&^'+(new Date().getTime())).digest('hex');
            bd_hash = crypto.createHash('sha512').update(hash).digest('hex');
            query = 'SELECT user_auth_id FROM tb_user_auth WHERE user_auth_hash=\''+bd_hash+'\' LIMIT 1';
            res = await database.query(query);
            if (res.rowCount !== 0) {
              auth();
              return;
            }
            query = 'INSERT INTO tb_user_auth ( user_auth_user_id, user_auth_hash, user_auth_global_id ) VALUES '+
                    '( \''+step1.rows[0].user_id+'\', \''+bd_hash+'\', \''+ws.token.token_id+'\' )';
            res = await database.query(query);
            query = 'UPDATE tb_users SET user_attributes = delete(user_attributes, \'passcode\')';
            res = await database.query(query);
            query = 'UPDATE tb_users SET user_attributes = delete(user_attributes, \'passtime\')';
            res = await database.query(query);
            query = 'UPDATE tb_users SET user_attributes = delete(user_attributes, \'usercode\')';
            res = await database.query(query);
            ws.send(JSON.stringify(
            {
              f: 'login_password',
              auth: true,
              error: false,
              tid: obj.tid,
              content:
              {
                ltoken: hash,
                keep: params.keep,
                user: {
                  id: step1.rows[0].user_id,
                }
              }
            }));
          };
          auth();
        } catch (e) {
          ws.send(JSON.stringify({ f: 'login_password', auth: false, error: 404, tid: obj.tid }));
          return;
        }
        break;
    }
  } catch (e) {
    if (ws.readyState === ws.OPEN)
      ws.send(JSON.stringify({ f: 'login', auth: false, error: 401 }));
    return;
  }
};

