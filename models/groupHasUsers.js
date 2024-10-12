'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class GroupHasUser extends Model {
    static associate(models) {
      GroupHasUser.belongsTo(models.PermissionGroup, {
        foreignKey: 'PermissionGroupId',
        as: 'permissionGroup'
      });
      GroupHasUser.belongsTo(models.User, {
        foreignKey: 'UserId',
        as: 'user'
      });
    }
  }
  GroupHasUser.init(
    {
      PermissionGroupId: {
        type: DataTypes.CHAR(4),
        allowNull: false,
        primaryKey: true,
      },
      UserId: {
        type: DataTypes.CHAR(12),
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      sequelize,
      modelName: 'GroupHasUser',
      tableName: 'tbl_group_has_users',
      timestamps: false,
    }
  );

  return GroupHasUser;
};
