var nodemailer = require('nodemailer');
var config = require('../config/config.json');

var transporter = nodemailer.createTransport(config.email);

var mailOptions = {
  from: 'no-reply@rd-a.xyz',
  to: 'leonardo@fischers.it',
  subject: 'rd-a.xyz - testing e-mail',
  // text: 'That was easy!'
  html: '<h1>Welcome</h1><p>This is a test from nodejs!</p>'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
