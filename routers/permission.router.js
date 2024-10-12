const { getAllPermission } = require("../controllers/permission.controller.js");
const permissionRouter = require("express").Router();
const authenticate = require("../middlewares/auth/authenticate.js");
const checkPermission = require("../middlewares/permission/checkPermission.js");

permissionRouter.get("/", authenticate,checkPermission('GET_ALL_PERMISSION'), getAllPermission);

module.exports = permissionRouter;
