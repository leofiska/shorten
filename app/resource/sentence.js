'use strict';
var database = require(__dirname + '/../resource/database.js');

module.exports = {
  get_sentence: get_sentence,
  get_sequency: get_sentence_sequency
}

async function get_sentence (alias, language) {
  try {
    var query = 'SELECT * FROM get_sentence_sequency( \''+alias+'\', \''+language+'\' ) as (sentence_alias text, sentence_value text)';
    var res = await database.query(query);
    if (res.rowCount !== 1) {
      return null;
    }
    return res.rows[0].sentence_value;
  } catch (e) {
    return null;
  }
}

async function get_sentence_sequency (alias, language) {
  try {
    var query = 'SELECT * FROM get_sentence_sequency( \''+alias+'\', \''+language+'\' ) as (sentence_alias text, sentence_value text)';
    var res = await database.query(query);
    if (res.rowCount < 1) {
      return null;
    }
    var ret = {};
    for (var i =0; res.rows[i] !== undefined; i++) {
      ret[res.rows[i].sentence_alias.toLowerCase()] = res.rows[i].sentence_value;
    }
    return ret;
  } catch (e) {
    return null;
  }
}

