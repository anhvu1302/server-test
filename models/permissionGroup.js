"use strict";
const { Model, DataTypes } = require("sequelize");
const generateId = require("../utils/generateId");

module.exports = (sequelize) => {
  class PermissionGroup extends Model {
    static associate(models) {
      PermissionGroup.hasMany(models.GroupHasPermission, {
        foreignKey: "PermissionGroupId",
        as: "permissions",
      });
      PermissionGroup.hasMany(models.GroupHasUser, {
        foreignKey: "PermissionGroupId",
        as: "users",
      });
    }
  }
  PermissionGroup.init(
    {
      PermissionGroupId: {
        type: DataTypes.CHAR(4),
        primaryKey: true,
      },
      PermissionGroupName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: {
          name: "UNI_PermissionGroupName",
          msg: "Permission group name already exists",
        },
      },
      RoleLevel: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: {
          name: "UNI_RoleLevel",
          msg: "Role level already exists",
        },
      },
      Description: {
        type: DataTypes.STRING(150),
      },
    },
    {
      sequelize,
      modelName: "PermissionGroup",
      tableName: "tbl_permission_groups".toLowerCase(),
      timestamps: false,
    }
  );
  PermissionGroup.beforeCreate(async (record, options) => {
    let id;
    let existingRecord;
    do {
      id = generateId(4);
      existingRecord = await PermissionGroup.findOne({
        where: { PermissionGroupId: id },
      });
    } while (existingRecord);
    record.PermissionGroupId = id;
  });
  return PermissionGroup;
};
