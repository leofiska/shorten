'use strict';
var database = require(__dirname + '/../resource/database.js');
var crypto = require('crypto');
module.exports = {
  process: function(req, ws, obj) {
    exec(req, ws, obj);
  },
};

var exec = function(req, ws, obj) {
  database.client.connect(database.url, { useNewUrlParser: true },
    function(err, db) {
      if (err) {
        if (ws.readyState === ws.OPEN)
          ws.send(JSON.stringify(
            { f: 'token', error: 500 }));
        return;
      }
      setTimeout(destroy.bind(this), 30000, db);
      validate_token(ws, db, obj);
    });
};

function validate_token(ws, db, obj) {
  var dbo = db.db(database.db);
  if (obj.token === null ||
    obj.token === undefined ||
    obj.token.trim() === '') {
    create_token(ws, db);
    return;
  }
  var query = { token: obj.token };
  dbo.collection('token').findOne(query, function(err, doc) {
    if (err) {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(
          { f: 'token', error: 500 }));
        return;
      }
    }
    if (doc != null) {
      validate_stoken(ws, db, {
        _id: doc._id,
        token: obj.token,
        stoken: obj.stoken });
    } else {
      create_token(ws, db);
    }
  });
}

function validate_stoken(ws, db, obj) {
  var dbo = db.db(database.db);
  if (obj.stoken === null ||
    obj.stoken === undefined ||
    obj.stoken.trim() === '') {
    create_stoken(ws, db, obj);
    return;
  }
  var query = { token: obj._id, stoken: obj.stoken };
  dbo.collection('stoken').findOne(query, function(err, doc) {
    if (err) {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(
          { f: 'token', error: 500 }));
        return;
      }
    }
    if (doc != null) {
      ws.token = {
        token_id: obj._id,
        token: obj.token,
        stoken_id: doc._id,
        stoken: obj.stoken,
      };
      if (ws.readyState === ws.OPEN)
        ws.send(JSON.stringify({
          f: 'token',
          error: false,
          content: {
            token: obj.token,
            stoken: obj.stoken,
            id: doc._id,
          },
        }));
      // ws.push('user',user);
      destroy(db);
    } else {
      create_stoken(ws, db, obj);
    }
  });
}

function create_stoken(ws, db, obj) {
  var dbo = db.db(database.db);
  var stoken = function() {
    var hash = crypto.createHmac('sha512', '' + new Date().getTime());
    hash = hash.digest('hex');
    dbo.collection('stoken')
      .findOne({ stoken: hash }, function(err, result) {
        if (err) {
          if (ws.readyState === ws.OPEN)
            ws.send(JSON.stringify(
              { f: 'token', error: 500 }));
          return;
        }
        if (result != null) {
          stoken();
        } else {
          var iObj = {token: obj._id, stoken: hash};
          dbo.collection('stoken')
            .insertOne(iObj, function(err, result) {
              if (err) {
                if (ws.readyState === ws.OPEN)
                  ws.send(JSON.stringify(
                    { f: 'token', error: 500 }));
                return;
              }
              ws.token = {
                token_id: obj._id,
                token: obj.token,
                stoken_id: iObj._id,
                stoken: hash,
              };
              if (ws.readyState === ws.OPEN)
                ws.send(JSON.stringify({
                  f: 'token',
                  error: false,
                  content: {
                    token: obj.token,
                    stoken: hash,
                    id: iObj._id,
                  },
                }));
              // ws.push('user',user);
              destroy(db);
            });
        }
      });
  };
  stoken();
}

function create_token(ws, db) {
  var dbo = db.db(database.db);
  var token = function() {
    var hash = crypto.createHmac('sha512', '' + new Date().getTime());
    hash = hash.digest('hex');
    dbo.collection('token')
      .findOne({ token: hash }, function(err, result) {
        if (err) {
          if (ws.readyState === ws.OPEN)
            ws.send(JSON.stringify(
              { f: 'token', error: 500 }));
          return;
        }
        if (result != null) {
          token();
        } else {
          var iObj = {token: hash};
          dbo.collection('token')
            .insertOne(iObj, function(err, result) {
              if (err) {
                if (ws.readyState === ws.OPEN)
                  ws.send(JSON.stringify(
                    { f: 'token', error: 500 }));
                return;
              }
              create_stoken(ws, db, iObj);
            });
        }
      });
  };
  token();
}

function destroy(db) {
  if (db !== undefined && db !== null) {
    db.close();
    db.destroy;
    db = null;
  }
};

