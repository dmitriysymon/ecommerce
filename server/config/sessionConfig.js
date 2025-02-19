const session = require('express-session');

const sessionConfig = session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 36000000, // 1 година
  },
});

module.exports = sessionConfig;
