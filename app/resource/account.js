'use strict';
var database = require(__dirname + '/database.js');
module.exports = {
  initialize: initialize,
};

function initialize(req, res, renew, cb) {
  var user = {
    id: null,
    is_admin: false,
    auth: {
      sid: null,
      keep: false,
    },
  };
  if (req.query.ltoken === undefined || req.query.ltoken === '') {
    cb(req, res, user);
    return;
  }
  database.client
    .connect(database.url, {useNewUrlParser: true}, function(err, db) {
      if (err) return;
      var dbo = db.db(database.db);
      var query = [{
        $match: {
          sid: req.query.token,
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
          cb(req, res, user);
          return;
        }
        if (doc.length > 0) { // account was found
          doc = doc[0];
          doc.user = doc.user[0];
          var complete = function() {
            user.id = doc.user.id;
            user.is_admin = doc.user.admin;
            user.auth.sid = doc.sid;
            user.auth.keep - doc.keep;
            db.close();
            cb(req, res, user);
          };
          complete();
        // sessions.splice(req.cookies['_auth']+req.cookies['_user']);
        } else { // could not find account
          cb(req, res, user);
        }
      });
    });
};
