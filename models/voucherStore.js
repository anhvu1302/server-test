const { Model, DataTypes, Sequelize } = require("sequelize");
const generateId = require("../utils/generateId");

module.exports = (sequelize) => {
  class VoucherStore extends Model {
    static associate(models) {
      VoucherStore.belongsTo(models.User, {
        foreignKey: "CreatedBy",
        as: "creator",
      });
      VoucherStore.hasMany(models.VoucherStoreHistory, {
        foreignKey: "VoucherStoreId",
        as: "voucherStoreHistories",
      });
    }

    static async softDelete(voucherStoreId, userId) {
      const voucherStore = await VoucherStore.findByPk(voucherStoreId);
      if (voucherStore) {
        voucherStore.DeletedAt = new Date();
        await voucherStore.save({ hooks: false });

        await sequelize.models.VoucherStoreHistory.create({
          VoucherStoreId: voucherStore.VoucherStoreId,
          DiscountType: voucherStore.DiscountType,
          DiscountAmount: voucherStore.DiscountAmount,
          MaxDiscountAmount: voucherStore.MaxDiscountAmount,
          MinOrderAmount: voucherStore.MinOrderAmount,
          CoinAmount: voucherStore.CoinAmount,
          ChangedBy: userId,
          ChangedAt: sequelize.literal("NOW()"),
          Action: "DELETE",
        });
      }
    }

    static async restore(voucherStoreId, userId) {
      const voucherStore = await VoucherStore.scope("deleted").findByPk(
        voucherStoreId
      );
      if (voucherStore) {
        voucherStore.DeletedAt = null;
        await voucherStore.save({ hooks: false });

        await sequelize.models.VoucherStoreHistory.create({
          VoucherStoreId: voucherStore.VoucherStoreId,
          DiscountType: voucherStore.DiscountType,
          DiscountAmount: voucherStore.DiscountAmount,
          MaxDiscountAmount: voucherStore.MaxDiscountAmount,
          MinOrderAmount: voucherStore.MinOrderAmount,
          CoinAmount: voucherStore.CoinAmount,
          ChangedBy: userId,
          ChangedAt: sequelize.literal("NOW()"),
          Action: "RESTORE",
        });
      }
    }
  }

  VoucherStore.init(
    {
      VoucherStoreId: {
        type: DataTypes.STRING(10),
        primaryKey: true,
      },
      DiscountType: {
        type: DataTypes.ENUM("PERCENTAGE", "FIXED"),
        allowNull: false,
      },
      DiscountAmount: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      MaxDiscountAmount: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      MinOrderAmount: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      CoinAmount: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      CreatedBy: {
        type: DataTypes.STRING(12),
        allowNull: false,
        references: {
          model: "Users",
          key: "UserId",
        },
      },
      CreatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      DeletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "VoucherStore",
      tableName: "tbl_voucher_store",
      timestamps: false,
      defaultScope: {
        where: {
          DeletedAt: null,
        },
      },
      scopes: {
        deleted: {
          where: {
            DeletedAt: {
              [Sequelize.Op.ne]: null,
            },
          },
        },
      },
    }
  );

  VoucherStore.beforeCreate(async (record, options) => {
    let id;
    let existingRecord;
    do {
      id = generateId(10);
      existingRecord = await VoucherStore.findOne({
        where: { VoucherStoreId: id },
      });
    } while (existingRecord);
    record.VoucherStoreId = id;
  });

  VoucherStore.afterCreate(async (voucherStore, options) => {
    await sequelize.models.VoucherStoreHistory.create({
      VoucherStoreId: voucherStore.VoucherStoreId,
      DiscountType: voucherStore.DiscountType,
      DiscountAmount: voucherStore.DiscountAmount,
      MaxDiscountAmount: voucherStore.MaxDiscountAmount,
      MinOrderAmount: voucherStore.MinOrderAmount,
      CoinAmount: voucherStore.CoinAmount,
      ChangedBy: voucherStore.CreatedBy,
      ChangedAt: sequelize.literal("NOW()"),
      Action: "CREATE",
    });
  });

  VoucherStore.afterUpdate(async (voucherStore, options) => {
    await sequelize.models.VoucherStoreHistory.create({
      VoucherStoreId: voucherStore.VoucherStoreId,
      DiscountType: voucherStore.DiscountType,
      DiscountAmount: voucherStore.DiscountAmount,
      MaxDiscountAmount: voucherStore.MaxDiscountAmount,
      MinOrderAmount: voucherStore.MinOrderAmount,
      CoinAmount: voucherStore.CoinAmount,
      ChangedBy: options.UserId,
      ChangedAt: sequelize.literal("NOW()"),
      Action: "UPDATE",
    });
  });

  return VoucherStore;
};
