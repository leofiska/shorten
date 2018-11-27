'use strict';
var crypto = require('crypto');
var database = require(__dirname + '/../resource/database.js');

module.exports = {
  process: function(req, ws, obj) {
    exec(req, ws, obj);
  },
};

var exec = function(req, ws, obj) {
  console.log(JSON.stringify(obj));
  if (obj.options.id === undefined ||
    obj.options.pass === undefined ||
    obj.options.pass === '' ||
    obj.options.id === '') {
    ws.send(JSON.stringify({ f: 'login', error: 401, tid: obj.tid }));
    return;
  }
  var params = { password: '', id: ' '};
  try {
    database.client.connect(database.url, { useNewUrlParser: true },
      function(err, db) {
        if (err) {
          ws.send(JSON.stringify({ f: 'login', auth: false, error: 500, tid: obj.tid }));
          return;
        }
        var dbo = db.db(database.db);
        var hash = crypto.createHmac('sha512', obj.options.pass);
        params.password = hash.digest('hex');
        params.id = obj.options.id;
        var query = {
          email: {
            $elemMatch: {
              address: params.id
            }
          },
          password: params.password
        }
        dbo.collection('users').findOne(query, function(err, doc) {
          if (err) {
            ws.send(JSON.stringify({ f: 'login', auth: false, error: 500, tid: obj.tid }));
            return;
          }
          if (doc != null) {
            // FOUND
            console.log('found!!')
            var auth = function() {
              var hash = crypto.createHmac('sha512', '' + new Date().getTime());
              hash = hash.digest('hex');
              dbo.collection('user_auth')
                .findOne({ sid: hash }, function(err, result) {
                  if (err) {
                    ws.send(JSON.stringify(
                      { f: 'login', auth: false, error: 500, tid: obj.tid }));
                    return;
                  }
                  if (result != null) {
                    auth();
                  } else {
                    // var expires = 0;
                    // if ( params.keep_connected == 'on' ) expires = 60;
                    var d = new Date();
                    d.setTime(d.getTime() + (60 * 24 * 60 * 60 * 1000));
                    var obj = {
                      user_id: doc._id,
                      sid: hash,
                      time: (new Date()),
                      expires: d,
                      keep: params.keep_connected === 'on' ? 1 : 0,
                    };
                    dbo.collection('user_auth')
                      .insertOne(obj, function(err, result) {
                        if (err) {
                          ws.send(JSON.stringify(
                            { f: 'login', auth: false, error: 500, tid: obj.tid }));
                          return;
                        }
                        // plot( res, JSON.stringify({token: hash}), 200 );
                        ws.user.id = doc.id;
                        ws.user.is_admin = doc.admin;
                        ws.user.auth.sid = obj.sid;
                        ws.user.auth.keep - obj.keep;
                        ws.send(JSON.stringify(
                          { f: 'login', auth: true, error: 0, content:
                          {ltoken: hash, user:
                            {id: doc.id, admin: doc.admin}} }));
                        db.close();
                      });
                  }
                });
            };
            auth();
          } else {
            ws.send(JSON.stringify({ f: 'login', auth: false, error: 404, tid: obj.tid }));
            db.close();
          }
        });
      });
  } catch (e) {
    if (ws.readyState === ws.OPEN)
      ws.send(JSON.stringify({ f: 'login', auth: false, error: 401 }));
    return;
  }
};
