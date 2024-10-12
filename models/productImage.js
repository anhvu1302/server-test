'use strict';
const { Model, DataTypes } = require('sequelize');
const generateId = require('../utils/generateId');

module.exports = (sequelize) => {
  class ProductImage extends Model {
    static associate(models) {
      ProductImage.belongsTo(models.Product, {
        foreignKey: 'ProductId',
        as: 'product',
      });
      ProductImage.belongsTo(models.Color, {
        foreignKey: 'ColorId',
        as: 'color',
      });
    }
  }
  ProductImage.init(
    {
      ProductImageId: {
        type: DataTypes.CHAR(10),
        primaryKey: true,
      },
      ProductId: {
        type: DataTypes.CHAR(10),
        allowNull: false,
        references: {
          model: 'Product',
          key: 'ProductId',
        },
      },
      ColorId: {
        type: DataTypes.CHAR(4),
        allowNull: false,
        references: {
          model: 'Color',
          key: 'ColorId',
        },
      },
      Images: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'ProductImage',
      tableName: 'tbl_product_images',
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ['ProductId', 'ColorId'],
          name: 'UNI_ProductImages',
        },
      ],
    }
  );
  ProductImage.beforeCreate(async (record, options) => {
    let id;
    let existingRecord;
    do {
      id = generateId(10);
      existingRecord = await ProductImage.findOne({
        where: { ProductImageId: id }
      });
    } while (existingRecord);
    record.ProductImageId = id;
  });
  return ProductImage;
};
