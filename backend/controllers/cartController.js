// controllers/cartController.js
const { Cart, CartItem, Product } = require('../models');
const { generatePresignedUrl } = require('../utils/bucket');
const { Op } = require('sequelize');
const AppError = require('../utils/appError');

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

const getOrCreateCart = async (userId, sessionId) => {
  let cart;
  if (userId) {
    cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      cart = await Cart.create({ 
        userId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
    }
  } else if (sessionId) {
    cart = await Cart.findOne({ where: { sessionId } });
    if (!cart || cart.isExpired()) {
      if (cart?.isExpired()) await cart.destroy();
      cart = await Cart.create({ 
        sessionId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
    }
  } else {
    throw new Error('User ID or Session ID required');
  }
  return cart;
};

const addPresignedUrlsToCartItems = async (items) => {
  const allKeys = new Set();
  items.forEach(item => {
    if (item.product?.images) {
      item.product.images.forEach(key => allKeys.add(key));
    }
  });

  const keyArray = Array.from(allKeys);
  const urls = await Promise.all(
    keyArray.map(key => generatePresignedUrl(key).catch(() => null))
  );

  const urlMap = {};
  keyArray.forEach((key, i) => { if (urls[i]) urlMap[key] = urls[i]; });

  return items.map(item => {
    const itemJson = item.toJSON ? item.toJSON() : item;
    if (itemJson.product?.images) {
      itemJson.product.imageUrls = itemJson.product.images
        .map(key => urlMap[key]).filter(Boolean);
    }
    return itemJson;
  });
};

const calculateCartSummary = (items) => {
  const subtotal = items.reduce((sum, item) => {
    const price = item.product.salePrice || item.product.price;
    return sum + (parseFloat(price) * item.quantity);
  }, 0);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  return {
    itemCount,
    subtotal: parseFloat(subtotal.toFixed(2)),
    tax: 0,
    shipping: 0,
    total: parseFloat(subtotal.toFixed(2))
  };
};

// ═══════════════════════════════════════════════════════════
// GET CART
// ═══════════════════════════════════════════════════════════

const getCart = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'] || req.query.sessionId;

    if (!userId && !sessionId) {
      return res.json({
        success: true,
        data: { items: [], summary: { itemCount: 0, subtotal: 0, tax: 0, shipping: 0, total: 0 } }
      });
    }

    const cart = await getOrCreateCart(userId, sessionId);
    const items = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'slug', 'price', 'salePrice', 'stock', 'images', 'isActive', 'badge']
      }],
      order: [['createdAt', 'DESC']]
    });

    const itemsWithUrls = await addPresignedUrlsToCartItems(items);
    const summary = calculateCartSummary(items);

    res.json({
      success: true,
      data: { cartId: cart.id, items: itemsWithUrls, summary }
    });
  } catch (error) {
    return next(new AppError('Failed to retrieve cart', 500));
  }
};

// ═══════════════════════════════════════════════════════════
// ADD TO CART
// ═══════════════════════════════════════════════════════════

const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'] || req.body.sessionId;

    if (!productId) return next(new AppError("Product ID required", 400))
    if (quantity < 1) return next(new AppError("Quantity must be at least 1", 400))

    const product = await Product.findByPk(productId);
    if (!product) return next(new AppError('Product not foudnd', 404))
    if (!product.isActive) return next(new AppError('Product not available', 400))
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, error: { message: 'Insufficient stock', availableStock: product.stock } });
    }

    const cart = await getOrCreateCart(userId, sessionId);
    let cartItem = await CartItem.findOne({ where: { cartId: cart.id, productId } });
    const price = product.salePrice || product.price;

    if (cartItem) {
      const newQuantity = cartItem.quantity + quantity;
      if (product.stock < newQuantity)
        {
        return res.status(400).json({ 
          success: false, 
          error: { message: 'Insufficient stock', availableStock: product.stock, currentQuantity: cartItem.quantity } 
        });
      }
      await cartItem.update({ quantity: newQuantity, price });
    } else {
      cartItem = await CartItem.create({ cartId: cart.id, productId, quantity, price });
    }

    await cart.extendExpiration();

    const updatedItem = await CartItem.findByPk(cartItem.id, {
      include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'slug', 'price', 'salePrice', 'stock', 'images', 'isActive', 'badge'] }]
    });

    const [itemWithUrls] = await addPresignedUrlsToCartItems([updatedItem]);

    res.json({ success: true, data: { message: 'Item added to cart', item: itemWithUrls, cartId: cart.id } });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// ═══════════════════════════════════════════════════════════
// UPDATE CART ITEM
// ═══════════════════════════════════════════════════════════

const updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'];

    if (!quantity || quantity < 1) return next(new AppError('Quantity must be at least 1', 400))

    const cartItem = await CartItem.findByPk(itemId, {
      include: [
        { model: Cart, as: 'cart', where: userId ? { userId } : { sessionId } },
        { model: Product, as: 'product' }
      ]
    });

    if (!cartItem) return next(new AppError('Cart item not found', 404))
    if (cartItem.product.stock < quantity) {
      return res.status(400).json({ success: false, error: { message: 'Insufficient stock', availableStock: cartItem.product.stock } });
    }

    const price = cartItem.product.salePrice || cartItem.product.price;
    await cartItem.update({ quantity, price });
    await cartItem.cart.extendExpiration();

    const updatedItem = await CartItem.findByPk(itemId, {
      include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'slug', 'price', 'salePrice', 'stock', 'images', 'isActive'] }]
    });

    const [itemWithUrls] = await addPresignedUrlsToCartItems([updatedItem]);
    res.json({ success: true, data: { message: 'Cart item updated', item: itemWithUrls } });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// ═══════════════════════════════════════════════════════════
// REMOVE FROM CART
// ═══════════════════════════════════════════════════════════

const removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'];

    const cartItem = await CartItem.findByPk(itemId, {
      include: [{ model: Cart, as: 'cart', where: userId ? { userId } : { sessionId } }]
    });

    if (!cartItem) return res.status(404).json({ success: false, error: { message: 'Cart item not found' } });

    await cartItem.destroy();
    res.json({ success: true, data: { message: 'Item removed from cart' } });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// ═══════════════════════════════════════════════════════════
// CLEAR CART
// ═══════════════════════════════════════════════════════════

const clearCart = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'];

    const cart = await Cart.findOne({ where: userId ? { userId } : { sessionId } });
    if (!cart) return res.json({ success: true, data: { message: 'Cart is already empty' } });

    await CartItem.destroy({ where: { cartId: cart.id } });
    res.json({ success: true, data: { message: 'Cart cleared successfully' } });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// ═══════════════════════════════════════════════════════════
// MERGE CARTS (Guest → User on login)
// ═══════════════════════════════════════════════════════════

const mergeCarts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.body;

    if (!sessionId) return res.status(400).json({ success: false, error: { message: 'Session ID required' } });

    const guestCart = await Cart.findOne({ where: { sessionId } });
    if (!guestCart) return res.json({ success: true, data: { message: 'No guest cart to merge' } });

    let userCart = await Cart.findOne({ where: { userId } });
    
    if (!userCart) {
      await guestCart.update({ userId, sessionId: null });
      return res.json({ success: true, data: { message: 'Guest cart converted to user cart' } });
    }

    const guestItems = await CartItem.findAll({ 
      where: { cartId: guestCart.id },
      include: [{ model: Product, as: 'product' }]
    });

    for (const guestItem of guestItems) {
      const existingItem = await CartItem.findOne({ where: { cartId: userCart.id, productId: guestItem.productId } });
      if (existingItem) {
        const newQuantity = Math.min(existingItem.quantity + guestItem.quantity, guestItem.product.stock);
        await existingItem.update({ quantity: newQuantity });
      } else {
        await CartItem.create({
          cartId: userCart.id,
          productId: guestItem.productId,
          quantity: Math.min(guestItem.quantity, guestItem.product.stock),
          price: guestItem.price
        });
      }
    }

    await guestCart.destroy();
    res.json({ success: true, data: { message: 'Carts merged successfully', mergedItems: guestItems.length } });
  } catch (error) {
    console.error('Merge carts error:', error);
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// ═══════════════════════════════════════════════════════════
// VALIDATE CART
// ═══════════════════════════════════════════════════════════

const validateCart = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'];

    const cart = await Cart.findOne({ where: userId ? { userId } : { sessionId } });
    if (!cart) return res.json({ success: true, data: { valid: true, issues: [] } });

    const items = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [{ model: Product, as: 'product' }]
    });

    const issues = [];
    const itemsToRemove = [];

    for (const item of items) {
      if (!item.product) {
        issues.push({ itemId: item.id, type: 'removed', message: 'Product no longer available' });
        itemsToRemove.push(item.id);
        continue;
      }
      if (!item.product.isActive) {
        issues.push({ itemId: item.id, productId: item.productId, type: 'unavailable', message: 'Product unavailable' });
        itemsToRemove.push(item.id);
        continue;
      }
      if (item.product.stock < item.quantity) {
        issues.push({
          itemId: item.id,
          productId: item.productId,
          type: 'stock',
          message: `Only ${item.product.stock} items available`,
          currentQuantity: item.quantity,
          availableStock: item.product.stock
        });
      }
      const currentPrice = item.product.salePrice || item.product.price;
      if (parseFloat(item.price) !== parseFloat(currentPrice)) {
        issues.push({
          itemId: item.id,
          productId: item.productId,
          type: 'price_change',
          message: 'Price changed',
          oldPrice: parseFloat(item.price),
          newPrice: parseFloat(currentPrice)
        });
      }
    }

    if (itemsToRemove.length > 0) {
      await CartItem.destroy({ where: { id: { [Op.in]: itemsToRemove } } });
    }

    res.json({ success: true, data: { valid: issues.length === 0, issues, removedItems: itemsToRemove.length } });
  } catch (error) {
    console.error('Validate cart error:', error);
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeCarts,
  validateCart
};