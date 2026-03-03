// routes/cart.js
const express = require('express');
const router = express.Router();
const {getCart, addToCart, updateCartItem, removeFromCart, clearCart, mergeCarts, validateCart} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

// ═══════════════════════════════════════════════════════════
// CART ROUTES
// ═══════════════════════════════════════════════════════════

// Get cart (works for both guest and logged-in users)
router.get('/', protect, getCart);

// Add item to cart
router.post('/items', protect, addToCart);

// Update cart item quantity
router.put('/items/:itemId', protect, updateCartItem);

// Remove item from cart
router.delete('/items/:itemId', protect, removeFromCart);

// Clear entire cart
router.delete('/clear', protect, clearCart);

// Merge guest cart with user cart (on login)
router.post('/merge', protect, mergeCarts);

// Validate cart (check stock, prices, availability)
router.get('/validate', protect, validateCart);

module.exports = router;