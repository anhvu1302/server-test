const statisticsRouter = require("express").Router();
const {
  getUserLoginCount,
  getTotalSalesByCategory,
  getTotalSalesByParentCategory,
  getQuantitySoldByCategory,
  getQuantitySoldByParentCategory,
  getMonthlySalesSummary,
  getDailySalesAndRevenue,
} = require("../controllers/statistics.controller.js");
const authenticate = require("../middlewares/auth/authenticate.js");
const checkPermission = require("../middlewares/permission/checkPermission.js");

statisticsRouter.get(
  "/user-login",
  authenticate,
  checkPermission("GET_STATISTICS"),
  getUserLoginCount
);
statisticsRouter.get(
  "/total-sales/category",
  authenticate,
  checkPermission("GET_STATISTICS"),
  getTotalSalesByCategory
);
statisticsRouter.get(
  "/total-sales/parent-category",
  authenticate,
  checkPermission("GET_STATISTICS"),
  getTotalSalesByParentCategory
);
statisticsRouter.get(
  "/quantity-sold/category",
  authenticate,
  checkPermission("GET_STATISTICS"),
  getQuantitySoldByCategory
);
statisticsRouter.get(
  "/quantity-sold/parent-category",
  authenticate,
  checkPermission("GET_STATISTICS"),
  getQuantitySoldByParentCategory
);
statisticsRouter.get(
  "/sales-summary",
  authenticate,
  checkPermission("GET_STATISTICS"),
  getMonthlySalesSummary
);
statisticsRouter.get(
  "/get-daily-sales",
  authenticate,
  checkPermission("GET_STATISTICS"),
  getDailySalesAndRevenue
);

module.exports = statisticsRouter;
