'use strict';
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/p1';
var crypto = require('crypto');

var readline = require('readline');
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

var user = { admin: false,
  id: '',
  password: '',
};

rl.question('Please enter the username: ', function(answer1) {
  rl.question('Please enter the password: ', function(answer2) {
    var hash = crypto.createHmac('sha512', answer2);
    user.password = hash.digest('hex');
    user.id = answer1;
    hash = crypto.createHmac('sha512', answer1);
    user.admin = false;
    adduser(user);
    rl.close();
  });
});

function adduser(user) {
  MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db('p1');
    dbo.collection('users')
      .insertOne(user, function(err, res) {
        if (err) throw err;
        console.log('1 user inserted');
        db.close();
      });
  });
}
