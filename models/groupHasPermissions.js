'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class GroupHasPermission extends Model {
    static associate(models) {
      GroupHasPermission.belongsTo(models.PermissionGroup, {
        foreignKey: 'PermissionGroupId',
        as: 'permissionGroup'
      });
      GroupHasPermission.belongsTo(models.Permission, {
        foreignKey: 'PermissionId',
        as: 'permission'
      });
    }
  }
  GroupHasPermission.init(
    {
      PermissionGroupId: {
        type: DataTypes.CHAR(4),
        allowNull: false,
        primaryKey: true,
      },
      PermissionId: {
        type: DataTypes.CHAR(4),
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      sequelize,
      modelName: 'GroupHasPermission',
      tableName: 'tbl_group_has_permissions',
      timestamps: false,
    }
  );

  return GroupHasPermission;
};
