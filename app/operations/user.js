'use strict';
var database = require(__dirname + '/../resource/database.js');
var base = require(__dirname + '/../resource/base.js');
var email = require(__dirname + '/../resource/email.js');
var sentences = require(__dirname + '/../resource/sentence.js');
var config = require(__dirname + '/../resource/config.js');
var crypto = require('crypto');
var shortid = require('shortid');
var subscriber_handlers = [];
var subscribers = [];

var query_elements = 'user_id,'+
                  'user_nickname,'+
                  'user_primaryemail,'+
                  'user_firstname,'+
                  'user_lastname,'+
                  'user_fullname,'+
                  'user_groups,'+
                  'user_permissions_internal,'+
                  'user_permissions_external,'+
                  'user_permissions_trusted,'+
                  'to_json(user_attributes) as user_attributes,'+
                  'user_language,'+
                  'user_state';

module.exports = {
  process: function(req, ws, obj) {
    exec(req, ws, obj);
  },
  subscribe: subscribe,
  unsubscribe: unsubscribe,
  create_obj: create_obj,
  query_elements: query_elements
};

var exec = async function(req, ws, obj) {
  if (obj.options === null || obj.options === undefined) return;
  if (obj.options.f === null || obj.options.f === undefined) return;
  if (ws.user === null || ws.user === undefined) return;
  var query = null;
  switch(obj.options.f) {
    case 'setlanguage':
      query = 'UPDATE tb_users SET user_language=(SELECT CASE WHEN COUNT(1) = (SELECT COUNT(*) FROM tb_languages WHERE language_code=\''+obj.options.language+'\' LIMIT 1) THEN (SELECT language_id FROM tb_languages WHERE language_code=\''+obj.options.language+'\' LIMIT 1)  ELSE 1 END) WHERE user_id='+ws.user.user_id;
      try {
        await database.query(query);
        notify(ws.user.user_id);
      } catch (e) {
        console.log(e);
        ws.send({f: 'user', error: 500});
      }
//      console.log(query);
      break;
    case 'set_attribute':
      query = 'UPDATE tb_users SET user_attributes=user_attributes||hstore(array[ array[\''+obj.options.attribute+'\'::text, \''+obj.options.value+'\'::text]]) WHERE user_id='+ws.user.user_id;
      try {
        await database.query(query);
        notify(ws.user.user_id);
      } catch (e) {
        ws.send({f: 'user', error: 500});
      }
      break;
    case 'request_passcode':
      try {
        var id = crypto.createHash('whirlpool').update('--><'+crypto.createHash('sha256').update(obj.options.id).digest('hex')+'---&').digest('hex');
        query = 'SELECT * FROM tb_users WHERE (user_primaryemail_hashed = \''+id+'\' OR user_nickname_hashed=\''+id+'\') LIMIT 1';
        var res = await database.query(query);
        if (res.rowCount !== 1) {
          console.log('user not found');
          ws.send(JSON.stringify({ f: 'request_passcode', error: false, tid: obj.tid }));
          return;
        }
        var passcode = shortid.generate();
        var usercode = shortid.generate();
        var passtime = Math.floor(Date.now() / 1000);
        query = 'UPDATE tb_users SET user_attributes=user_attributes||hstore(array[ array[\'passcode\'::text, \''+passcode+'\'::text], array[\'passtime\'::text, \''+passtime+'\'::text], array[\'usercode\'::text, \''+usercode+'\'::text]]) WHERE user_id='+res.rows[0].user_id;
        await database.query(query);
        var sequency = await sentences.get_sequency('REQUEST_PASSCODE', obj.options.language);
        var configuration = await config.variables;
        var link = 'https://'+configuration['system|url']+'/#/passcode/'+base.base64encode(passtime)+'/'+base.base64encode(usercode)+'/'+base.base64encode(passcode);
        email.schedule_email({ name: res.rows[0].user_fullname, email: res.rows[0].user_primaryemail }, sequency.passcode_subject, '<p>'+sequency.use_passcode+'</p>\r\n<p><b>'+passcode+'</b></p><p>'+sequency.passcode_use_link+'<br /><a href="'+link+'">'+link+'</a></p><p>'+sequency.passcode_expires_in+'</p>', true, obj.options.language, true);
      } catch (e) {
        console.log(e);
        return;
      }
      ws.send(JSON.stringify({ f: 'request_passcode', error: false, tid: obj.tid }));
      break;
    default:
      break;
  }
};

