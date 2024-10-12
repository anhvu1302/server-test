"use strict";
const { Model, DataTypes } = require("sequelize");
const generateId = require("../utils/generateId");

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.ProductReview, {
        foreignKey: "UserId",
        as: "productReviews",
      });
      User.hasMany(models.CoinHistory, {
        foreignKey: "UserId",
        as: "coinHistories",
      });
      User.hasMany(models.UserHasPermission, {
        foreignKey: "UserId",
        as: "userHasPermissions",
      });
      User.hasMany(models.PurchaseInvoice, {
        foreignKey: "UserId",
        as: "purchaseInvoices",
      });
      User.hasMany(models.ShoppingCart, {
        foreignKey: "UserId",
        as: "shoppingCarts",
      });
      User.hasMany(models.Order, {
        foreignKey: "UserId",
        as: "orders",
      });
      User.hasMany(models.GroupHasUser, {
        foreignKey: "UserId",
        as: "groupHasUsers",
      });
    }
  }

  User.init(
    {
      UserId: {
        type: DataTypes.CHAR(12),
        primaryKey: true,
      },
      UserName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: {
          name: "UNI_UserName",
          msg: "User name already exists",
        },
      },
      Password: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      FullName: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      DOB: {
        type: DataTypes.DATE,
      },
      Gender: {
        type: DataTypes.ENUM("Nam", "Nữ", "Khác"),
      },
      Address: {
        type: DataTypes.STRING(255),
      },
      PhoneNumber: {
        type: DataTypes.CHAR(10),
        unique: {
          name: "UNI_PhoneNumber_Users",
          msg: "Phone number already exists",
        },
      },
      Email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: {
          name: "UNI_Email_Users",
          msg: "Email already exists",
        },
      },
      Avatar: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      SecretKey: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      OTP: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      UserType: {
        type: DataTypes.ENUM("EMPLOYEE", "CUSTOMER"),
        allowNull: false,
      },
      TotalCoin: {
        type: DataTypes.BIGINT,
        allowNull: true,
        defaultValue: 0,
      },
      VerifiedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      DeletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      BlockedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      CreatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      LoginAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "tbl_users",
      timestamps: false,
    }
  );
  User.beforeCreate(async (record, options) => {
    let id;
    let existingRecord;
    do {
      id = generateId(12);
      existingRecord = await User.findOne({
        where: { UserId: id },
      });
    } while (existingRecord);
    record.UserId = id;
  });
  return User;
};
