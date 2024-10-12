"use strict";
const { Model, DataTypes } = require("sequelize");
const Sequelize = require("sequelize");
const generateId = require("../utils/generateId");

module.exports = (sequelize) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.User, {
        foreignKey: "UserId",
        as: "user",
      });
      Order.belongsTo(models.Voucher, {
        foreignKey: "VoucherId",
        as: "voucher",
      });
      Order.hasMany(models.OrderDetail, {
        foreignKey: "OrderId",
        as: "orderDetails",
      });
      Order.hasMany(models.OrderState, {
        foreignKey: "OrderId",
        as: "orderStates",
      });
    }
  }

  Order.init(
    {
      OrderId: {
        type: DataTypes.STRING(14),
        primaryKey: true,
      },
      UserId: {
        type: DataTypes.STRING(12),
        allowNull: false,
      },
      VoucherId: {
        type: DataTypes.STRING(14),
        allowNull: true,
      },
      PhoneNumber: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      DeliveryAddress: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      PaymentMethod: {
        type: DataTypes.ENUM("COD", "TRANSFER", "VNPAY", "MOMO"),
        allowNull: false,
      },
      OrderTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      EstimatedDeliveryTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      TotalAmount: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      ShippingFee: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      Note: {
        type: DataTypes.TEXT,
      },
      PaymentAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      CompletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      CancelledAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Order",
      tableName: "tbl_orders",
      timestamps: false,
    }
  );
  Order.beforeCreate(async (record, options) => {
    let id;
    let existingRecord;
    do {
      id = generateId(14);
      existingRecord = await Order.findOne({
        where: { OrderId: id },
      });
    } while (existingRecord);
    record.OrderId = id;
  });
  return Order;
};