function create_obj (ws, row) {
  var network = "internal";
  var ans = {};
  ws.user.user_id = row.user_id;
  ans.id = row.user_id;
  ws.user.username = row.user_nickname;
  ans.username = row.user_nickname;
  ws.user.email = row.user_primaryemail;
  ans.email = row.user_primaryemail;
  ws.user.firstname = row.user_firstname;
  ans.firstname = row.user_firstname;
  ws.user.lastname = row.user_lastname;
  ans.lastname = row.user_lastname;
  ws.user.fullname = row.user_fullname;
  ans.fullname = row.user_fullname;
  ws.user.groups = row.user_groups;
  ans.groups = row.user_groups;
  switch(network) {
    case 'internal':
      ws.user.user_permissions = row.user_permissions_internal;
      ans.permissions = row.user_permissions_internal;
      break;
    case 'external':
      ws.user.user_permissions = row.user_permissions_external;
      ans.permissions = row.user_permissions_external;
      break;
    case 'trusted':
      ws.user.user_permissions = row.user_permissions_trusted;
      ans.permissions = row.user_permissions_trusted;
      break;
    default:
      ws.user.user_permissions = row.user_permissions_external;
      ans.permissions = row.user_permissions_external;
      break;
  }
  ws.user.language = row.user_language;
  ans.language = row.user_language;
  ws.user.attributes = row.user_attributes
  ans.attributes = ws.user.attributes;
  return ans;
}

async function notify (user_id) {
  if (user_id === null || user_id === undefined || user_id === '') return;
  if (subscribers[user_id] === undefined) return;
  if (subscribers[user_id].length < 1) return;
  var query = 'SELECT '+query_elements+
              ' FROM v_users WHERE user_id=\''+user_id+'\' LIMIT 1';
  // console.log(query);
  var res = await database.query(query);
  if (res !== null) {
    for (var i = 0; subscribers[user_id][i] != undefined; i++) {
      var ans = create_obj(subscribers[user_id][i].ws, res.rows[0]);
      subscribers[user_id][i].ws.send({f: 'user', el: ans});
    }
  }
}

function subscribe (ws) {
  if (!subscriber_handlers.includes(ws.user.user_id)) {
    subscriber_handlers.push(ws.user.user_id);
  }
  if (subscribers[ws.user.user_id] === undefined) {
    subscribers[ws.user.user_id] = [];
  }
  subscribers[ws.user.user_id].push({ ws: ws });
};

function unsubscribe(ws) {
  if (ws.user === null) return;
  if (subscribers[ws.user.user_id] === undefined) return;
  for (var i = 0; i < subscribers[ws.user.user_id].length; i++) {
    if (subscribers[ws.user.user_id][i].ws === ws) {
      subscribers[ws.user.user_id].splice(i, 1);
    }
  }
};

function gcollector() {
  var h = subscriber_handlers;
//  console.log('subscriber_handlers: ' + h.length);
//  console.log(JSON.stringify(h));
  for (var i = h.length - 1; i >= 0; i--) {
    var t = subscribers[h[i]];
    if (t === undefined) continue;
//    console.log('handler: ' + h[i] + ', length: ' + t.length);
    for (var j = t.length - 1; j >= 0; j--) {
      if (t[j].ws.handler === undefined ||
        t[j].ws.handler === null ||
        t[j].ws.handler.readyState !== t[j].ws.handler.OPEN) {
        subscribers[h[i]].splice(j, 1);
      }
    }
  }
}

setInterval(gcollector, 5000);

