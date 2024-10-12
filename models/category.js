'use strict';
const { Model, DataTypes } = require('sequelize');
const generateId = require('../utils/generateId');

module.exports = (sequelize) => {
  class Category extends Model {
    static associate(models) {
      Category.belongsTo(models.ParentCategory, {
        foreignKey: 'ParentCategoryId',
        as: 'parentCategory',
      });
    }
  }
  Category.init(
    {
      CategoryId: {
        type: DataTypes.STRING(4),
        primaryKey: true,
      },
      CategoryName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: {
          name: 'UNI_CategoryName',
          msg: 'Category name already exists'
        },
        validate: {
          noSpecialChars: function (value) {
            if (!/^[\p{L}\d\s]+$/u.test(value)) {
              throw new Error('CategoryName cannot contain special characters.');
            }
          },
          len: {
            args: [2, 50],
            msg: 'CategoryName must be between 2 and 50 characters.',
          },
        },
      },
      ParentCategoryId: {
        type: DataTypes.STRING(4),
        allowNull: true,
        references: {
          model: 'ParentCategory',
          key: 'ParentCategoryId',
        },
        onDelete: 'SET NULL',
      },
    },
    {
      sequelize,
      modelName: 'Category',
      tableName: 'tbl_categories',
      timestamps: false,
    }
  );
  Category.beforeCreate(async (record, options) => {
    let id;
    let existingRecord;
    do {
      id = generateId(4);
      existingRecord = await Category.findOne({
        where: { CategoryId: id }
      });
    } while (existingRecord);
    record.CategoryId = id;
  });
  return Category;
};
