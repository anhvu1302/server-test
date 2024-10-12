const {
  getAllPermissionGroup,
  getPermissionGroupDetail,
  updateGroupPermission,
  updateGroupUser
} = require("../controllers/permissionGroup.controller.js");
const permissionGroupRouter = require("express").Router();
const authenticate = require("../middlewares/auth/authenticate.js");
const checkPermission = require("../middlewares/permission/checkPermission.js");

permissionGroupRouter.get("/", authenticate, checkPermission('GET_ALL_PERMISSION_GROUP'),getAllPermissionGroup);
permissionGroupRouter.get("/:PermissionGroupId", authenticate,checkPermission('GET_PERMISSION_GROUP_DETAIL'), getPermissionGroupDetail);
permissionGroupRouter.put("/:PermissionGroupId/permission", authenticate,checkPermission('UPDATE_GROUP_PERMISSION'), updateGroupPermission);
permissionGroupRouter.put("/:PermissionGroupId/user", authenticate,checkPermission('UPDATE_GROUP_USER'), updateGroupUser);

module.exports = permissionGroupRouter;
