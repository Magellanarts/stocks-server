const express = require('express');
const app = express();
const { Client } = require('pg');

// Postgres
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

client.connect();

/* client.query('SELECT NOW()', (err, res) => {
  if (err) console.log(err);
  // console.log(err, res);
  client.end();
}); */

require('dotenv').config();

const port = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`Listening on port ${port}`));
