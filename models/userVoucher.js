'use strict';
const { Model, DataTypes } = require('sequelize');
const generateId = require('../utils/generateId');

module.exports = (sequelize) => {
  class UserVoucher extends Model {
    static associate(models) {
      UserVoucher.belongsTo(models.User, {
        foreignKey: 'UserId',
        as: 'user',
      });
      UserVoucher.belongsTo(models.Voucher, {
        foreignKey: 'VoucherId',
        as: 'voucher',
      });
    }
  }

  UserVoucher.init(
    {
      UserVoucherId: {
        type: DataTypes.STRING(15),
        primaryKey: true,
      },
      UserId: {
        type: DataTypes.STRING(12),
        allowNull: false,
      },
      VoucherId: {
        type: DataTypes.STRING(14),
        allowNull: false,
      },
      UsedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'UserVoucher',
      tableName: 'tbl_user_voucher',
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ['UserId', 'VoucherId'],
          name: 'UNI_UserVoucher',
        },
      ],
    }
  );
  UserVoucher.beforeCreate(async (record, options) => {
    let id;
    let existingRecord;
    do {
      id = generateId(15);
      existingRecord = await UserVoucher.findOne({
        where: { UserVoucherId: id }
      });
    } while (existingRecord);
    record.UserVoucherId = id;
  });
  return UserVoucher;
};