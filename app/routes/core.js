'use strict';
var express = require('express');

module.exports = function(app) {
  var core = require('../controllers/core.js');
//    app.get(/\.(.+)$/, core.resource );
  app.get('/', core.vueresource );
  app.get(/static\/.*/, core.vueresource );
  // app.get('/', express.static('../dist') );
  // app.get(/static\/.*/, express.static('../dist') );
  app.get('/media/:folder/:file', core.resource );
  app.get(/([^\/]+\.(png|ico|xml|json))/, core.faviconresource );
  app.get('/:shorten', core.redirect );
  app.get(/(.*)/, core.vueresource );
//  app.use(express.static('../dist'));
};
