'use strict';
const { Model, DataTypes } = require('sequelize');
const generateId = require('../utils/generateId');

module.exports = (sequelize) => {
  class Size extends Model {
    static associate(models) {
    }
  }
  Size.init(
    {
      SizeId: {
        type: DataTypes.STRING(4),
        primaryKey: true,
      },
      TypeSize: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: {
          name: 'UNI_TypeSize',
          msg: 'Type size already exists'
        },
      },
    },
    {
      sequelize,
      modelName: 'Size',
      tableName: 'tbl_sizes',
      timestamps: false,
    }
  );
  Size.beforeCreate(async (record, options) => {
    let id;
    let existingRecord;
    do {
      id = generateId(4);
      existingRecord = await Size.findOne({
        where: { SizeId: id }
      });
    } while (existingRecord);
    record.SizeId = id;
  });
  return Size;
};
