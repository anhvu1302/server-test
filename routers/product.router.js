const {
  createProduct,
  deleteProduct,
  getAllProductActive,
  getAllProduct,
  getDetailProduct,
  getProductReviews,
  getParityProduct,
  updateProduct,
  uploadProductImage,
  restoreProduct,
} = require("../controllers/product.controller.js");
const authenticate = require("../middlewares/auth/authenticate.js");
const checkExist = require("../middlewares/validations/checkExits.js");
const { Product } = require("../models/index.js");
const uploadImage = require("../middlewares/upload/uploadImage.js");
const express = require("express");
const checkPermission = require("../middlewares/permission/checkPermission.js");
const productRouter = express.Router();

productRouter.get("/", authenticate,checkPermission('GET_ALL_PRODUCT'), getAllProduct);
productRouter.get("/active", getAllProductActive);
productRouter.get("/:ProductId", checkExist(Product), getDetailProduct);
productRouter.get("/:ProductId/review", checkExist(Product), getProductReviews);
productRouter.get(
  "/:ProductId/parity-product",
  checkExist(Product),
  getParityProduct
);
productRouter.post("/", authenticate,checkPermission('CREATE_PRODUCT'), createProduct);
productRouter.post(
  "/upload-product-image",
  authenticate,
  checkPermission('UPLOAD_PRODUCT_IMAGE'),
  uploadImage("product"),
  uploadProductImage
);
productRouter.put(
  "/:ProductId",
  authenticate,
  checkPermission('UPDATE_PRODUCT'),
  checkExist(Product),
  updateProduct
);
productRouter.delete(
  "/:ProductId",
  authenticate,
  checkPermission('DELETE_PRODUCT'),
  checkExist(Product),
  deleteProduct
);
productRouter.put(
  "/:ProductId/restore",
  authenticate,
  checkPermission('RESTORE_PRODUCT'),
  checkExist(Product),
  restoreProduct
);

module.exports = productRouter;
