'use strict';
var base = require('../resource/base.js');
var fs = require('fs');
var path = require('path');
var database = require(__dirname + '/../resource/database.js');
var last_run = 0;

module.exports = {
  start: function () {
    console.log('Starting tasks');
    setInterval( run, 2000 );
  }
};

async function run() {
  if (last_run !== 0 && ((Math.floor(Date.now() / 1000)) - last_run) < 120) {
    console.log('tasks is already running');
    return;
  }
  if ( last_run !== 0 && ((Math.floor(Date.now() / 1000)) - last_run) >= 120 ) {
    console.log('tasks was running for over than 120 seconds... considering it was stucked');
  }
  last_run = Math.floor(Date.now() / 1000);
  var query = 'SELECT * '+
              'FROM tb_tasks '+
              'WHERE task_done=false '+
              'AND task_schedule_time <= NOW() '+
              'ORDER BY task_id ASC '+
              'LIMIT 10';
  var res = await database.query(query);
  if (res !== null) {
    for (var i = 0; i < res.rows.length; i++) {
      console.log(last_run+': running task');
      console.log(res.rows[0].task_parameters);
      query = 'INSERT INTO tb_relation_task_status ( trts_task_id, trts_task_status_id ) VALUES ( '+res.rows[i].task_id+', (SELECT task_status_id FROM tb_task_status WHERE task_status_alias=\'IDENTIFYING\' LIMIT 1) )';
      await database.query(query);
      try {
        var m = require('../operations/'+res.rows[i].task_parameters['class']+'.js');
        query = 'INSERT INTO tb_relation_task_status ( trts_task_id, trts_task_status_id ) VALUES ( '+res.rows[i].task_id+', (SELECT task_status_id FROM tb_task_status WHERE task_status_alias=\'PROCESSING\' LIMIT 1) )';
        await database.query(query);
        await m[res.rows[i].task_parameters.method](res.rows[i]);
      } catch (e) {
        console.log('no donuts for this task');
        console.log(e);
        query = 'INSERT INTO tb_relation_task_status ( trts_task_id, trts_task_status_id ) VALUES ( '+res.rows[i].task_id+', (SELECT task_status_id FROM tb_task_status WHERE task_status_alias=\'ERROR\' LIMIT 1) )';
        await database.query(query);
      }
    }
  }
  last_run = 0;
  return;
}

