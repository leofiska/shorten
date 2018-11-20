'use strict';
var mysql = require('mysql');
var db = 'db_l2b';
var user = 'fischer';
var password = 'password';
var host = 'localhost';

module.exports = {
  client: function() {
    var sql = mysql.createConnection({
      host: host,
      user: user,
      password: password,
      database: db,
    });
    return sql;
  },
};

