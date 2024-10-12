const express = require("express");
const authenticate = require("../middlewares/auth/authenticate");
const {
  checkExistOrderDetail,
} = require("../middlewares/validations/checkExitsOrderDetail");
const {
  addProductReview,
  getAllProductReview,
  approveReview,
  rejectReview,
} = require("../controllers/productReview.controller");
const checkPermission = require("../middlewares/permission/checkPermission");

const productReviewRouter = express.Router();

productReviewRouter.post(
  "/:OrderId/:ProductVariantId",
  authenticate,
  checkExistOrderDetail,
  addProductReview
);
productReviewRouter.get("/", authenticate,checkPermission('GET_ALL_PRODUCT_REVIEW'), getAllProductReview);
productReviewRouter.put("/:ReviewId/approve", authenticate,checkPermission('APPROVE_PRODUCT_REVIEW '), approveReview);
productReviewRouter.put("/:ReviewId/reject", authenticate,checkPermission('REJECT_PRODUCT_REVIEW'), rejectReview);

module.exports = productReviewRouter;
