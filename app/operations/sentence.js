'use strict';
var sentences = require(__dirname + '/../resource/sentence.js');

module.exports = {
  process: async function(req, ws, obj) {
    await exec(req, ws, obj);
  },
};

async function exec (req, ws, obj) {
  var ans = null;
  var query = '';
  var res = null;

  switch(obj.module) {
    case 'basic':
      ans = await sentences.get_sequency(['COMMON', 'BOTTOM','NAVIGATOR','LOGIN','LANGUAGES']);
      break;
    default:
      ans = await sentences.get_sequency(obj.module);
      break;
  }
  ws.send(JSON.stringify(
  {
    f: 'sequency',
    error: false,
    objects: ans
  }));
}

