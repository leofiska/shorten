'use strict';
var database = require(__dirname + '/../resource/database.js');

module.exports = {
  process: function(req, ws, obj, user) {
    if (user.id !== null) {
      if (ws.readyState === ws.OPEN)
        ws.send('NOT_ALLOWED');
    } else {
      exec(req, ws, obj, user);
    }
  },
};

var exec = function(req, ws, obj, user) {
  if (obj.token === undefined || obj.token === '') {
    if (ws.readyState === ws.OPEN)
      ws.send({f: 'auth', error: 401});
    return;
  }
  if (user !== null && user.id !== null) {
    if (ws.readyState === ws.OPEN)
      ws.send({f: 'auth', error: 403});
    return;
  }
  database.client.connect(database.url, { useNewUrlParser: true },
    function(err, db) {
      if (err) return;
      var dbo = db.db(database.db);
      var query = [{
        $match: {
          sid: obj.token,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user',
        },
      }];
      dbo.collection('user_auth').aggregate(query).toArray(function(err, doc) {
        if (err) {
          if (ws.readyState === ws.OPEN)
            ws.send(JSON.stringify({f: 'auth', error: 401}));
          return;
        }
        if (doc.length > 0) { //  account was found
          doc = doc[0];
          doc.user = doc.user[0];
          var complete = function() {
            user.id = doc.user.id;
            user.is_admin = doc.user.admin;
            user.auth.sid = doc.sid;
            user.auth.keep - doc.keep;
            if (ws.readyState === ws.OPEN)
              ws.send(JSON.stringify({f: 'auth', error: false}));
            db.close();
          };
          complete();
        } else { // could not find account
          db.close();
          if (ws.readyState === ws.OPEN)
            ws.send(JSON.stringify({f: 'auth', error: 401}));
        }
      });
    });
};

