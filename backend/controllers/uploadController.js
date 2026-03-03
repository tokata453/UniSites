// controllers/uploadController.js
const { uploadFile, deleteFile, keyFromUrl, refreshUrl } = require('../utils/bucket');
const { Product, Category, User } = require('../models');
const appError = require('../utils/appError');

// ─────────────────────────────────────────────
// 📦 PRODUCT IMAGES
// ─────────────────────────────────────────────

/**
 * @desc    Upload product images (up to 5)
 * @route   POST /api/upload/product/:productId
 * @access  Private/Admin
 *
 * - Accepts up to 5 images
 * - Uploads all to Railway Bucket under /products/
 * - Saves URLs to product.images array in database
 */
const uploadProductImages = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!req.files || req.files.length === 0) {
      return next(new appError('Please upload at least one image', 400));
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return next(new appError('Product not found', 404));
    }

    // Upload all files and get presigned URLs
    const uploadPromises = req.files.map(file => 
      uploadFile(file.buffer, 'products', file.mimetype, file.originalname)
    );
    const uploadResults = await Promise.all(uploadPromises);

    // Store the KEYS (not presigned URLs) in database
    const keys = uploadResults.map(r => r.key);
    const presignedUrls = uploadResults.map(r => r.url);

    // Update product images (store keys)
    const currentImages = product.images || [];
    const updatedImages = [...currentImages, ...keys];
    product.images = updatedImages;
    await product.save();

    res.status(200).json({
      success: true,
      data: {
        message: `${keys.length} image(s) uploaded successfully`,
        uploadedUrls: presignedUrls, // Return presigned URLs to client
        keys: keys, // Also return keys
        allImages: updatedImages, // All keys
        product
      }
    });
  } 
  catch (error) {
    return next(error);
  }
}


/**
 * @desc    Delete a specific product image
 * @route   DELETE /api/upload/product/:productId/image
 * @access  Private/Admin
 *
 * Body: { imageKey: 'products/123456789.jpg' }
 */
const deleteProductImage = async (req, res, next) => {
try {
    const { productId } = req.params;
    const { imageKey } = req.body; // Expecting key, not URL

    if (!imageKey) {
      return next(appError('Image key is required', 400));
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return next(appError('Product not found', 404));
    }

    // Delete from Railway Bucket
    await deleteFile(imageKey);

    // Remove from product images array
    const updatedImages = product.images.filter(key => key !== imageKey);
    product.images = updatedImages;
    await product.save();

    res.status(200).json({
      success: true,
      data: {
        message: 'Image deleted successfully',
        remainingImages: updatedImages
      }
    });
  } catch (error) {
    return next(error);
  }
};


// ─────────────────────────────────────────────
// 📁 CATEGORY IMAGE
// ─────────────────────────────────────────────

/**
 * @desc    Upload category image
 * @route   POST /api/upload/category/:categoryId
 * @access  Private/Admin
 *
 * - Accepts 1 image
 * - Uploads to /categories/ in bucket
 * - Replaces old image if one existed
 */
const uploadCategoryImage = async (req, res, next) => {
  try {
      const { categoryId } = req.params;

      if (!req.file) {
        return next(appError('Please upload an image', 400));
      }

      const category = await Category.findByPk(categoryId);
      if (!category) {
        return next(appError('Category not found', 404));
      }

      // Delete old image if exists
      if (category.image) {
        await deleteFile(category.image);
      }

      // Upload new image
      const { url: presignedUrl, key } = await uploadFile(
        req.file.buffer,
        'categories',
        req.file.mimetype,
        req.file.originalname
      );

      // Store KEY in database
      category.image = key;
      await category.save();

      res.status(200).json({
        success: true,
        data: {
          message: 'Category image uploaded successfully',
          imageUrl: presignedUrl, // Return presigned URL
          imageKey: key,
          category
        }
      });
    } catch (error) {
      return next(error);
    }
};

// ─────────────────────────────────────────────
// 👤 USER AVATAR
// ─────────────────────────────────────────────

/**
 * @desc    Upload current user's avatar
 * @route   POST /api/upload/avatar
 * @access  Private (any logged-in user)
 *
 * - Accepts 1 image
 * - Uploads to /avatars/ in bucket
 * - Replaces old avatar if one existed
 */
const uploadAvatar = async (req, res, next) => {
  try {
      if (!req.file) {
        return next(appError('Please upload an image', 400));
      }

      const user = await User.findByPk(req.user.id);
      if (!user) {
        return next(appError('User not found', 404));
      }
      

      // Delete old avatar if exists
      if (user.avatar) {
        await deleteFile(user.avatar);
      }

      // Upload new avatar
      const { url: presignedUrl, key } = await uploadFile(
        req.file.buffer,
        'avatars',
        req.file.mimetype,
        req.file.originalname
      );

      // Store KEY in database
      user.avatar = key;
      await user.save();

      res.status(200).json({
        success: true,
        data: {
          message: 'Avatar uploaded successfully',
          avatarUrl: presignedUrl, // Return presigned URL
          avatarKey: key,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            avatar: user.avatar
          }
        }
      });
    } catch (error) {
      return next(error);
    }
  }
  



module.exports = {
  uploadProductImages,
  deleteProductImage,
  uploadCategoryImage,
  uploadAvatar,
};