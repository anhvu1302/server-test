'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class InvoiceDetail extends Model {
    static associate(models) {
      InvoiceDetail.belongsTo(models.PurchaseInvoice, {
        foreignKey: 'PurchaseInvoiceId',
        as: 'purchaseInvoice',
      });
      InvoiceDetail.belongsTo(models.ProductVariant, {
        foreignKey: 'ProductVariantId',
        as: 'productVariant',
      });
    }
  }
  InvoiceDetail.init(
    {
      InvoiceDetailsId: {
        type: DataTypes.STRING(15),
        primaryKey: true,
      },
      PurchaseInvoiceId: {
        type: DataTypes.STRING(14),
        allowNull: false,
      },
      ProductVariantId: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      Quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      UnitPrice: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
          min: 0,
        },
      },
    },
    {
      sequelize,
      modelName: 'InvoiceDetail',
      tableName: 'tbl_invoice_details',
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ['PurchaseInvoiceId', 'ProductVariantId'],
          name: 'UNI_PurchaseInvoiceId_ProductVariantId',
        },
      ],
    }
  );

  return InvoiceDetail;
};
