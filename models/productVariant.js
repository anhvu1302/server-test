"use strict";
const { Model, DataTypes } = require("sequelize");
const generateId = require("../utils/generateId");

module.exports = (sequelize) => {
  class ProductVariant extends Model {
    static associate(models) {
      ProductVariant.belongsTo(models.Product, {
        foreignKey: "ProductId",
        as: "product",
      });
      ProductVariant.belongsTo(models.Color, {
        foreignKey: "ColorId",
        as: "color",
      });
      ProductVariant.belongsTo(models.Size, {
        foreignKey: "SizeId",
        as: "size",
      });
      ProductVariant.hasMany(models.OrderDetail, {
        foreignKey: "ProductVariantId",
        as: "orderDetails",
      });
      ProductVariant.hasMany(models.ShoppingCart, {
        foreignKey: "ProductVariantId",
        as: "shoppingCarts",
      });
      ProductVariant.hasMany(models.InvoiceDetail, {
        foreignKey: "ProductVariantId",
        as: "invoiceDetails",
      });
    }

    static async softDelete(ProductVariantId) {
      const productVariant = await ProductVariant.findByPk(ProductVariantId);
      if (productVariant) {
        productVariant.DeletedAt = new Date();
        await productVariant.save();
      }
    }

    static async restore(ProductVariantId) {
      const productVariant = await ProductVariant.findByPk(ProductVariantId);
      if (productVariant) {
        productVariant.DeletedAt = null;
        await productVariant.save();
      }
    }
  }
  ProductVariant.init(
    {
      ProductVariantId: {
        type: DataTypes.CHAR(12),
        primaryKey: true,
      },
      ProductId: {
        type: DataTypes.CHAR(10),
        allowNull: false,
        references: {
          model: "Product",
          key: "ProductId",
        },
      },
      ColorId: {
        type: DataTypes.CHAR(4),
        allowNull: false,
        references: {
          model: "Color",
          key: "ColorId",
        },
      },
      SizeId: {
        type: DataTypes.CHAR(4),
        allowNull: false,
        references: {
          model: "Size",
          key: "SizeId",
        },
      },
      Price: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
          min: {
            args: [0],
            msg: "Price must be greater than or equal to 0",
          },
        },
      },
      Discount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: {
            args: [0],
            msg: "Discount must be greater than or equal to 0",
          },
          max: {
            args: [100],
            msg: "Discount must be less than or equal to 100",
          },
        },
      },
      InventoryNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: {
            args: [0],
            msg: "InventoryNumber must be greater than or equal to 0",
          },
        },
      },
      DeletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "ProductVariant",
      tableName: "tbl_product_variants",
      timestamps: false,
    }
  );
  ProductVariant.beforeCreate(async (record, options) => {
    let id;
    let existingRecord;
    do {
      id = generateId(12);
      existingRecord = await ProductVariant.findOne({
        where: { ProductVariantId: id },
      });
    } while (existingRecord);
    record.ProductVariantId = id;
  });
  return ProductVariant;
};
