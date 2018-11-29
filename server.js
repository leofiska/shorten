'use strict';
console.log('running on version: ' + process.version);
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var spdy = require('spdy');
var ocsp = require('ocsp');
var cache = new ocsp.Cache();
var ws = require('express-ws');
// configure spdy
var listenConfig = require(__dirname + '/config/listen.js');
var app = express();

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.disable('x-powered-by');

var servers = [];
for (var i = 0; listenConfig.serverListenAddresses[i] != undefined; i++) {

  // listen for requests and enable some SSL tricks
  var server = spdy.createServer(listenConfig.options, app)
    .listen(listenConfig.serverListenAddresses[i].port, listenConfig.serverListenAddresses[i].address);
  console.log('Listening at "'+listenConfig.serverListenAddresses[i].address+'", at port "'+listenConfig.serverListenAddresses[i].port);
  var tlsSessionStore = {};
  server.on('OCSPRequest', function(cert, issuer, cb) {
    if (cert == null) return cb();
    ocsp.getOCSPURI(cert, function(err, uri) {
      if (err) return cb(err);
      if (uri === null) return cb();
      var req = ocsp.request.generate(cert, issuer);
      cache.probe(req.id, function(err, cached) {
        if (err) return cb(err);
        if (cached !== false) return cb(null, cached.response);

        var options = {
          url: uri,
          ocsp: req.data,
        };
        cache.request(req.id, options, cb);
      });
    });
  });
  server.on('newSession', function(id, data, cb) {
    tlsSessionStore[id.toString('hex')] = data;
    cb();
  });
  server.on('resumeSession', function(id, cb) {
    cb(null, tlsSessionStore[id.toString('hex')] || null);
  });
  app.all(/.*/, function(req, res, next) {
    listenConfig.writeSSLHeader(req, res);
    return next();
  });
  ws(app, server);
  servers.push(server);
}
require('./app/routes/ws.js')(app);
require('./app/routes/core.js')(app);
