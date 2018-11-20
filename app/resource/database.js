'use strict';
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/';
var db = 'fboard';

module.exports = {
  client: MongoClient,
  db: db,
  url: url,
};