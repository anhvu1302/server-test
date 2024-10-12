"use strict";
const { Model, DataTypes } = require("sequelize");
const generateId = require("../utils/generateId");

module.exports = (sequelize) => {
  class OrderDetail extends Model {
    static associate(models) {
      OrderDetail.belongsTo(models.Order, {
        foreignKey: "OrderId",
        as: "order",
      });
      OrderDetail.belongsTo(models.ProductVariant, {
        foreignKey: "ProductVariantId",
        as: "productVariant",
      });
    }
  }
  OrderDetail.init(
    {
      OrderDetailId: {
        type: DataTypes.STRING(15),
        primaryKey: true,
      },
      OrderId: {
        type: DataTypes.CHAR(14),
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
          min: 0,
        },
      },
      UnitPrice: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      ReviewedAt: {
        type: DataTypes.DATE,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "OrderDetail",
      tableName: "tbl_order_details",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["OrderId", "ProductVariantId"],
          name: "UNI_OrderId_ProductVariantId",
        },
      ],
    }
  );
  OrderDetail.beforeCreate(async (record, options) => {
    let id;
    let existingRecord;
    do {
      id = generateId(15);
      existingRecord = await OrderDetail.findOne({
        where: { OrderDetailId: id },
      });
    } while (existingRecord);
    record.OrderDetailId = id;
  });

  return OrderDetail;
};
