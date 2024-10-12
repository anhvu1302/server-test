"use strict";
const { Model, DataTypes } = require("sequelize");
const generateId = require("../utils/generateId");

module.exports = (sequelize) => {
  class ProductReview extends Model {
    static associate(models) {
      ProductReview.belongsTo(models.Product, {
        foreignKey: "ProductId",
        as: "product",
      });
      ProductReview.belongsTo(models.User, {
        foreignKey: "UserId",
        as: "user",
      });
    }
  }
  ProductReview.init(
    {
      ReviewId: {
        type: DataTypes.STRING(15),
        primaryKey: true,
      },
      ProductId: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      UserId: {
        type: DataTypes.STRING(12),
        allowNull: false,
      },
      Rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          checkRating(value) {
            if (value < 1 || value > 5) {
              throw new Error("Điểm đánh giá phait từ 1 đến 5");
            }
          },
        },
      },
      Comment: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      ReviewTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      ReviewStatus: {
        type: DataTypes.ENUM("Pending", "Approved", "Rejected"),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "ProductReview",
      tableName: "tbl_product_reviews",
      timestamps: false,
    }
  );
  ProductReview.beforeCreate(async (record, options) => {
    let id;
    let existingRecord;
    do {
      id = generateId(15);
      existingRecord = await ProductReview.findOne({
        where: { ReviewId: id },
      });
    } while (existingRecord);
    record.ReviewId = id;
  });
  return ProductReview;
};
