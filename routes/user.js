const router = require('express').Router();
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const verify = require('./verifyToken');

const { getUserValidation, addStockValidation, addSnapshotValidation } = require('../validation');

require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

router.post('/getUser', verify, async (req, res) => {
  // Validate fields
  const { error } = getUserValidation(req.body);
  if (error) return res.status(400).json(error.details);

  // connect to DB
  await pool.connect();

  // Check if user exists by this id
  const existingText =
    'SELECT firstname, lastname, email, stocks, lastupdate, snapshots FROM users WHERE id = $1';
  const existingValue = [req.body.userId];

  let user = await pool.query(existingText, existingValue);

  user = user.rows[0];

  if (!user) {
    return res.send('Invalid User Id');
  }

  return res.header('loggedin', true).json(user);
});

router.post('/updateStocks', verify, async (req, res) => {
  console.log(req.body);
  // Validate fields
  const { error } = addStockValidation(req.body);
  if (error) return res.status(400).json(error.details);

  // connect to DB
  await pool.connect();

  let symbols = JSON.stringify(req.body.symbol);

  //Symbol query
  const symbolText = 'UPDATE users set stocks = $1, lastupdate = $2 WHERE id = $3';
  const symbolValues = [symbols, req.body.timestamp, req.body.userId];

  // Add symbol to user's stock list
  let symbol = await pool.query(symbolText, symbolValues);

  return res.send(req.body.symbol);
});

router.post('/updateSnapshots', verify, async (req, res) => {
  // Validate fields
  const { error } = addSnapshotValidation(req.body);
  if (error) return res.status(400).json(error.details);

  // connect to DB
  await pool.connect();

  let snapshots = JSON.stringify(req.body.snapshots);

  //Symbol query
  const snapshotText = 'UPDATE users set snapshots = $1 WHERE id = $2';
  const snapshotValues = [snapshots, req.body.userId];

  // Add symbol to user's stock list
  let symbol = await pool.query(snapshotText, snapshotValues);

  return res.send(req.body.symbol);
});

module.exports = router;
