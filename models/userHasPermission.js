'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class UserHasPermission extends Model {
    static associate(models) {
      UserHasPermission.belongsTo(models.Permission, {
        foreignKey: 'PermissionId',
        as: 'permission'
      });
      UserHasPermission.belongsTo(models.User, {
        foreignKey: 'UserId',
        as: 'user'
      });
    }
  }
  UserHasPermission.init(
    {
      UserId: {
        type: DataTypes.CHAR(12),
        allowNull: false,
        primaryKey: true,
      },
      PermissionId: {
        type: DataTypes.CHAR(5),
        allowNull: false,
        primaryKey: true,
      },

    },
    {
      sequelize,
      modelName: 'UserHasPermission',
      tableName: 'tbl_user_has_permissions',
      timestamps: false,
    }
  );
  return UserHasPermission;
};
