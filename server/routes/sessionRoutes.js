const express = require('express');
const { checkSession } = require('../controllers/sessionController');
const { getUserData } = require('../controllers/getUserController');

const router = express.Router();

router.post('/checkSession', checkSession);
router.get('/getUser', getUserData);

module.exports = router;
