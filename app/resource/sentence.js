'use strict';
var database = require(__dirname + '/../resource/database.js');

module.exports = {
  get_sentence: get_sentence,
  get_sequency: get_sentence_sequency
}

async function get_sentence (alias, language) {
  try {
    var query = 'SELECT * FROM get_sentence_sequency( \''+language+'\', \''+alias+'\' ) as (sentence_alias text, sentence_value text)';
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
  var query = '';
  var res = null;
  var ret = null;

  if (language !== undefined) {
    try {
      query = 'SELECT * FROM get_sentence_sequency( \''+language+'\', \''+alias+'\' ) as (sentence_alias text, sentence_value text)';
      res = await database.query(query);
      if (res.rowCount < 1) {
        return null;
      }
      ret = {};
      for (var i =0; res.rows[i] !== undefined; i++) {
        ret[res.rows[i].sentence_alias.toLowerCase()] = res.rows[i].sentence_value;
      }
      return ret;
    } catch (e) {
      return null;
    }
  } else {
    switch(typeof alias) {
      case 'object':
        query = 'SELECT * FROM get_sentence_sequency(ARRAY[ ';
        for (var i = 0; alias[i] !== undefined; i++) {
          if (i !== 0) query += ', ';
          query += '\''+alias[i]+'\'';
        }
        query += ' ]::text[]) as ( item json)';
        res = await database.query(query);
        if (res.rowCount < 1) {
          return null;
        }
        return res.rows[0].item;
      case 'string':
        return await get_sentence_sequency( [alias] );
        break;
      default:
        console.log(typeof alias);
        break;
    }
  }
}

