"use strict";
const { Model, DataTypes } = require("sequelize");
const generateId = require("../utils/generateId");

module.exports = (sequelize) => {
  class OrderState extends Model {
    static associate(models) {
      OrderState.belongsTo(models.Order, {
        foreignKey: "OrderId",
        as: "order",
      });
    }
  }
  OrderState.init(
    {
      OrderStateId: {
        type: DataTypes.STRING(15),
        primaryKey: true,
      },
      OrderId: {
        type: DataTypes.CHAR(14),
        allowNull: false,
      },
      Status: {
        type: DataTypes.ENUM(
          "Đặt hàng thành công",
          "Người bán đang chuẩn bị hàng",
          "Thanh toán đơn hàng thành công qua VNPAY",
          "Đơn hàng đã bàn giao cho đơn vị vận chuyển",
          "Giao hàng thành công",
          "Hủy đơn hàng thành công"
        ),
        allowNull: false,
      },
      CreatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "OrderState",
      tableName: "tbl_order_states",
      timestamps: false,
    }
  );
  OrderState.beforeCreate(async (record, options) => {
    let id;
    let existingRecord;
    do {
      id = generateId(15);
      existingRecord = await OrderState.findOne({
        where: { OrderStateId: id },
      });
    } while (existingRecord);
    record.OrderStateId = id;
  });
  return OrderState;
};
