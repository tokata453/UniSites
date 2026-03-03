// models/CartItem.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CartItem extends Model {
    static associate(models) {
      // CartItem belongs to Cart
      CartItem.belongsTo(models.Cart, {
        foreignKey: 'cartId',
        as: 'cart'
      });

      // CartItem belongs to Product
      CartItem.belongsTo(models.Product, {
        foreignKey: 'productId',
        as: 'product'
      });
    }

    /**
     * Get item subtotal
     */
    getSubtotal() {
      return parseFloat(this.price) * this.quantity;
    }

    /**
     * Check if item is in stock
     */
    async isInStock() {
      const product = await this.getProduct();
      return product && product.stock >= this.quantity;
    }

    /**
     * Validate quantity against stock
     */
    async validateStock() {
      const product = await this.getProduct();
      
      if (!product || !product.isActive) {
        throw new Error('Product is no longer available');
      }

      if (product.stock < this.quantity) {
        throw new Error(`Only ${product.stock} items available in stock`);
      }

      return true;
    }
  }

  CartItem.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    cartId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'carts',
        key: 'id'
      }
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
        isInt: true
      }
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
        isDecimal: true
      }
    }
  }, {
    sequelize,
    modelName: 'CartItem',
    tableName: 'cart_items',
    timestamps: true,
    indexes: [
      { fields: ['cartId'] },
      { fields: ['productId'] },
      { 
        fields: ['cartId', 'productId'], 
        unique: true,
        name: 'cart_items_cart_product_unique'
      }
    ]
  });

  return CartItem;
};