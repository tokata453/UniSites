// controllers/categoryController.js
const { Category, Product } = require('../models');
const AppError = require('../utils/appError');
const { generatePresignedUrl } = require('../utils/bucket');

const addPresignedUrlToCategories = async (categories) => {
  if (!categories || categories.length === 0) return [];

  const categoriesJson = categories.map(c => c.toJSON ? c.toJSON() : c);

  return await Promise.all(categoriesJson.map(async (category) => {
    if (category.image) {
      try {
        category.imageUrl = await generatePresignedUrl(category.image);
      } catch (error) {
        console.error('Error generating category image URL:', error);
        category.imageUrl = null;
      }
    } else {
      category.imageUrl = null;
    }
    return category;
  }));
};

const addPresignedUrlToCategory = async (category) => {
  if (!category) return null;

  const categoryJson = category.toJSON ? category.toJSON() : category;

  if (categoryJson.image) {
    try {
      categoryJson.imageUrl = await generatePresignedUrl(categoryJson.image);
    } catch (error) {
      console.error('Error generating category image URL:', error);
      categoryJson.imageUrl = null;
    }
  } else {
    categoryJson.imageUrl = null;
  }

  if(categoryJson.products && Array.isArray(categoryJson.products)) {
    categoryJson.products = await Promise.all(categoryJson.products.map(async (product) => {
      if (product.images && Array.isArray(product.images)) {
        try {
          product.imageUrls = await Promise.all(
            product.images.map(key => generatePresignedUrl(key))
          );
        } catch (error) {
          console.error('Error generating product image URLs:', error);
          product.imageUrls = [];
        }
      } else {
        product.imageUrls = [];
      }
      return product;
    }));
  }

  return categoryJson;
};

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
      attributes: ['id', 'name', 'slug', 'description', 'icon', 'image', 'sortOrder']
    });

    const categoriesWithUrls = await addPresignedUrlToCategories(categories);

    res.status(200).json({
      success: true,
      data: {
        categories: categoriesWithUrls
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single category with products
 * @route   GET /api/categories/:id
 * @access  Public
 */
const getCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [
        {
          model: Product,
          as: 'products',
          where: { isActive: true },
          required: false,
          attributes: [
            'id', 'name', 'slug', 'price', 'salePrice', 
            'images', 'badge', 'rating', 'reviewCount', 'stock'
          ]
        }
      ]
    });

    if (!category) {
      return next(new AppError('Category not found', 404));
    }

    const categoryWithUrls = await addPresignedUrlToCategory(category);

    res.status(200).json({
      success: true,
      data: {
        category: categoryWithUrls
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new category
 * @route   POST /api/categories
 * @access  Private/Admin
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, icon, image, sortOrder } = req.body;

    // Validate required fields
    if (!name) {
      return next(new AppError('Please provide category name', 400));
    }

    // Create category
    const category = await Category.create({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      description,
      icon,
      image,
      sortOrder: sortOrder || 0,
      isActive: true
    });

    res.status(201).json({
      success: true,
      data: {
        category
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Private/Admin
 */
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return next(new AppError('Category not found', 404));
    }

    // Update category
    await category.update(req.body);

    res.status(200).json({
      success: true,
      data: {
        category
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return next(new AppError('Category not found', 404));
    }

    // Check if category has products
    const productCount = await Product.count({
      where: { categoryId: category.id }
    });

    if (productCount > 0) {
      return next(new AppError(`Cannot delete category with ${productCount} products. Please reassign or delete products first.`, 400));
    }

    // Soft delete
    await category.update({ isActive: false });

    res.status(200).json({
      success: true,
      data: {
        message: 'Category deleted successfully'
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
};