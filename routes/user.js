const router = require('express').Router();
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const verify = require('./verifyToken');

const { getUserValidation, addStockValidation } = require('../validation');

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
  const existingText = 'SELECT firstname, lastname, email, stocks FROM users WHERE id = $1';
  const existingValue = [req.body.userId];

  let user = await pool.query(existingText, existingValue);

  user = user.rows[0];

  if (!user) {
    return res.send('Invalid User Id');
  }

  return res.header('loggedin', true).json(user);
});

router.post('/updateStocks', verify, async (req, res) => {
  // Validate fields
  const { error } = addStockValidation(req.body);
  if (error) return res.status(400).json(error.details);

  // connect to DB
  await pool.connect();

  console.log(req.body.symbol);
  let symbols = JSON.stringify(req.body.symbol);
  // symbols = JSON.parse(
  //   symbols.replace(/(\s*?{\s*?|\s*?,\s*?)(['"])?([a-zA-Z0-9]+)(['"])?:/g, '$1"$3":')
  // );

  console.log(symbols);
  //Symbol query
  const symbolText = 'UPDATE users set stocks = $1 WHERE id = $2';
  const symbolValues = [symbols, req.body.userId];

  console.log(`UPDATE users set stocks = ${symbols} WHERE id = ${req.body.userId}`);
  // Add symbol to user's stock list
  let symbol = await pool.query(symbolText, symbolValues);

  return res.send(req.body.symbol);
});

module.exports = router;
