const authRouter = require("./auth.router");
const bannerRouter = require("./banner.router");
const categoryRouter = require("./category.router");
const checkoutRouter = require("./checkout.router");
const colorRouter = require("./color.router");
const productVariantRouter = require("./productVariant.router");
const goShipApiRouter = require("./goShipApi.router");
const orderRouter = require("./order.router");
const parentCategoryRouter = require("./parentCategory.router");
const permissionRouter = require("./permission.router");
const permissionGroupRouter = require("./permissionGroup.router");
const productImageRouter = require("./productImage.router");
const productReviewRouter = require("./productReview.router");
const productRouter = require("./product.router");
const sizeRouter = require("./size.router");
const statisticsRouter = require("./statistics.router");
const systemInfo = require("./systemInfo.router");
const testRouter = require("./test.router");
const userRouter = require("./user.router");
const vnpayRouter = require("./vnpay.router");
const voucherRouter = require("./voucher.router");

const rootRouter = require("express").Router();

rootRouter.use("/account", userRouter);
rootRouter.use("/auth", authRouter);
rootRouter.use("/banner", bannerRouter);
rootRouter.use("/category", categoryRouter);
rootRouter.use("/checkout", checkoutRouter);
rootRouter.use("/color", colorRouter);
rootRouter.use("/go-ship", goShipApiRouter);
rootRouter.use("/order", orderRouter);
rootRouter.use("/parent-category", parentCategoryRouter);
rootRouter.use("/permission", permissionRouter);
rootRouter.use("/permission-group", permissionGroupRouter);
rootRouter.use("/product-image", productImageRouter);
rootRouter.use("/product-review", productReviewRouter);
rootRouter.use("/product-variant", productVariantRouter);
rootRouter.use("/product", productRouter);
rootRouter.use("/size", sizeRouter);
rootRouter.use("/statistics", statisticsRouter);
rootRouter.use("/system-info", systemInfo);
rootRouter.use("/test", testRouter);
rootRouter.use("/vnpay", vnpayRouter);
rootRouter.use("/voucher", voucherRouter);

module.exports = {
  rootRouter,
};
