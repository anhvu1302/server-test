'use strict';
const { Model, DataTypes } = require('sequelize');
const generateId = require('../utils/generateId');

module.exports = (sequelize) => {
  class ShoppingCart extends Model {
    static associate(models) {
      ShoppingCart.belongsTo(models.User, {
        foreignKey: 'UserId',
        as: 'user',
      });
      ShoppingCart.belongsTo(models.ProductVariant, {
        foreignKey: 'ProductVariantId',
        as: 'productVariant',
      });
    }
  }
  ShoppingCart.init(
    {
      ShoppingCartId: {
        type: DataTypes.STRING(14),
        primaryKey: true,
      },
      UserId: {
        type: DataTypes.STRING(12),
        allowNull: false,
      },
      ProductVariantId: {
        type: DataTypes.CHAR(12),
        allowNull: false,
      },
      Quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
      },
      CreatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'ShoppingCart',
      tableName: 'tbl_shopping_carts',
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ['CustomerId', 'ProductVariantId'],
          name: 'UNI_CustomerId_ProductVariantId',
        },
      ]
    }
  );
  ShoppingCart.beforeCreate(async (record, options) => {
    let id;
    let existingRecord;
    do {
      id = generateId(14);
      existingRecord = await ShoppingCart.findOne({
        where: { ShoppingCartId: id }
      });
    } while (existingRecord);
    record.ShoppingCartId = id;
  });
  return ShoppingCart;
};
