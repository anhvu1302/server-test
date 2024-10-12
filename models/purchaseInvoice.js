'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class PurchaseInvoice extends Model {
    static associate(models) {
      PurchaseInvoice.belongsTo(models.User, {
        foreignKey: 'UserId',
        as: 'user',
      });
      PurchaseInvoice.hasMany(models.InvoiceDetail, {
        foreignKey: 'PurchaseInvoiceId',
        as: 'invoiceDetails',
      });
    }
  }
  PurchaseInvoice.init(
    {
      PurchaseInvoiceId: {
        type: DataTypes.STRING(14),
        primaryKey: true,
        allowNull: false,
      },
      EntryDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      UserId: {
        type: DataTypes.STRING(12),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'PurchaseInvoice',
      tableName: 'tbl_purchase_invoices',
      timestamps: false,
    }
  );

  return PurchaseInvoice;
};
