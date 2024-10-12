const { Category } = require("../models/index.js");
const express = require("express");
const {
  createCategory,
  getAllCategory,
  getDetailCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller.js");
const checkExist = require("../middlewares/validations/checkExits.js");
const authenticate = require("../middlewares/auth/authenticate.js");
const Authorize = require("../middlewares/auth/authorize.js");
const checkPermission = require("../middlewares/permission/checkPermission.js");
const categoryRouter = express.Router();

categoryRouter.get("/", getAllCategory);
categoryRouter.get("/:CategoryId", checkExist(Category), getDetailCategory);
categoryRouter.post("/", authenticate,checkPermission('CREATE_CATEGORY'), createCategory);
categoryRouter.put(
  "/:CategoryId",
  authenticate,
  checkExist(Category),
  checkPermission('UPDATE_CATEGORY'),
  updateCategory
);
categoryRouter.delete(
  "/:CategoryId",
  authenticate,
  checkExist(Category),
  checkPermission('DELETE_CATEGORY'),
  deleteCategory
);

module.exports = categoryRouter;
