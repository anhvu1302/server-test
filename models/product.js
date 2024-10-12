"use strict";
const { Model, DataTypes } = require("sequelize");
const generateId = require("../utils/generateId");

module.exports = (sequelize) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.Category, {
        foreignKey: "CategoryId",
        as: "category",
      });
      Product.hasMany(models.ProductVariant, {
        foreignKey: "ProductId",
        as: "productVariants",
      });
      Product.hasMany(models.ProductImage, {
        foreignKey: "ProductId",
        as: "productImages",
      });
      Product.hasMany(models.ProductReview, {
        foreignKey: "ProductId",
        as: "productReviews",
      });
    }
    static async softDelete(ProductId) {
      const product = await Product.findByPk(ProductId);
      if (product) {
        product.DeletedAt = new Date();
        await product.save();
      }
    }

    static async restore(ProductId) {
      const product = await Product.findByPk(ProductId);
      if (product) {
        product.DeletedAt = null;
        await product.save();
      }
    }
  }
  Product.init(
    {
      ProductId: {
        type: DataTypes.CHAR(10),
        primaryKey: true,
      },
      ProductName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          len: {
            args: [5, 255],
            msg: "ProductName must be between 5 and 255 characters.",
          },
        },
      },
      CategoryId: {
        type: DataTypes.CHAR(4),
        allowNull: false,
        references: {
          model: "Category",
          key: "CategoryId",
        },
        onDelete: "SET NULL",
      },
      ReviewCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0,
          notNegative(value) {
            if (value < 0) {
              throw new Error("ReviewCount cannot be negative.");
            }
          },
        },
      },
      ProductDescription: DataTypes.TEXT,
      ProductReview: DataTypes.TEXT,
      DeletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      CreatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Product",
      tableName: "tbl_products",
      timestamps: false,
    }
  );
  Product.beforeCreate(async (record, options) => {
    let id;
    let existingRecord;
    do {
      id = generateId(10);
      existingRecord = await Product.findOne({
        where: { ProductId: id },
      });
    } while (existingRecord);
    record.ProductId = id;
  });
  return Product;
};
