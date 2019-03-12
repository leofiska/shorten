'use strict';
var pg = require('pg');
var pg_options = require('./postgres.json');
var pool = new pg.Pool(pg_options);

module.exports = {
  query: query
};

async function query (q) {
  var client = await pool.connect()
  let res
  try {
    await client.query('BEGIN')
    try {
      res = await client.query(q)
      res = { rowCount: res.rowCount, rows: res.rows, error: false };
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      res = { rowCount: -1, rows: [], error: true };
    }
  } catch (err) {
    res = { rowCount: -1, rows: [], error: true };
  } finally {
    client.release()
  }
  return res
}

