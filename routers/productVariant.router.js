const { ProductVariant } = require("../models");
const express = require("express");
const {
  createProductVariant,
  getDetailProductVariant,
  getAllProductVariant,
  updateProductVariant,
  deleteProductVariant,
  restoreProductVariant,
} = require("../controllers/productVariant.controller");
const authenticate = require("../middlewares/auth/authenticate");
const checkPermission = require("../middlewares/permission/checkPermission");

const productVariantRouter = express.Router();

productVariantRouter.get(
  "/",
  authenticate,
  checkPermission('GET_ALL_PRODUCT_VARIANT'),
  getAllProductVariant
);
productVariantRouter.get(
  "/:ProductVariantId",
  authenticate,
  checkPermission('GET_PRODUCT_VARIANT_DETAIL'),
  getDetailProductVariant
);
productVariantRouter.post(
  "/",
  authenticate,
  checkPermission('CREATE_PRODUCT_VARIANT'),
  createProductVariant
);
productVariantRouter.put(
  "/:ProductVariantId",
  authenticate,
  checkPermission('UPDATE_PRODUCT_VARIANT'),
  updateProductVariant
);
productVariantRouter.delete(
  "/:ProductVariantId",
  authenticate,
  checkPermission('DELETE_PRODUCT_VARIANT'),
  deleteProductVariant
);
productVariantRouter.put(
  "/:ProductVariantId/restore",
  authenticate,
  checkPermission('RESTORE_PRODUCT_VARIANT'),
  restoreProductVariant
);
module.exports = productVariantRouter;
