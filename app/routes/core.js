'use strict';
var core = require('../controllers/core.js');

module.exports = function(app) {
  app.get('/', core.vueresource );
  app.get('/:shorten', core.redirect );
  app.get(/media\/.*/, core.resource );
  app.get(/static\/.*/, core.vueresource );
  app.get(/favicons\/.*/, core.mediaresource );
  app.get(/([^\/]+\.(html|css|js))/, core.resource );
  app.get(/([^\/]+\.(png|ico|xml|json))/, core.faviconresource );
};
