const express = require('express');
const orderController = require('../controllers/orderController');

const router = express.Router();

router.post('/createOrder', orderController.createOrder);

router.patch('/updateStatus', orderController.updateStatus);

router.get('/getOrders', orderController.getOrders);



module.exports = router;    