'use strict';
var database = require(__dirname + '/../resource/database.js');

module.exports = {
  process: function(req, ws, obj) {
    exec(req, ws, obj);
  },
};

var exec = function(req, ws, obj) {
  if (obj.ltoken === undefined || obj.ltoken === '') {
    ws.send({f: 'auth', error: 401});
    return;
  }
  database.client.connect(database.url, { useNewUrlParser: true },
    function(err, db) {
      if (err) return;
      var dbo = db.db(database.db);
      var query = [{
        $match: {
          sid: obj.ltoken,
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
          ws.send(JSON.stringify({f: 'auth', error: 401}));
          return;
        }
        if (doc.length > 0) { //  account was found
          doc = doc[0];
          doc.user = doc.user[0];
          doc.email = doc.user.email[0];
          // console.log(JSON.stringify(doc));
          var complete = function() {
            ws.user.username = doc.user.username;
            ws.user.email = doc.user.email.address;
            ws.user.is_admin = doc.user.admin;
            ws.user.auth.sid = doc.sid;
            ws.user.auth.keep - doc.keep;
            ws.send(JSON.stringify({f: 'auth', error: false}));
            db.close();
          };
          complete();
        } else { // could not find account
          db.close();
          ws.send(JSON.stringify({f: 'auth', error: 401}));
        }
      });
    });
};

