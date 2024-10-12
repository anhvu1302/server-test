const {
  getAllVoucher,
  createVoucher,
  importData,
  getVoucherById,
  deleteVoucher,
  updateVoucher,
} = require("../controllers/voucher.controller");
const authenticate = require("../middlewares/auth/authenticate");
const checkPermission = require("../middlewares/permission/checkPermission");
const uploadFile = require("../middlewares/upload/uploadFile");

const voucherRouter = require("express").Router();

voucherRouter.get(
  "/",
  authenticate,
  checkPermission("GET_ALL_VOUCHER"),
  getAllVoucher
);
voucherRouter.get(
  "/:VoucherId",
  authenticate,
  checkPermission("GET_VOUCHER_DETAIL"),
  getVoucherById
);
voucherRouter.post(
  "/",
  authenticate,
  checkPermission("CREATE_VOUCHER"),
  createVoucher
);
voucherRouter.put(
  "/:VoucherId",
  authenticate,
  checkPermission("UPDATE_VOUCHER"),
  updateVoucher
);
voucherRouter.delete(
  "/:VoucherId",
  authenticate,
  checkPermission("DELETE_VOUCHER"),
  deleteVoucher
);
voucherRouter.post(
  "/import-data",
  authenticate,
  uploadFile(["json", "csv"]),
  importData
);

module.exports = voucherRouter;
