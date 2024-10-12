const express = require("express");
const authenticate = require("../middlewares/auth/authenticate");
const { Order } = require("../models");
const {
  cancelOrder,
  confirmCompletion,
  confirmPayment,
  getAllOrder,
  getOrderDetail,
  restoreOrder,
} = require("../controllers/order.controller");
const checkExist = require("../middlewares/validations/checkExits");
const checkPermission = require("../middlewares/permission/checkPermission");
const orderRouter = express.Router();

orderRouter.get("/", authenticate,checkPermission('GET_ALL_ORDER'), getAllOrder);
orderRouter.get("/:OrderId", authenticate,checkPermission('GET_ORDER_DETAIL'), checkExist(Order), getOrderDetail);
orderRouter.post(
  "/:OrderId/confirm-payment",
  authenticate,
  checkPermission('CONFIRM_ORDER_PAYMENT'),
  checkExist(Order),
  confirmPayment
);
orderRouter.post(
  "/:OrderId/confirm-completion",
  authenticate,
  checkPermission('CONFIRM_ORDER_COMPLETION'),
  checkExist(Order),
  confirmCompletion
);
orderRouter.post(
  "/:OrderId/cancel-order",
  authenticate,
  checkPermission('CANCEL_ORDER'),
  checkExist(Order),
  cancelOrder
);
orderRouter.post(
  "/:OrderId/restore",
  authenticate,
  checkPermission('RESTORE_ORDER'),
  checkExist(Order),
  restoreOrder
);

module.exports = orderRouter;
