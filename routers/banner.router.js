const {
  getAllActiveBanners,
  createBanner,
  getAllBanners,
  uploadBanner,
  getBannerDetail,
  deleteBanner,
  restoreBanner,
  updateBanner,
} = require("../controllers/banner.controller");
const authenticate = require("../middlewares/auth/authenticate");
const checkPermission = require("../middlewares/permission/checkPermission");
const uploadImage = require("../middlewares/upload/uploadImage");

const bannerRouter = require("express").Router();

bannerRouter.get(
  "/",
  authenticate,
  checkPermission("GET_ALL_BANNER"),
  getAllBanners
);
bannerRouter.get("/active", getAllActiveBanners);
bannerRouter.get(
  "/:BannerId",
  authenticate,
  checkPermission("GET_BANNER_DETAIL"),
  getBannerDetail
);
bannerRouter.post(
  "/",
  authenticate,
  checkPermission("CREATE_BANNER"),
  createBanner
);
bannerRouter.post(
  "/upload-banner",
  authenticate,
  checkPermission("UPLOAD_BANNER"),
  uploadImage("banner"),
  uploadBanner
);
bannerRouter.put(
  "/:BannerId",
  authenticate,
  checkPermission("UPDATE_BANNER"),
  updateBanner
);
bannerRouter.delete(
  "/:BannerId",
  authenticate,
  checkPermission("DELETE_BANNER"),
  deleteBanner
);
bannerRouter.put(
  "/:BannerId/restore",
  authenticate,
  checkPermission("RESTORE_BANNER"),
  restoreBanner
);
module.exports = bannerRouter;
