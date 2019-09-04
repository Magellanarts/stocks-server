const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const uuidv4 = require('uuid/v4');

const { registrationValidation, loginValidation } = require('../validation');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

router.post('/register', async (req, res) => {
  // Validate data before making a user
  const { error } = registrationValidation(req.body);
  if (error) {
    return res.json(error.details[0]);
  }

  await pool.connect();

  // Check if user exists by this email first
  const existingText = 'SELECT exists(select email FROM users WHERE email = $1)';
  const existingValue = [req.body.email];

  const emailExists = await pool.query(existingText, existingValue);
  if (emailExists) return res.status(400).send('User already exists');

  // User doesn't exist, so create them
  // Hash password
  const salt = await bcrypt.genSalt(15);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  // Create unique id for user
  const uid = uuidv4();
  const addText =
    'INSERT INTO users(firstName, lastName, email, password, id) VALUES($1, $2, $3, $4, $5) RETURNING *';
  const addValues = [req.body.firstName, req.body.lastName, req.body.email, hashedPassword, uid];

  pool.query(addText, addValues, (err, result) => {
    if (err) {
      return res.status(400).send(err.stack);
    } else {
      res.send('success');
    }
  });
});

router.post('/login', async (req, res) => {
  // Validate fields
  console.log('attempt login');
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).json(error.details);

  // Check if user is already in database
  await pool.connect();
  console.log('after connect');

  // Check if user exists by this email first
  const existingText = 'SELECT * FROM users WHERE email = $1';
  const existingValue = [req.body.email];

  const user = await pool.query(existingText, existingValue);
  console.log('after user');
  console.log(user);
  if (!user.rows[0]) return res.status(400).send('Email or password is wrong');

  pool.end();
  return res.json(user);
});

module.exports = router;
