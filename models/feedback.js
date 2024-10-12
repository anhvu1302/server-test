'use strict';
const { Model, DataTypes } = require('sequelize');
const generateId = require('../utils/generateId');

module.exports = (sequelize) => {
  class FeedBack extends Model {
    static associate(models) {
      FeedBack.belongsTo(models.User, {
        foreignKey: 'UserId',
        as: 'user',
      });
    }
  }
  FeedBack.init(
    {
      FeedBackId: {
        type: DataTypes.STRING(12),
        primaryKey: true,
      },
      UserId: {
        type: DataTypes.STRING(12),
        allowNull: false,
      },
      PhoneNumber: {
        type: DataTypes.CHAR(10),
        allowNull: false,
      },
      Issue: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      IssueContent: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      SubmissionTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'FeedBack',
      tableName: 'tbl_feedbacks',
      timestamps: false,
    }
  );
  FeedBack.beforeCreate(async (record, options) => {
    let id;
    let existingRecord;
    do {
      id = generateId(12);
      existingRecord = await FeedBack.findOne({
        where: { FeedBackId: id }
      });
    } while (existingRecord);
    record.FeedBackId = id;
  });
  return FeedBack;
};
