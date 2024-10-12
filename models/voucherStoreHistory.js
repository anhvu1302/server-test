const { Model, DataTypes } = require("sequelize");
const generateId = require("../utils/generateId");

module.exports = (sequelize) => {
  class VoucherStoreHistory extends Model {
    static associate(models) {
      VoucherStoreHistory.belongsTo(models.VoucherStore, {
        foreignKey: "VoucherStoreId",
        as: "voucherStore",
      });
      VoucherStoreHistory.belongsTo(models.User, {
        foreignKey: "ChangedBy",
        as: "changer",
      });
    }
  }

  VoucherStoreHistory.init(
    {
      VoucherStoreHistoryId: {
        type: DataTypes.STRING(16),
        primaryKey: true,
      },
      VoucherStoreId: {
        type: DataTypes.STRING(10),
        allowNull: false,
        references: {
          model: "VoucherStore",
          key: "VoucherStoreId",
        },
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
      },
      CoinAmount: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      ChangedBy: {
        type: DataTypes.STRING(12),
        allowNull: false,
      },
      ChangedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      Action: {
        type: DataTypes.ENUM("CREATE", "UPDATE", "DELETE", "RESTORE"),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "VoucherStoreHistory",
      tableName: "tbl_voucher_store_history",
      timestamps: false,
    }
  );

  VoucherStoreHistory.beforeCreate(async (record, options) => {
    let id;
    let existingRecord;
    do {
      id = generateId(16);
      existingRecord = await VoucherStoreHistory.findOne({
        where: { VoucherStoreHistoryId: id },
      });
    } while (existingRecord);
    record.VoucherStoreHistoryId = id;
  });

  return VoucherStoreHistory;
};
