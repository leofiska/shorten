'use strict';
var pg = require('pg');
var pg_options = require('./postgres.json');
var pool = new pg.Pool(pg_options);

module.exports = {
  query: query
};

async function query (q) {
  var client = await pool.connect()
  // console.log(q)
  let res
  try {
    await client.query('BEGIN')
    res = await client.query(q)
    await client.query('COMMIT')
    await client.query('ROLLBACK')
    res = { rowCount: res.rowCount, rows: res.rows };
  } catch (err) {
    // console.log(err);
    res = null;
  }
  try {
    client.release()
  } catch (err) {
  }
  return res;
}

