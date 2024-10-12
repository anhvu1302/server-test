"use strict";
const { Model, DataTypes } = require("sequelize");
const generateId = require("../utils/generateId");

module.exports = (sequelize) => {
  class Permission extends Model {
    static associate(models) {
      Permission.hasMany(models.UserHasPermission, {
        foreignKey: "PermissionId",
        as: "permission",
      });
      Permission.hasMany(models.GroupHasPermission, {
        foreignKey: "PermissionId",
        as: "groupHasPermission",
      });
    }
  }
  Permission.init(
    {
      PermissionId: {
        type: DataTypes.CHAR(4),
        primaryKey: true,
      },
      PermissionName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: {
          name: "UNI_PermissionName",
          msg: "Permission name already exists",
        },
      },
      Description: {
        type: DataTypes.STRING(150),
      },
    },
    {
      sequelize,
      modelName: "Permission",
      tableName: "tbl_permissions",
      timestamps: false,
    }
  );
  Permission.beforeCreate(async (record, options) => {
    let id;
    let existingRecord;
    do {
      id = generateId(4);
      existingRecord = await Permission.findOne({
        where: { PermissionId: id },
      });
    } while (existingRecord);
    record.PermissionId = id;
  });
  return Permission;
};
