// routes/upload.js
const express = require('express');
const router = express.Router();
const {
  uploadProductImages,
  deleteProductImage,
  uploadCategoryImage,
  uploadAvatar,
} = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const { uploadSingle, uploadMultiple } = require('../middleware/multer');

// ─────────────────────────────────────────────
// 📦 PRODUCTS
// ─────────────────────────────────────────────

/**
 * POST   /api/upload/product/:productId
 * Upload images for a product (max 5)
 * Admin only
 * Accepts multipart/form-data with field name "images" (can upload multiple)
 * return  res.status(200).json({
      success: true,
      data: {
        message: `${req.files.length} image(s) uploaded successfully`,
        uploadedUrls: newUrls,
        allImages,
        product: {
          id: product.id,
          name: product.name,
          images: allImages,
        },
      },
    });
 */
router.post('/product/:productId', protect, admin, uploadMultiple, uploadProductImages);

/**
 * DELETE /api/upload/product/:productId/image
 * Delete a specific product image
 * Body: { imageUrl: "https://..." }
 * Admin only
 * @return res.status(200).json({
      success: true,
      data: {
        message: 'Image deleted successfully',
        remainingImages: updatedImages,
      },
    });
 */
router.delete('/product/:productId/image', protect, admin, deleteProductImage);

// ─────────────────────────────────────────────
// 📁 CATEGORIES
// ─────────────────────────────────────────────

/**
 * POST   /api/upload/category/:categoryId
 * Upload image for a category (replaces old)
 * Admin only
 * Accepts multipart/form-data with field name "image"
 * @return res.status(200).json({
      success: true,
      data: {
        message: 'Category image uploaded successfully',
        imageUrl: url,
        category: {
          id: category.id,
          name: category.name,
          image: url,
        },
      },
    });
 */
router.post('/category/:categoryId', protect, admin, uploadSingle, uploadCategoryImage);

// ─────────────────────────────────────────────
// 👤 USER AVATAR
// ─────────────────────────────────────────────

/**
 * POST   /api/upload/avatar
 * Upload avatar for current logged-in user (replaces old)
 * Any authenticated user
 * Accepts multipart/form-data with field name "image"
 * @return     res.status(200).json({
      success: true,
      data: {
        message: 'Avatar uploaded successfully',
        avatarUrl: url,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatar: url,
        },
      },
    });
 */
router.post('/avatar', protect, uploadSingle, uploadAvatar);

module.exports = router;