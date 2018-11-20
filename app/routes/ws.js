'use strict';
var ws = require('../controllers/ws.js');

module.exports = function(app) {
  app.ws('/api/', ws.process);
  app.ws('/api/.*/', ws.process);
};
