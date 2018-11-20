'use strict';
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
        if (ws.readyState === ws.OPEN)
          ws.send(JSON.stringify({ f: 'fetch', error: 500 }));
        return;
      }
      console.log(JSON.stringify(obj));
      switch (obj.options.f) {
        case 'unsubscribe':
          unsubscribe(ws, obj);
          break;
        case 'subscribe':
          subscribe(ws, obj);
          info(ws, db, obj);
          break;
        case 'info':
          info(ws, db, obj);
          break;
        case 'start':
          start(ws, db, obj);
          break;
        case 'create':
          create(ws, db, obj);
          break;
        default:
          console.log('no options found');
          break;
      }
    });
};

function create(ws, db, obj) {
  var dbo = db.db(database.db);
  // console.log('token: ' + JSON.stringify(ws.token));
  var tObj = {
    creator: safeObjectId(ws.token.stoken_id),
    started: false,
    running: false,
  };
  dbo.collection('session')
    .insertOne(tObj, function(err, result) {
      if (err) {
        ws.send(JSON.stringify(
          { f: 'create', error: 500, tid: obj.tid }));
      }
      var pObj = {
        session: tObj._id,
        player: safeObjectId(ws.token.stoken_id),
        color: 'yellow',
      };
      dbo.collection('session_players')
        .insertOne(pObj, function(err, result) {
          if (err) {
            if (ws.readyState === ws.OPEN)
              ws.send(JSON.stringify(
                { f: 'create', error: 500, tid: obj.tid }));
          }
          if (ws.readyState === ws.OPEN)
            ws.send(JSON.stringify(
              { f: 'create', error: false, tid: obj.tid, id: tObj._id }));
          destroy(db);
        });
    });
}

function info(ws, db, obj) {
  var dbo = db.db(database.db);
  var query = [{
    $match: {
      _id: safeObjectId(obj.options.id),
    },
  },
  {
    $lookup: {
      from: 'stoken',
      localField: 'creator',
      foreignField: '_id',
      as: 'stoken',
    },
  },
  {
    $lookup: {
      from: 'token',
      localField: 'stoken.token',
      foreignField: '_id',
      as: 'token',
    },
  },
  {
    $lookup: {
      from: 'session_players',
      localField: '_id',
      foreignField: 'session',
      as: 'players',
    },
  }];
  // console.log('query: ' + JSON.stringify(query));
  dbo.collection('session').aggregate(query).toArray(
    function(err, doc) {
      if (err) {
        if (ws.readyState === ws.OPEN)
          ws.send(JSON.stringify({f: 'info', error: 500, tid: obj.tid}));
        return;
      }
      if (doc.length === 0) {
        console.log('not found');
        if (ws.readyState === ws.OPEN)
          ws.send(JSON.stringify({f: 'info', error: 404, tid: obj.tid}));
        return;
      }
      var tObj = create_object(doc);
      ws.send(JSON.stringify({
        f: 'info',
        tid: obj.tid,
        error: false,
        content: {
          elements: tObj,
        },
      }));
      tObj = null;
    });
}

function create_object(doc) {
  var p = [];
  for (var i = 0; i < doc[0].players.length; i++) {
    p.push({ id: doc[0].players[i].player, color: doc[0].players[i].color });
  }
  console.log(JSON.stringify(doc));
  var tObj = {
    id: doc[0]._id,
    started: doc[0].started,
    running: doc[0].running,
    creator: doc[0].stoken[0]._id,
    players: p,
  };
  // console.log(JSON.stringify(tObj));
  p = null;
  return tObj;
}

function start(ws, db, obj) {
  var dbo = db.db(database.db);
  var query = [{
    $match: {
      _id: safeObjectId(obj.options.id),
    },
  },
  {
    $lookup: {
      from: 'stoken',
      localField: 'creator',
      foreignField: '_id',
      as: 'stoken',
    },
  },
  {
    $lookup: {
      from: 'token',
      localField: 'stoken.token',
      foreignField: '_id',
      as: 'token',
    },
  },
  {
    $lookup: {
      from: 'session_players',
      localField: '_id',
      foreignField: 'session',
      as: 'players',
    },
  }];
  // console.log('query: ' + JSON.stringify(query));
  dbo.collection('session').aggregate(query).toArray(
    function(err, doc) {
      if (err) {
        ws.send(JSON.stringify({f: 'info', error: 500, tid: obj.tid}));
        return;
      }
      if (doc.length === 0) {
        ws.send(JSON.stringify({f: 'info', error: 404, tid: obj.tid}));
        return;
      }
      if (doc[0].creator.toString() !== ws.token.stoken_id.toString()) {
        ws.send(JSON.stringify({f: 'info', error: 403, tid: obj.tid}));
        return;
      }
      if (doc[0].started !== false) {
        ws.send(JSON.stringify({f: 'info', error: 409, tid: obj.tid}));
        return;
      }
      dbo.collection('session')
        .updateOne({_id: safeObjectId(obj.options.id)},
          { $set: {started: true} });
      doc[0].started = true;
      var tObj = create_object(doc);
      ws.send(JSON.stringify({
        f: 'info',
        tid: obj.tid,
        error: false,
        content: {
          elements: tObj,
        },
      }));
      notify(tObj);
      tObj = null;
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

