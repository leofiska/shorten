'use strict';
var base = require('../resource/base.js');
var fs = require('fs');
var path = require('path');
var database = require(__dirname + '/../resource/database.js');
var email = require(__dirname + '/../resource/email.js');
var last_run = 0;

module.exports = {
  start: function () {
    console.log('Starting emails');
    setInterval( run, 2000 );
  }
};

async function run() {
  if (last_run !== 0 && ((Math.floor(Date.now() / 1000)) - last_run) < 120) {
    console.log('emails is already running');
    return;
  }
  if ( last_run !== 0 && ((Math.floor(Date.now() / 1000)) - last_run) >= 120 ) {
    console.log('emails was running for over than 120 seconds... considering it was stucked');
  }
  last_run = Math.floor(Date.now() / 1000);
  var query = 'SELECT * '+
              'FROM v_emails '+
              'WHERE email_sent_time IS NULL '+
              'ORDER BY email_id ASC '+
              'LIMIT 10';
  var res = await database.query(query);
  if (res !== null) {
    for (var i = 0; res.rows[i] !== undefined; i++) {
      console.log(res.rows[i].email_to+'=>'+res.rows[i].email_subject);
      try {
        if (await email.send_email(res.rows[i])) {
          query = 'UPDATE tb_emails SET email_sent_time=NOW() WHERE email_id='+res.rows[i].email_id;
          await database.query(query);
          console.log('email succesfully sent');
        }
      } catch (e) {
        console.log(e);
        console.log('no donuts for this email task');
      }
    }
  }
  last_run = 0;
  return;
}

