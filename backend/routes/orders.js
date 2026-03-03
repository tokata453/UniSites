// routes/orders.js
const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  getAllOrders
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

/**
 * @route   GET /api/orders/admin/all
 * @desc    Get all orders (Admin only)
 * @access  Private/Admin
 * @requires JWT token in Authorization header and optional query parameters: status, page, limit
 * @return res.status(200).json({
      success: true,
      data: {
        orders: [order, order, ...], // each order includes user and items
        pagination: {
          total,
          page,
          pages,
          limit
        }
      }
    });
 */
router.get('/admin/all', protect, admin, getAllOrders);

/**
 * @route   POST /api/orders
 * @desc    Create new order
 * @access  Private
 * @requires JWT token in Authorization header and request body containing:
 *  {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      notes
    } = req.body;
 * @return res.status(201).json({
      success: true,
      data: {
        order: completeOrder {order field, items: [orderItem, orderItem, ...]}
      }
    });
 */
router.post('/', protect, createOrder);

/**
 * @route   GET /api/orders
 * @desc    Get user's orders
 * @access  Private
 * @requires JWT token in Authorization header
 * @return res.status(200).json({
      success: true,
      data: {
        orders: [order, order, ...] // each order includes items
      }
    });
 */
router.get('/', protect, getOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order
 * @access  Private
 * @requires JWT token in Authorization header
 * @return res.status(200).json({
      success: true,
      data: {
        order: order {order field, items: [orderItem, orderItem, ...]}
      }
    });
 */
router.get('/:id', protect, getOrder);

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status
 * @access  Private/Admin
 * @requires JWT token in Authorization header and request body containing: { status, trackingNumber } = req.body;
 * @return res.status(200).json({
      success: true,
      data: {
        order: updatedOrder {order field, items: [orderItem, orderItem, ...]}
      }
    });
 */
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;