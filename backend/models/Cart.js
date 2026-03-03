// models/Cart.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    static associate(models) {
      // Cart belongs to User (nullable for guest carts)
      Cart.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });

      // Cart has many CartItems
      Cart.hasMany(models.CartItem, {
        foreignKey: 'cartId',
        as: 'items',
        onDelete: 'CASCADE'
      });
    }

    /**
     * Get cart total
     */
    async getTotal() {
      const items = await this.getItems({
        include: [{
          model: sequelize.models.Product,
          as: 'product',
          attributes: ['id', 'name', 'price', 'salePrice', 'stock', 'isActive']
        }]
      });

      return items.reduce((total, item) => {
        const price = item.product.salePrice || item.product.price;
        return total + (parseFloat(price) * item.quantity);
      }, 0);
    }

    /**
     * Get item count
     */
    async getItemCount() {
      const items = await this.getItems();
      return items.reduce((count, item) => count + item.quantity, 0);
    }

    /**
     * Check if cart is expired
     */
    isExpired() {
      if (!this.expiresAt) return false;
      return new Date() > new Date(this.expiresAt);
    }

    /**
     * Extend cart expiration
     */
    async extendExpiration() {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now
      await this.update({ expiresAt });
    }
  }

  Cart.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Cart',
    tableName: 'carts',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['sessionId'] },
      { fields: ['expiresAt'] }
    ]
  });

  return Cart;
};