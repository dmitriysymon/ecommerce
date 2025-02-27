const express = require('express');
const orderController = require('../controllers/orderController');

const router = express.Router();

router.post('/createOrder', orderController.createOrder);
router.get('/getOrders/:user_id', orderController.getUserOrders);


module.exports = router;    