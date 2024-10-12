const {
  createParCategory,
  deleteParCategory,
  getAllParCategory,
  getDetailParCategory,
  updateParCategory,
} = require("../controllers/parentCategory.controller");

const authenticate = require("../middlewares/auth/authenticate");
const checkPermission = require("../middlewares/permission/checkPermission");
const checkExist = require("../middlewares/validations/checkExits");
const { ParentCategory } = require("../models");
const express = require("express");

const parentCategoryRouter = express.Router();

parentCategoryRouter.get(
  "/:ParentCategoryId",
  checkExist(ParentCategory),
  getDetailParCategory
);
parentCategoryRouter.get("/", getAllParCategory);
parentCategoryRouter.post("/", authenticate, createParCategory);
parentCategoryRouter.delete(
  "/:ParentCategoryId",
  authenticate,
  checkPermission('CREATE_PARENT_CATEGORY'),
  checkExist(ParentCategory),
  deleteParCategory
);
parentCategoryRouter.put(
  "/:ParentCategoryId",
  authenticate,
  checkPermission('UPDATE_PARENT_CATEGORY'),
  checkExist(ParentCategory),
  updateParCategory
);

module.exports = parentCategoryRouter;
