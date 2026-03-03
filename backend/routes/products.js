// routes/products.js
const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

/**
 * @route   GET /api/products
 * @desc    Get all products with filtering
 * @access  Public
 * @requires Query Parameters (optional): {
      search,
      categoryId,
      minPrice,
      maxPrice,
      badge,
      isFeatured,
      sortBy = 'createdAt',
      order = 'DESC',
      page = 1,
      limit = 20
    } = req.query;
 * @returns res.status(200).json({
      success: true,
      data: {
        products{product fields, category fields},
        pagination: {
          total: count,
          page,
          pages: Math.ceil(count / limit),
          limit,
        }
      }
    });
 */
router.get('/', getProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Get single product
 * @access  Public
 * @returns res.status(200).json({
       success: true,
       data: {
         product: {
           ...product.dataValues,
           category: product.category
         }
       }
     });
 */
router.get('/:id', getProduct);

/**
 * @route   POST /api/products
 * @desc    Create new product
 * @access  Private/Admin
 * @requires JWT token in Authorization header and Admin, and body parameters:
 * {  name, (required)
      slug,
      description,
      price, (required)
      salePrice,
      sku,
      stock,
      categoryId, (required)
      images,
      badge,
      specifications,
      isFeatured
    } = req.body;
 * @returns res.status(201).json({
      success: true,
      data: {
        product
      }
    });
 */
router.post('/', protect, admin, createProduct);

/**
 * @route   PUT /api/products/:id
 * @desc    Update product
 * @access  Private/Admin
 * @requires JWT token in Authorization header and Admin, and body parameters (at least one):
 * {  name,
      slug,
      description,
      price,
      salePrice,
      sku,
      stock,
      categoryId,
      images,
      badge,
      specifications,
      isFeatured
    } = req.body;
 * @returns res.status(200).json({
      success: true,
      data: {
        product
      }
    });
 */
router.put('/:id', protect, admin, updateProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product
 * @access  Private/Admin
 * @requires JWT token in Authorization header and Admin
 * @returns  res.status(200).json({
      success: true,
      data: {
        message: 'Product deleted successfully'
      }
    });
 */
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;