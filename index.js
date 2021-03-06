const express = require('express');
const app = express();
const cors = require('cors');

// Import Routes
const authRoute = require('./routes/auth');
const userRoute = require('./routes/user');

require('dotenv').config();

// allow cross-origin requests
app.use(cors());

const port = process.env.PORT || 3000;
const environment = process.env.NODE_ENV || 'development';

app.get('/', (req, res) => res.send('Hello World!'));

// Middleware
app.use(express.json());

// Route Middlewares
app.use('/api/auth', authRoute);
app.use('/api/user', userRoute);

app.listen(port, () => console.log(`Listening on port ${port}`));
