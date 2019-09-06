const router = require('express').Router();
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const verify = require('./verifyToken');

const { getUserValidation } = require('../validation');

require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

router.post('/getUser', verify, async (req, res) => {
  console.log('in get USER');
  console.log(req.body);
  // Validate fields
  const { error } = getUserValidation(req.body);
  if (error) return res.status(400).json(error.details);

  // connect to DB
  await pool.connect();

  // Check if user exists by this id
  const existingText = 'SELECT firstname, lastname, email, stocks FROM users WHERE id = $1';
  const existingValue = [req.body.userId];

  let user = await pool.query(existingText, existingValue);
  // console.log(user);
  user = user.rows[0];

  if (!user) {
    console.log(' no user');
    return res.send('Invalid User Id');
  }

  return res.header('loggedin', true).json(user);
});

module.exports = router;
