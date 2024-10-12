const productImageRouter = require("express").Router();
const {
  createProductImage,
  getAllProductImage,
  getDetailProductImage,
  updateProductImage,
  deleteProductImage,
} = require("../controllers/productImage.controller");
const authenticate = require("../middlewares/auth/authenticate");
const checkPermission = require("../middlewares/permission/checkPermission");

productImageRouter.get("/",authenticate,checkPermission('GET_ALL_PRODUCT_IMAGE'), getAllProductImage);
productImageRouter.get("/:ProductImageId",authenticate,checkPermission('GET_PRODUCT_IMAGE_DETAIL'), getDetailProductImage);
productImageRouter.post("/", authenticate,checkPermission('CREATE_PRODUCT_IMAGE'), createProductImage);
productImageRouter.put("/:ProductImageId", authenticate,checkPermission('UPDATE_PRODUCT_IMAGE'), updateProductImage);
productImageRouter.delete("/:ProductImageId", authenticate,checkPermission('DELETE_PRODUCT_IMAGE'), deleteProductImage);

module.exports = productImageRouter;
