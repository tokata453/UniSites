// controllers/productController.js
const { Product, Category } = require('../models');
const { Op } = require('sequelize');
const appError = require('../utils/appError');
const {generatePresignedUrl} = require('../utils/bucket');

// ═══════════════════════════════════════════════════════════
// HELPER: Add presigned URLs to products
// ═══════════════════════════════════════════════════════════

/**
 * Add presigned URLs to a single product
 */
const addPresignedUrls = async (product) => {
  if (!product) return null;
  
  const productJson = product.toJSON ? product.toJSON() : product;
  
  // Generate presigned URLs for all image keys
  if (productJson.images && Array.isArray(productJson.images)) {
    try {
      productJson.imageUrls = await Promise.all(
        productJson.images.map(key => generatePresignedUrl(key))
      );
    } catch (error) {
      console.error('Error generating presigned URLs:', error);
      productJson.imageUrls = [];
    }
  } else {
    productJson.imageUrls = [];
  }
  
  // Also handle category image if it exists
  if (productJson.category && productJson.category.image) {
    try {
      productJson.category.imageUrl = await generatePresignedUrl(productJson.category.image);
    } catch (error) {
      console.error('Error generating category image URL:', error);
      productJson.category.imageUrl = null;
    }
  }
  
  return productJson;
};

/**
 * Add presigned URLs to multiple products (efficiently)
 */
const addPresignedUrlsToMany = async (products) => {
  if (!products || products.length === 0) return [];
  
  // Convert to JSON if needed
  const productsJson = products.map(p => p.toJSON ? p.toJSON() : p);
  
  // Collect all unique keys that need URLs
  const allKeys = new Set();
  
  productsJson.forEach(product => {
    // Product images
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach(key => allKeys.add(key));
    }
    
    // Category image
    if (product.category && product.category.image) {
      allKeys.add(product.category.image);
    }
  });
  
  // Generate all URLs in parallel (much faster!)
  const keyArray = Array.from(allKeys);
  const urlPromises = keyArray.map(key => 
    generatePresignedUrl(key).catch(err => {
      console.error(`Error generating URL for ${key}:`, err);
      return null;
    })
  );
  
  const urls = await Promise.all(urlPromises);
  
  // Create key -> URL map
  const urlMap = {};
  keyArray.forEach((key, index) => {
    if (urls[index]) {
      urlMap[key] = urls[index];
    }
  });
  
  // Add URLs to each product
  productsJson.forEach(product => {
    // Product images
    if (product.images && Array.isArray(product.images)) {
      product.imageUrls = product.images
        .map(key => urlMap[key])
        .filter(Boolean);
    } else {
      product.imageUrls = [];
    }
    
    // Category image
    if (product.category && product.category.image) {
      product.category.imageUrl = urlMap[product.category.image] || null;
    }
  });
  
  return productsJson;
};

/**
 * @desc    Get all products with filtering, sorting, and pagination
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res, next) => {
  try {
    const {
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

    // Build where clause
    const where = { isActive: true };

    // Search by name or description
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Filter by category
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = minPrice;
      if (maxPrice) where.price[Op.lte] = maxPrice;
    }

    // Filter by badge
    if (badge) {
      where.badge = badge;
    }

    // Filter by featured
    if (isFeatured) {
      where.isFeatured = isFeatured === 'true';
    }

    // Pagination
    const offset = (page - 1) * limit;

    // Get products
    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ],
      order: [[sortBy, order]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const productsWithUrls = await addPresignedUrlsToMany(products);

    res.status(200).json({
      success: true,
      data: {
        products: productsWithUrls,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit),
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    return next(new appError('Error fetching products', 500));
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug', 'icon']
        }
      ]
    });

    if (!product) {
      return next(new appError('Product not found', 404));
    }

    // Increment views
    await product.increment('views');

    const productWithUrls = await addPresignedUrls(product);

    res.status(200).json({
      success: true,
      data: {
        product: productWithUrls
      }
    });

  } catch (error) {
    return next(new appError('Error fetching product', 500));
  }
};

/**
 * @desc    Create new product
 * @route   POST /api/products
 * @access  Private/Admin
 */
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
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

    // Validate required fields
    if (!name || !price || !categoryId) {
      return next(new appError('Please provide name, price, and category', 400));
    }

    // Check if category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return next(new appError('Category not found', 404));
    }

    // Create product
    const product = await Product.create({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      description,
      price,
      salePrice,
      sku,
      stock: stock || 0,
      categoryId,
      images,
      badge,
      specifications,
      isFeatured: isFeatured || false,
      isActive: true
    });

    res.status(201).json({
      success: true,
      data: {
        product
      }
    });

  } catch (error) {
    return next(new appError('Error creating product', 500));
  }
};

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return next(new appError('Product not found', 404));
    }
    
    // Update product
    await product.update(req.body);

    const productWithUrls = await addPresignedUrls(product);

    res.status(200).json({
      success: true,
      data: {
        product: productWithUrls
      }
    });

  } catch (error) {
    return next(new appError('Error updating product', 500));
  }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Product not found',
          status: 404
        }
      });
    }

    // Soft delete - just mark as inactive
    await product.update({ isActive: false });

    res.status(200).json({
      success: true,
      data: {
        message: 'Product deleted successfully'
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
};