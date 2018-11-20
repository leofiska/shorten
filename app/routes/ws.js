'use strict';
var ws = require('../controllers/ws.js');

module.exports = function(app) {
  app.ws('/fboard/api/', ws.process);
  app.ws('/fboard/api/.*/', ws.process);
  // app.ws( ws.process );
};
