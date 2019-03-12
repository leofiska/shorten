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
      ans = await sentences.get_sequency(['BOTTOM','MY_ACCOUNT']);
      console.log(ans);
      break;
  }
  ws.send(JSON.stringify(
  {
    f: 'sequency',
    error: false,
    objects: ans
  }));
}

