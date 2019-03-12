'use strict';
var config = require('../../config/config.json');
var database = require(__dirname + '/../resource/database.js');
var uuid = require('short-uuid');
var translator = uuid();
var dns = require('dns');
var validateIP = require('validate-ip-node');
/* eslint-disable no-new */
var subscribers = [];

module.exports = {
  process: async function(req, ws, obj) {
    await exec(req, ws, obj);
  },
};

async function exec (req, ws, obj) {
  switch (obj.options.f) {
    case 'create':
      verify_and_create(ws, obj);
      break;
    default:
      console.log('no options found');
      break;
  }
}

async function verify_and_create(ws, obj) {
  obj.options.id = obj.options.id.trim().toLowerCase();
  if ( obj.options.id == '' ) {
    ws.send(JSON.stringify({ f: 'create', error: 403, tid: obj.tid }));
    return;
  }

  //normalize url
  var par = obj.options.id.split(/'?\/'?/).filter(function(v) { return v; });;
  if ( par[0].indexOf('http') == -1 ) {
    if ( par[0].indexOf(' ') != -1 ) {
      ws.send(JSON.stringify({ f: 'create', error: 404, tid: obj.tid }));
      return;
    }
    obj.options.id = 'http://'+par.join('/');
  } else if ( par[1] == undefined || par[1].indexOf(' ') != -1 ) {
    ws.send(JSON.stringify({ f: 'create', error: 404, tid: obj.tid }));
    return;
  } else {
    obj.options.id = par[0].replace(':','')+'://';
    par.splice(0,1);
    obj.options.id += par.join('/');
  }
  var tObj = {
    creator: ws.token.stoken_id,
    url: obj.options.id
  };
  var query = 'SELECT * FROM tb_shortener WHERE short_url=\''+tObj.url+'\'';
  if (ws.user !== null && ws.user.user_id !== undefined) {
    query += ' AND short_user_id='+ws.user.user_id;
  } else {
    query += ' AND short_global_id='+ws.token.token_id;
  }
  query += ' LIMIT 1';
  console.log(query);
  var res = await database.query(query);
  if (res === null) {
    return;
  }
  if (res.rowCount !== 1) {
    return create(ws, obj);
  }
  ws.send(JSON.stringify({
    f: 'create',
    error: false,
    tid: obj.tid,
    content: {
      id: 'https://'+config.serverName+'/'+translator.fromUUID(res.rows[0].short_uuid),
    },
  }));
};

async function create(ws, obj) {
  var par = obj.options.id.split(/'?\/'?/).filter(function(v) { return v; });
  var domain = par[1];
  var ipv6 = false;
  var query = '';
  var res = '';
  var hash = '';

  if (domain.indexOf(']') != -1 && domain.indexOf('[') != -1) {
    domain = domain.substr(1,domain.indexOf(']')-1);
    ipv6 = true;
  }
  if (ipv6 === false && domain.indexOf(':') != -1) {
    domain = domain.substr(0,domain.indexOf(':'));
  }
  if (validateIP(domain) === false && (ipv6 === false && /[a-zA-Z]/.test(par[1]) === false)) {
    ws.send(JSON.stringify({ f: 'create', error: 404, tid: obj.tid }));
    return;
  }
  dns.lookup(domain, (err, addresses, family) => {  
    if (addresses === undefined ) {
      ws.send(JSON.stringify({ f: 'create', error: 404, tid: obj.tid }));
      return;
    }
    var gen = async function() {
      hash = uuid.uuid();
      query = 'SELECT * FROM tb_shortener WHERE short_uuid=\''+hash+'\' LIMIT 1';
      res = await database.query(query);    
      if (res ===null) {
        ws.send(JSON.stringify({ f: 'create', error: 500, tid: obj.tid }));
        return;
      }
      if (res.rowCOunt === 1) {
        return gen();
      }
      if (ws.user !== null && ws.user.user_id !== undefined) { 
        query = 'INSERT INTO tb_shortener ( short_url, short_uuid, short_user_id ) VALUES '+
                '( \''+obj.options.id+'\', \''+hash+'\', '+ws.user.user_id+' )';
      } else {
        query = 'INSERT INTO tb_shortener ( short_url, short_uuid, short_global_id ) VALUES '+
                '( \''+obj.options.id+'\', \''+hash+'\', '+ws.token.token_id+' )';
      }
      res = await database.query(query);
      ws.send(JSON.stringify({
        f: 'create',
        error: false,
        tid: obj.tid,
        content: {
          id: 'https://'+config.serverName+'/'+translator.fromUUID(hash),
        },
      }));
    };
    gen();
  });
}

function notify(obj) {
  if (obj === undefined || obj === null) return;
  console.log('-------');
  console.log(JSON.stringify(obj));
  console.log('-------');
  var t = subscribers[obj.id.toString()];
  if (t === undefined || t === null) return;
  for (var i = t.length - 1; i >= 0; i--) {
    if (t[i].ws !== undefined &&
      t[i].ws !== null) {
      console.log('notifying');
      console.log(JSON.stringify(obj));
      t[i].ws.send(JSON.stringify({
        f: 'info',
        tid: t[i].obj.tid,
        error: false,
        content: {
          elements: obj,
        },
      }));
    }
  }
};

function subscribe(ws, obj) {
  if (obj.options === undefined || obj.options === null) return;
  if (subscribers[obj.options.id] === undefined ||
    subscribers[obj.options.id] === null) {
    subscribers[obj.options.id] = [];
  }
  subscribers[obj.options.id].push({ ws: ws, obj: obj });
};

function unsubscribe(ws, obj) {
  if (obj.options === undefined || obj.options === null) return;
  if (subscribers[obj.options.id] === undefined ||
    subscribers[obj.options.id] === null) return;
  for (var i = 0; i < subscribers[obj.options.id].length; i++) {
    if (subscribers[obj.options.id][i].ws === ws) {
      subscribers.splice(i, 1);
    }
  }
};

function gcollector() {
  var t = subscribers;
  for (var i = t.length - 1; i >= 0; i--) {
    if (t[i].ws === undefined ||
      t[i].ws === null ||
      t[i].ws.readyState !== t[i].ws.OPEN) {
      subscribers.splice(i, 1);
    }
  }
}

setInterval(gcollector, 5000);

function destroy(con) {
  if (con !== undefined && con !== null) {
    con.close();
    con.destroy;
    con = null;
  }
};
