'use strict';
const { Model, DataTypes } = require('sequelize');
const generateId = require('../utils/generateId');

module.exports = (sequelize) => {
  class Voucher extends Model {
    static associate(models) {
      Voucher.hasMany(models.UserVoucher, {
        foreignKey: 'VoucherId',
        as: 'userVouchers',
      });
      Voucher.hasMany(models.Order, {
        foreignKey: 'VoucherId',
        as: 'orders',
      });
    }
  }

  Voucher.init(
    {
      VoucherId: {
        type: DataTypes.STRING(14),
        primaryKey: true,
      },
      DiscountType: {
        type: DataTypes.ENUM('PERCENTAGE', 'FIXED'),
        allowNull: false,
      },
      DiscountAmount: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      MaxDiscountAmount: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      MinOrderAmount: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      UsageLimit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      CurrentUsage: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      ExpiryDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      CreatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Voucher',
      tableName: 'tbl_vouchers',
      timestamps: false,
    }
  );
  Voucher.beforeCreate(async (record, options) => {
    let id;
    let existingRecord;
    do {
      id = generateId(14);
      existingRecord = await Voucher.findOne({
        where: { VoucherId: id }
      });
    } while (existingRecord);
    record.VoucherId = id;
  });
  return Voucher;
};