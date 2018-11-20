'use strict';

module.exports = function(app) {
  var core = require('../controllers/core.js');
//    app.get(/\.(.+)$/, core.resource );
  app.get('/media/:folder/:file', core.resource );
  app.get('/:shorten', core.redirect );
  app.get(/(.*)/, core.vueresource );
//  app.use(express.static('../dist'));
};
