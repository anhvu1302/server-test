"use strict";
const { Model, DataTypes } = require("sequelize");
const generateId = require("../utils/generateId");

module.exports = (sequelize) => {
  class SystemInfo extends Model {
    static associate(models) {}
  }

  SystemInfo.init(
    {
      SystemInfoId: {
        type: DataTypes.STRING(4),
        primaryKey: true,
      },
      KeyName: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      KeyValue: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "SystemInfo",
      tableName: "tbl_system_info",
      timestamps: false,
    }
  );
  SystemInfo.beforeCreate(async (record, options) => {
    let id;
    let existingRecord;
    do {
      id = generateId(4);
      existingRecord = await SystemInfo.findOne({
        where: { SystemInfoId: id },
      });
    } while (existingRecord);
    record.SystemInfoId = id;
  });
  return SystemInfo;
};
