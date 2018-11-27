'use strict';
var crypto = require('crypto');
var database = require(__dirname + '/../resource/database.js');

module.exports = {
  process: function(req, ws, obj) {
    exec(req, ws, obj);
  },
};

var exec = function(req, ws, obj) {
  if (ws.user.auth.sid === '') {
    ws.send(JSON.stringify( { f: 'logout', error: 500, tid: obj.tid } ));
    return;
  }
  database.client.connect( database.url, { useNewUrlParser: true }, function(err, db ) {
    if (err) {
      ws.send(JSON.stringify( { f: 'logout', error: 500, tid: obj.tid } ));
      return;
    }
    var dbo = db.db(database.db);
    dbo.collection('user_auth').deleteMany( { sid: ws.user.auth.sid } );
    ws.send(JSON.stringify( { f: 'logout', error: false, tid: obj.tid } ));
    db.close();
  });
};
