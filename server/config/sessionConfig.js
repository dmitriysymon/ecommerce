const session = require('express-session');

const sessionConfig = session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 3600000, // 1 година
  },
});

module.exports = sessionConfig;
