'use strict';
var crypto = require('crypto');
var database = require(__dirname + '/../resource/database.js');

module.exports = {
  process: async function (req, ws, obj) {
    await exec(req, ws, obj);
  },
};

var exec = async function (req, ws, obj) {
  await validate_token(ws, obj);
};

async function validate_token (ws, obj) {
  if (obj.token === null ||
    obj.token === undefined ||
    obj.token.trim() === '') {
    create_token(ws);
    return;
  }
  var db_hash = crypto.createHash('sha512').update(obj.token.trim()).digest('hex');
  var query = 'SELECT global_id FROM tb_global_ids WHERE global_hash=\''+db_hash+'\' LIMIT 1';
  var res = await database.query(query);
  if (res === null) {
    ws.send(JSON.stringify({ f: 'token', error: 500 }));
    return;
  }
  if (res.rowCount !== 1) {
    await create_token(ws);
    return;
  }
  await validate_stoken(ws, {token_id: res.rows[0].global_id, hash: obj.token, db_hash: db_hash, stoken: obj.stoken})
}

async function validate_stoken (ws, obj) {
  if (obj.stoken === null ||
    obj.stoken === undefined ||
    obj.stoken.trim() === '') {
    create_stoken(ws, obj);
    return;
  }
  var db_hash = crypto.createHash('sha512').update(obj.stoken.trim()).digest('hex');
  var query = 'SELECT session_id FROM tb_session_ids WHERE session_hash=\''+db_hash+'\' LIMIT 1';
  var res = await database.query(query);
  if (res === null) {
    ws.send(JSON.stringify({ f: 'token', error: 500 }));
    return;
  }
  if (res.rowCount !== 1) {
    create_stoken(ws, obj);
    return;
  }
  ws.token = {
    token_id: obj.token_id,
    token: obj.hash,
    stoken_id: res.rows[0].session_id,
    stoken: obj.stoken
  };
  ws.send(JSON.stringify({
    f: 'token',
    error: false,
    content: {
      token: obj.hash,
      stoken: obj.stoken
    },
  }));
}

async function create_stoken (ws, token) {
  var stoken = async function() {
    var hash = crypto.createHash('sha512').update('-&^'+(new Date().getTime())).digest('hex');
    var db_hash = crypto.createHash('sha512').update(hash).digest('hex');
    var query = 'SELECT session_id FROM tb_session_ids WHERE session_hash=\''+db_hash+'\' LIMIT 1';
    var res = await database.query(query);
    if (res === null) {
      ws.send(JSON.stringify({ f: 'token', error: 500 }));
      return;
    }
    if (res.rowCount === 1) {
      await stoken();
      return;
    }
    query = 'INSERT INTO tb_session_ids ( session_hash, session_global_id ) VALUES ( \''+db_hash+'\', (SELECT global_id FROM tb_global_ids WHERE global_hash=\''+token.db_hash+'\' LIMIT 1)) RETURNING session_id';
    res = await database.query(query);
    if (res === null) {
      ws.send(JSON.stringify({ f: 'token', error: 500 }));
      return;
    }
    ws.token = {
      token_id: token.token_id,
      token: token.hash,
      stoken_id: res.rows[0].session_id,
      stoken: hash
    };
    ws.send(JSON.stringify({
      f: 'token',
      error: false,
      content: {
        token: token.hash,
        stoken: hash
      }
    }));
  };
  await stoken();
}

async function create_token (ws) {
  var token = async function() {
    var hash = crypto.createHash('sha512').update('-&^'+(new Date().getTime())).digest('hex');
    var db_hash = crypto.createHash('sha512').update(hash).digest('hex');
    var query = 'SELECT global_id FROM tb_global_ids WHERE global_hash=\''+db_hash+'\' LIMIT 1';
    var res = await database.query(query);
    if (res === null) {
      ws.send(JSON.stringify({ f: 'token', error: 500 }));
      return;
    }
    if (res.rowCount === 1) {
      await token();
      return;
    }  
    query = 'INSERT INTO tb_global_ids ( global_hash ) VALUES ( \''+db_hash+'\') RETURNING global_id';
    res = await database.query(query);
    if (res === null) {
      ws.send(JSON.stringify({ f: 'token', error: 500 }));
      return;
    }
    await create_stoken(ws, {token_id: res.rows[0].global_id, db_hash: db_hash, hash: hash});
  };
  await token();
}

