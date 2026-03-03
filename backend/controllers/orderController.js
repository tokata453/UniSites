// controllers/orderController.js
const { Order, OrderItem, Product, User } = require('../models');
const { sequelize } = require('../models');
const appError = require('../utils/appError');

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      notes
    } = req.body;

    // Validate required fields
    if (!items || items.length === 0) {
      await t.rollback();
      return next(new appError('Order must contain at least one item', 400));
    }

    if (!shippingAddress) {
      await t.rollback();
      return next(new appError('Shipping address is required', 400));
    }
    if (!paymentMethod) {
      await t.rollback();
      return next(new appError('Payment method is required', 400));
    }

    // Calculate order totals and validate products
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction: t });

      if (!product) {
        await t.rollback();
        return next(new appError(`Product with ID ${item.productId} not found`, 404));
      }

      if (product.stock < item.quantity) {
        await t.rollback();
        return next(new appError(`Insufficient stock for ${product.name}. Available: ${product.stock}`, 400));
      }

      // Calculate price (use salePrice if available)
      const price = product.salePrice || product.price;
      const totalPrice = price * item.quantity;
      subtotal += totalPrice;

      // Reduce product stock
      await product.decrement('stock', {
        by: item.quantity,
        transaction: t
      });

      orderItems.push({
        productId: product.id,
        productName: product.name,
        productImage: product.images ? product.images[0] : null,
        quantity: item.quantity,
        price: price,
        totalPrice: totalPrice
      });
    }

    // Calculate totals (you can add tax and shipping calculation here)
    const tax = 0; // TODO: Implement tax calculation
    const shippingCost = 0; // TODO: Implement shipping calculation
    const discount = 0; // TODO: Implement discount/coupon logic
    const totalAmount = subtotal + tax + shippingCost - discount;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${req.user.id}`;

    // Create order
    const order = await Order.create({
      userId: req.user.id,
      orderNumber,
      totalAmount,
      subtotal,
      tax,
      shippingCost,
      discount,
      status: 'pending',
      paymentMethod: paymentMethod || 'credit_card',
      paymentStatus: 'pending',
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      notes
    }, { transaction: t });

    // Create order items
    for (const item of orderItems) {
      await OrderItem.create({
        orderId: order.id,
        ...item
      }, { transaction: t });
    }

    // Commit transaction
    await t.commit();

    // Fetch complete order with items
    const completeOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: 'items'
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: {
        order: completeOrder
      }
    });

  } catch (error) {
    await t.rollback();
    next(error);
  }
};

/**
 * @desc    Get user's orders
 * @route   GET /api/orders
 * @access  Private
 */
const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: OrderItem,
          as: 'items'
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: {
        orders
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single order
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: OrderItem,
          as: 'items'
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        }
      ]
    });

    if (!order) {
      return next(new appError('Order not found', 404));
    }

    // Check if user owns this order or is admin
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return next(new appError('Not authorized to access this order', 403));
    }

    res.status(200).json({
      success: true,
      data: {
        order
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber } = req.body;

    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return next(new appError('Order not found', 404));
    }

    // Valid status transitions
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    
    if (status && !validStatuses.includes(status)) {
      return next(new appError('Invalid order status', 400));
    }

    // Update order
    const updateData = {};
    if (status) updateData.status = status;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    
    // Set timestamps for status changes
    if (status === 'shipped' && !order.shippedAt) {
      updateData.shippedAt = new Date();
    }
    if (status === 'delivered' && !order.deliveredAt) {
      updateData.deliveredAt = new Date();
    }

    await order.update(updateData);

    res.status(200).json({
      success: true,
      data: {
        order
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all orders (Admin only)
 * @route   GET /api/orders/admin/all
 * @access  Private/Admin
 */
const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const where = {};
    if (status) where.status = status;

    const offset = (page - 1) * limit;

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: OrderItem,
          as: 'items'
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit),
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  getAllOrders
};