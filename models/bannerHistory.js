"use strict";
const { Model, DataTypes } = require("sequelize");
const generateId = require("../utils/generateId");

module.exports = (sequelize) => {
  class BannerHistory extends Model {
    static associate(models) {
      BannerHistory.belongsTo(models.Banner, {
        foreignKey: "BannerId",
        as: "banner",
      });
      BannerHistory.belongsTo(models.User, {
        foreignKey: "ChangedBy",
        as: "changer",
      });
    }
  }

  BannerHistory.init(
    {
      BannerHistoryId: {
        type: DataTypes.STRING(14),
        primaryKey: true,
      },
      BannerId: {
        type: DataTypes.STRING(10),
        allowNull: false,
        references: {
          model: "Banners",
          key: "BannerId",
        },
      },
      Title: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      ImageUrl: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      LinkUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      StartDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      EndDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      ChangedBy: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      ChangeAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      Action: {
        type: DataTypes.ENUM("CREATE", "UPDATE", "DELETE", "RESTORE"),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "BannerHistory",
      tableName: "tbl_banner_history",
      timestamps: false,
    }
  );
  BannerHistory.beforeCreate(async (record, options) => {
    let id;
    let existingRecord;
    do {
      id = generateId(14);
      existingRecord = await BannerHistory.findOne({
        where: { BannerHistoryId: id },
      });
    } while (existingRecord);
    record.BannerHistoryId = id;
  });
  return BannerHistory;
};
