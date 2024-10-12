const express = require("express");
const {
  addProductToCart,
  getOrderOfUser,
  getShoppingCartOfUser,
  getUserCoinHistory,
  removeProductInCart,
  updateProductInCart,
  updateProfile,
  uploadAvatar,
  changePhoneNumber,
  changeEmail,
  getUserVouchers,
  createUserVoucher,
  deleteUserVoucher,
  changePassword,
  getUserDetail,
  getAllUser,
  createUser,
  updateUser,
  createOrder,
  cancelOrder,
  deleteUser,
  restoreUser,
  banUser,
  unbanUser,
  verifyUser,
} = require("../controllers/user.controller");
const uploadImage = require("../middlewares/upload/uploadImage");
const authenticate = require("../middlewares/auth/authenticate");
const Authorize = require("../middlewares/auth/authorize");
const checkPermission = require("../middlewares/permission/checkPermission");
const userRouter = express.Router();

userRouter.get(
  "/:UserId/shopping-cart/",
  authenticate,
  Authorize.checkUserIdMatch,
  getShoppingCartOfUser
);
userRouter.post(
  "/:UserId/shopping-cart/",
  authenticate,
  Authorize.checkUserIdMatch,
  addProductToCart
);
userRouter.delete(
  "/:UserId/shopping-cart/:ShoppingCartId",
  authenticate,
  Authorize.checkShoppingCartOfUser,
  removeProductInCart
);
userRouter.put(
  "/:UserId/shopping-cart/:ShoppingCartId",
  authenticate,
  Authorize.checkShoppingCartOfUser,
  updateProductInCart
);
userRouter.get(
  "/:UserId/order",
  authenticate,
  Authorize.checkUserIdMatch,
  getOrderOfUser
);

userRouter.put(
  "/:UserId/profile",
  authenticate,
  Authorize.checkUserIdMatch,
  updateProfile
);
userRouter.put(
  "/:UserId/change-email",
  authenticate,
  Authorize.checkUserIdMatch,
  changeEmail
);
userRouter.put(
  "/:UserId/change-password",
  authenticate,
  Authorize.checkUserIdMatch,
  changePassword
);
userRouter.put(
  "/:UserId/change-phone-number",
  authenticate,
  Authorize.checkUserIdMatch,
  changePhoneNumber
);
userRouter.post(
  "/upload-avatar",
  authenticate,
  uploadImage("avatar"),
  uploadAvatar
);
userRouter.get(
  "/:UserId/voucher-wallet",
  authenticate,
  Authorize.checkUserIdMatch,
  getUserVouchers
);
userRouter.post(
  "/:UserId/voucher-wallet",
  authenticate,
  Authorize.checkUserIdMatch,
  createUserVoucher
);
userRouter.delete(
  "/:UserId/voucher-wallet/:VoucherId",
  authenticate,
  Authorize.checkUserIdMatch,
  deleteUserVoucher
);
userRouter.get(
  "/:UserId/get-coin-history",
  authenticate,
  Authorize.checkUserIdMatch,
  getUserCoinHistory
);

userRouter.get("/", authenticate, checkPermission("GET_ALL_USER"), getAllUser);
userRouter.get(
  "/:UserId",
  authenticate,
  checkPermission("GET_USER_DETAIL"),
  getUserDetail
);
userRouter.post("/", authenticate, checkPermission("CREATE_USER"), createUser);
userRouter.put(
  "/:UserId",
  authenticate,
  checkPermission("UPDATE_USER"),
  updateUser
);
userRouter.delete(
  "/:UserId",
  authenticate,
  checkPermission("DELETE_USER"),
  deleteUser
);
userRouter.put(
  "/:UserId/restore",
  authenticate,
  checkPermission("RESTORE_USER"),
  restoreUser
);
userRouter.put(
  "/:UserId/verify",
  authenticate,
  checkPermission("VERIFY_USER"),
  verifyUser
);
userRouter.put(
  "/:UserId/ban",
  authenticate,
  checkPermission("BAN_USER"),
  banUser
);
userRouter.put(
  "/:UserId/unban",
  authenticate,
  checkPermission("UNBAN_USER"),
  unbanUser
);
userRouter.post("/:UserId/order", authenticate, createOrder);
userRouter.delete("/:UserId/order/:OrderId", authenticate, cancelOrder);

module.exports = userRouter;
