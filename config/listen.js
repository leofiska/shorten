'use strict';
var fs = require('fs');
var tls = require('tls');

var config = require('./config.json');

var secureContext = tls.createSecureContext({
  key: fs.readFileSync(__dirname + config.certificate.key),
  cert: fs.readFileSync(__dirname + config.certificate.crt),
  ca: [fs.readFileSync(__dirname + config.certificate.ca)],
  servername: config.serverName,
}).context;

var setHeader = function(req, res) {
  var pin = '';
  for (var i = 0; i < config.pin_sha256.length; i++) {
    pin += 'pin-sha256="' + config.pin_sha256[i] + '";';
  }
  res.setHeader('public-key-pins', pin + 'max-age=' +
    (2 * 365 * 24 * 60 * 60) + '; includeSubDomains');
  res.setHeader('strict-transport-security',
    'max-age=' + (2 * 365 * 24 * 60 * 60) +
    '; includeSubDomains; preload');
  res.setHeader('x-contact', config.contact);
  res.setHeader('x-content-type-options', 'nosniff');
  res.setHeader('x-dns-prefetch-control', 'on');
  res.setHeader('x-download-options', 'noopen');
  // res.setHeader('x-forwarded-host', req.get('host'));
  res.setHeader('x-frame-options', 'DENY');
  res.setHeader('x-permitted-cross-domain-policies', 'none');
  var origin = req.headers.origin;
  if (config.allowedOrigins.indexOf(origin) > -1) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers',
      'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
  }
};

module.exports = {
  serverListenPort: config.serverListenPort,
  serverListenAddress: config.serverListenAddress,
  serverListenAddresses: config.serverListenAddresses,
  options: {
    ciphers: [
    /* PERFECT
      "ECDHE-ECDSA-AES256-GCM-SHA384",
      "ECDHE-ECDSA-CHACHA20-POLY1305",
      "ECDHE-ECDSA-AES256-CCM",
      "ECDHE-ECDSA-AES128-GCM-SHA256"
    */
      'ECDHE-ECDSA-AES256-GCM-SHA384',
      'ECDHE-ECDSA-AES128-GCM-SHA256',
      'HIGH',
      '!aNULL',
      '!eNULL',
      '!EXPORT',
      '!DES',
      '!RC4',
      '!MD5',
      '!PSK',
      '!SRP',
      '!CAMELLIA',
    ].join(':'),
    ecdhCurve: 'secp384r1',
    honorCipherOrder: true,
    dhparam: fs.readFileSync(__dirname + '/ssl/dhparam.pem'),
    secureOptions: require('constants').SSL_OP_NO_TLSv1,
    secureProtocol: 'TLSv1_2_method',
    secureContext: secureContext,
    SNICallback: function(domain, cb) {
      if (config.allowedDomains.indexOf(domain) !== -1) {
        cb(null, secureContext);
      } else {
        cb(null, secureContext);
        console.log('eror while loading correct certificate for domain: '
          + domain);
      }
    },
  },
  writeSSLHeader: setHeader,
};

