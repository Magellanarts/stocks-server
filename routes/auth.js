const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const uuidv4 = require('uuid/v4');
const jwt = require('jsonwebtoken');

const { registrationValidation, loginValidation, getUserValidation } = require('../validation');

require('dotenv').config();

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

  if (emailExists.rows.exists) return res.status(400).send('User already exists');

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
  const { error } = loginValidation(req.body);

  if (error) return res.status(400).json(error.details);

  // Check if user is already in database
  await pool.connect();

  // Check if user exists by this email first
  const existingText =
    'SELECT firstname, lastname, email, id, stocks, password FROM users WHERE email = $1';
  const existingValue = [req.body.email];

  let user = await pool.query(existingText, existingValue);
  user = user.rows[0];
  if (!user) return res.status(400).send('Email or password is wrong');

  // Check if password is correct
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).send('Invalid Password');

  // Create and assign a token
  const token = jwt.sign(
    { id: user.id, firstname: user.firstname, lastName: user.lastname, email: user.email },
    process.env.TOKEN_SECRET
  );
  delete user.password;
  return res.header('authToken', token).send({ token, userId: user.id });
});

module.exports = router;
