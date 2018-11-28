var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/sim";
var crypto = require('crypto');

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var user = { admin: false, username: "", username_hash: "", first_name: "", last_name: "", password: "", email: [ { type: "primary", address: "" } ] };

rl.question('Please enter the username: ', (answer1) => {
  rl.question('Please enter the password: ', (answer2) => {
    rl.question('Please enter the email: ', (answer3) => {
      rl.question('Please enter the first name: ', (answer4) => {
        rl.question('Please enter the last name: ', (answer5) => {
//          hash.update(answer2)
          var hash = crypto.createHmac('sha512', answer2)
          user.password = hash.digest('hex');
          user.username = answer1;
          var hash = crypto.createHmac('sha512', answer1)
          user.username_hash = hash.digest('hex');
          user.email[0].address = answer3;
          user.first_name = answer4;
          user.last_name = answer5;
          user.admin = true;
          adduser( user );
          rl.close();
        });
      });
    });
  });
});

function adduser( user ) {
  MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db("shorten");
    dbo.collection("users").insertOne(user, function(err, res) {
      if (err) throw err;
      console.log("1 user inserted");
      db.close();
    });
  });
}
