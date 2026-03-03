// routes/categories.js
const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

/**
 * @route   GET /api/categories
 * @desc    Get all categories
 * @access  Public
 * @return  res.status(200).json({
 *            success: true,
 *            data: {
 *              categories: [ 
 *               {
                "id"
                "name"
                "slug"
                "description"
                "icon"
                "image"
                "sortOrder"
                },
 *              ... ]
 *            }
 *          });
 */
router.get('/', getCategories);

/**
 * @route   GET /api/categories/:id
 * @desc    Get single category with products
 * @access  Public
 * @return  res.status(200).json({
 *            success: true,
 *            data: {
 *              category: {
 *                "id"
 *                "name"
 *                "slug"
 *                "description"
 *                "icon"
 *                "image"
 *                "sortOrder"
 *                products: [
 *                  {
                    "id"
                    "name"
                    "slug"
                    "price"
                    "salePrice"
                    "images"
                    "badge"
                    "rating"
                    "reviewCount"
                    "stock"
                  },
 *                  ...
 *                ]
 *              }
 *            }
 *          });
 */
router.get('/:id', getCategory);

/**
 * @route   POST /api/categories
 * @desc    Create new category
 * @access  Private/Admin
 * @requires { name (required), slug, description, icon, image, sortOrder } = req.body;
 * @return  res.status(201).json({
 *            success: true,
 *            data: {
 *              category: {
 *                "id"
 *                "name"
 *                "slug"
 *                "description"
 *                "icon"
 *                "image"
 *                "sortOrder"
 *              }
 *            }
 *          });
 */
router.post('/', protect, admin, createCategory);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category
 * @access  Private/Admin
 * @requires { name, slug, description, icon, image, sortOrder } = req.body;
 * @return  res.status(200).json({
 *            success: true,
 *            data: {
 *              category: {
 *                "id"
 *                "name"
 *                "slug"
 *                "description"
 *                "icon"
 *                "image"
 *                "sortOrder"
 *              }
 *            }
 *          });
 */
router.put('/:id', protect, admin, updateCategory);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category
 * @access  Private/Admin
 * @return  res.status(200).json({
 *            success: true,
 *            data: {
 *              message: 'Category deleted successfully'
 *            }
 *          });
 */
router.delete('/:id', protect, admin, deleteCategory);

module.exports = router;