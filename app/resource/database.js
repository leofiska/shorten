'use strict';
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://127.0.0.1:27017/';
var db = 'shorten';

module.exports = {
  client: MongoClient,
  db: db,
  url: url,
};
