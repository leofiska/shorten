'use strict';
var crypto = require('crypto');
var database = require(__dirname + '/../resource/database.js');
var subscribers = {lock: false, objects: []};

module.exports = {
  process: async function (req, ws, obj) {
    await exec(req, ws, obj);
  },
  notify: notify
};

var exec = async function (req, ws, obj) {
  if (obj.options === undefined) {
    return await validate_token(ws, obj);
  }
  switch(obj.options.f) {
    case 'reauth':
      notify(ws.token.token_id);
      break;
  }
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
  subscribe(ws);
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
      ws.send(JSON.stringify({ f: 'token', error: 500, code: '2a' }));
      return;
    }
    if (res.rowCount === 1) {
      await stoken();
      return;
    }
    query = 'INSERT INTO tb_session_ids ( session_hash, session_global_id ) VALUES ( \''+db_hash+'\', (SELECT global_id FROM tb_global_ids WHERE global_hash=\''+token.db_hash+'\' LIMIT 1)) RETURNING session_id';
    res = await database.query(query);
    if (res === null) {
      ws.send(JSON.stringify({ f: 'token', error: 500, code: '2b' }));
      return;
    }
    ws.token = {
      token_id: token.token_id,
      token: token.hash,
      stoken_id: res.rows[0].session_id,
      stoken: hash
    };
    subscribe(ws);
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
      ws.send(JSON.stringify({ f: 'token', error: 500, code: '1a' }));
      return;
    }
    if (res.rowCount === 1) {
      await token();
      return;
    }  
    query = 'INSERT INTO tb_global_ids ( global_hash ) VALUES ( \''+db_hash+'\') RETURNING global_id';
    res = await database.query(query);
    if (res === null) {
      ws.send(JSON.stringify({ f: 'token', error: 500, code: '1b' }));
      return;
    }
    await create_stoken(ws, {token_id: res.rows[0].global_id, db_hash: db_hash, hash: hash});
  };
  await token();
}

async function notify( id ) {
  subscribers.lock = true;
  for (var i in subscribers.objects) {
    if (subscribers.objects[i] === null) continue;
    if (subscribers.objects[i].id === id) {
      for (var j in subscribers.objects[i].objects) {
        if (subscribers.objects[i].objects[j] === null) continue;
        subscribers.objects[i].objects[j].ws.send(JSON.stringify({ f: 'reauth', error: false }));
      }
    }
  }
  subscribers.lock = false;
}

async function subscribe(ws) {
  if (subscribers.lock === true) {
    setTimeout(subscribe, 50, ws);
    return;
  }
  subscribers.lock = true;
  for (var i in subscribers.objects) {
    if (subscribers.objects[i] === null) continue;
    if (subscribers.objects[i].id === ws.token.token_id) {
      subscribers.objects[i].objects.push({ ws: ws });
      subscribers.lock = false;
      return;
    }
  }
  subscribers.objects.push({id: ws.token.token_id, objects: [{ ws: ws }]});
  subscribers.lock = false;
};

async function unsubscribe(ws) {
  if (subscribers.lock === true) {
    setTimeout(unsubscribe, 50, ws, obj);
    return;
  }
  subscribers.lock = true;
  for (var i in subscribers.objects) {
    if (subscribers.objects[i] === null) continue;
    if (subscribers.objects[i].id === ws.token.token_id) {
      for (var j in subscribers.objects[i].objects) {
        if (subscribers.objects[i].objects[j] === null) continue;
        if (subscribers.objects[i].objects[j].ws === ws) {
          subscribers.objects[i].objects[j] = null;
          break;
        }
      }
      break;
    }
  }
  subscribers.lock = false;
};

function gcollector() {
  if (subscribers.lock === true) return;
  subscribers.lock = true;
  for (var i in subscribers.objects) {
    if (subscribers.objects[i] === null) {
      continue;
    }
    for (var j in subscribers.objects[i].objects) {
      if (subscribers.objects[i].objects[j] === null) continue;
      if (subscribers.objects[i].objects[j].ws.handler === undefined ||
        subscribers.objects[i].objects[j].ws.handler === null ||
        subscribers.objects[i].objects[j].ws.handler.readyState !== subscribers.objects[i].objects[j].ws.handler.OPEN) {
        subscribers.objects[i].objects[j] = null;
      }
    }
    var tmp = subscribers.objects[i].objects;
    subscribers.objects[i].objects = tmp.filter( function (el) {
      return el !== null;
    });
    tmp = null;
    if (subscribers.objects[i] !== null && subscribers.objects[i].objects.length === 0) {
      subscribers.objects[i] = null;
    }
  }
  var tmp = subscribers.objects;
  subscribers.objects = tmp.filter( function (el) {
    return el !== null;
  });
  subscribers.lock = false;
}

setInterval(gcollector, 5000);

