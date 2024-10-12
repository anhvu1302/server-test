"use strict";
const { Model, DataTypes } = require("sequelize");
const generateId = require("../utils/generateId");

module.exports = (sequelize) => {
  class Color extends Model {
    static associate(models) {}
  }
  Color.init(
    {
      ColorId: {
        type: DataTypes.STRING(4),
        primaryKey: true,
      },
      ColorName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: {
          name: "UNI_ColorName",
          msg: "Color name already exists",
        },
      },
      ColorCode: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      sequelize,
      modelName: "Color",
      tableName: "tbl_colors",
      timestamps: false,
    }
  );
  Color.beforeCreate(async (record, options) => {
    let id;
    let existingRecord;
    do {
      id = generateId(4);
      existingRecord = await Color.findOne({
        where: { ColorId: id },
      });
    } while (existingRecord);
    record.ColorId = id;
  });
  return Color;
};
