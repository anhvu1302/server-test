"use strict";
const { Model, DataTypes } = require("sequelize");
const generateId = require("../utils/generateId");

module.exports = (sequelize) => {
  class CoinHistory extends Model {
    static associate(models) {
      CoinHistory.belongsTo(models.Order, {
        foreignKey: "UserId",
        as: "coinHistory",
      });
    }
  }

  CoinHistory.init(
    {
      CoinHistoryId: {
        type: DataTypes.STRING(14),
        primaryKey: true,
      },
      UserId: {
        type: DataTypes.STRING(12),
        allowNull: false,
      },
      CoinAmount: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      Description: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      CreatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "CoinHistory",
      tableName: "tbl_coin_history",
      timestamps: false,
    }
  );
  CoinHistory.beforeCreate(async (record, options) => {
    let id;
    let existingRecord;
    do {
      id = generateId(16);
      existingRecord = await CoinHistory.findOne({
        where: { CoinHistoryId: id },
      });
    } while (existingRecord);
    record.CoinHistoryId = id;
  });
  return CoinHistory;
};
