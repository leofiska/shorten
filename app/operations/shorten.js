'use strict';
var config = require('../../config/config.json');
var database = require(__dirname + '/../resource/database.js');
/* eslint-disable no-new */
var {ObjectId} = require('mongodb');
var safeObjectId = s => ObjectId.isValid(s) ? new ObjectId(s) : null;
var subscribers = [];

module.exports = {
  process: function(req, ws, obj) {
    exec(req, ws, obj);
  },
};

var exec = function(req, ws, obj) {
  database.client.connect(database.url, { useNewUrlParser: true },
    function(err, db) {
      setTimeout(destroy.bind(this), 30000, db);
      if (err) {
        console.log('something wrong with database connection');
        ws.send(JSON.stringify({ f: 'create', error: 500 }));
        return;
      }
      switch (obj.options.f) {
        case 'create':
          verify_and_create(ws, db, obj);
          break;
        default:
          console.log('no options found');
          break;
      }
    });
};

function verify_and_create(ws, db, obj) {
  var dbo = db.db(database.db);
  obj.options.id = obj.options.id.trim().toLowerCase();
  if ( obj.options.id == '' ) {
    ws.send(JSON.stringify({ f: 'create', error: 403, tid: obj.tid }));
    return;
  }

  //normalize url
  var par = obj.options.id.split(/'?\/'?/).filter(function(v) { return v; });;
  if ( par[0].indexOf('http') == -1 ) {
    if ( par[0].indexOf(' ') != -1 ) {
      ws.send(JSON.stringify({ f: 'create', error: 403, tid: obj.tid }));
      return;
    }
    obj.options.id = 'http://'+par.join('/');
  } else if ( par[1] == undefined || par[1].indexOf(' ') != -1 ) {
    ws.send(JSON.stringify({ f: 'create', error: 403, tid: obj.tid }));
    return;
  } else {
    obj.options.id = par[0].replace(':','')+'://';
    par.splice(0,1);
    obj.options.id += par.join('/');
  }

  var tObj = {
    creator: safeObjectId(ws.token.stoken_id),
    url: obj.options.id
  };

  var query = { url: tObj.url };
  dbo.collection('urls').findOne(query, function(err, doc) {
    if (err || doc == null) {
      return create(ws, db, obj);
    }
    ws.send(JSON.stringify({
          f: 'create',
          error: false,
          tid: obj.tid,
          content: {
            id: 'https://'+config.serverName+'/'+doc._id,
          },
        }));
  });
};

function create(ws, db, obj) {
  var dbo = db.db(database.db);
  var tObj = {
    creator: safeObjectId(ws.token.stoken_id),
    url: obj.options.id,
    time: (new Date())
  };
  dbo.collection('urls')
    .insertOne(tObj, function(err, result) {
      if (err) {
        ws.send(JSON.stringify(
          { f: 'create', error: 500, tid: obj.tid }));
      } else {
        ws.send(JSON.stringify({
            f: 'create',
            error: false,
            tid: obj.tid,
            content: {
              id: 'https://'+config.serverName+'/'+tObj._id,
            },
          }));
      }
      destroy(db);
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
