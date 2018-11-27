'use strict';
var crypto = require('crypto');
var database = require(__dirname + '/../resource/database.js');

module.exports = {
  process: function(req, ws, obj) {
    exec(req, ws, obj);
  },
};

var exec = function(req, ws, obj) {
  // console.log(JSON.stringify(obj));
  if (obj.options.id === undefined ||
    obj.options.pass === undefined ||
    obj.options.pass === '' ||
    obj.options.id === '') {
    ws.send(JSON.stringify({ f: 'login', error: 401, tid: obj.tid }));
    return;
  }
  var params = { password: '', id: ' ', keep: true };
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
        params.keep = obj.options.keep;
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
                    var expires = 0;
                    if ( params.keep === true ) expires = 60;
                    var d = new Date();
                    d.setTime(d.getTime() + (expires * 24 * 60 * 60 * 1000));
                    var obj2 = {
                      user_id: doc._id,
                      sid: hash,
                      time: (new Date()),
                      expires: d,
                      keep: params.keep
                    };
                    dbo.collection('user_auth')
                      .insertOne(obj2, function(err, result) {
                        if (err) {
                          ws.send(JSON.stringify(
                            { f: 'login', auth: false, error: 500, tid: obj.tid }));
                          return;
                        }
                        // plot( res, JSON.stringify({token: hash}), 200 );
                        ws.user.username = doc.username;
                        ws.user.email = params.id;
                        ws.user.is_admin = doc.admin;
                        ws.user.auth.sid = obj2.sid;
                        ws.user.auth.keep = obj2.keep;
                        // console.log(JSON.stringify(ws.user));
                        ws.send(JSON.stringify(
                        {
                          f: 'login',
                          auth: true,
                          error: false,
                          tid: obj.tid,
                          content:
                          {
                            ltoken: hash,
                            keep: params.keep,
                            user: {
                              id: doc.id,
                              admin: doc.admin
                            }
                          }
                        }));
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
