'use strict';
const { Model, DataTypes } = require('sequelize');
const generateId = require('../utils/generateId');

module.exports = (sequelize) => {
  class ParentCategory extends Model {
    static associate(models) {
      ParentCategory.hasMany(models.Category, {
        foreignKey: 'ParentCategoryId',
        as: 'categories',
      });
    }
  }
  ParentCategory.init(
    {
      ParentCategoryId: {
        type: DataTypes.STRING(4),
        primaryKey: true,
      },
      ParentCategoryName: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: {
          name: 'UNI_ParentCategoryName',
          msg: 'Parent category name already exists'
        },
        validate: {
          noSpecialChars: function (value) {
            if (!/^[\p{L}\d\s]+$/u.test(value)) {
              throw new Error('Category name cannot contain special characters.');
            }
          },
          len: {
            args: [2, 50],
            msg: 'Category name must be between 2 and 50 characters.',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'ParentCategory',
      tableName: 'tbl_parent_categories',
      timestamps: false,
    }
  );
  ParentCategory.beforeCreate(async (record, options) => {
    let id;
    let existingRecord;
    do {
      id = generateId(4);
      existingRecord = await ParentCategory.findOne({
        where: { ParentCategoryId: id }
      });
    } while (existingRecord);
    record.ParentCategoryId = id;
  });
  return ParentCategory;
};
