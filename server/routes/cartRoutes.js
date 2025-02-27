const express = require('express');
const cartController = require('../controllers/cartController');

const router = express.Router();

router.post('/addToCart', cartController.addToCart);

router.post('/updateQuantity', cartController.updateQuantity);

router.post('/removeFromCart', cartController.removeFromCart);

router.get('/getCartItems/:user_id', cartController.getCartItems);

router.get('/getTotalPrice/:user_id', cartController.getTotalPrice);

router.get('/getCartItemCount/:user_id', cartController.getCartItemCount);

router.post('/clearCart/:user_id', cartController.clearCart);

module.exports = router;