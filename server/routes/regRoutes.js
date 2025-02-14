const express = require('express');
const { reg } = require('../controllers/regController');

const router = express.Router();

router.post('/reg', reg);

module.exports = router;
