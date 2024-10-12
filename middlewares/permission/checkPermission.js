const jwt = require("jsonwebtoken");
const {
  User,
  UserHasPermission,
  PermissionGroup,
  Permission,
  GroupHasUser,
  GroupHasPermission,
} = require("../../models");
const AppSecretKey = process.env.APP_SECRET_KEY;

const checkPermission = (permissionKey) => {
  return async (req, res, next) => {
    const { user } = req.session;
    try {
      const userPermissionGroups = await GroupHasUser.findAll({
        where: {
          UserId: user.UserId,
        },
      });
      const groups = userPermissionGroups?.map(
        (group) => group.dataValues.PermissionGroupId
      );
      const permissions = await GroupHasPermission.findAll({
        where: {
          PermissionGroupId: groups,
        },
        include: [
          {
            model: Permission,
            as: "permission",
          },
        ],
      });
      const uniquePermissions = Array.from(
        new Set(permissions.map((p) => p.PermissionId))
      ).map((permissionId) => {
        const permission = permissions.find(
          (p) => p.PermissionId === permissionId
        );
        return {
          PermissionId: permission.permission.PermissionId,
          PermissionName: permission.permission.PermissionName,
          Description: permission.permission.Description,
        };
      });

      const hasPermissionName = () => {
        return uniquePermissions.some(
          (permission) => permission.PermissionName === permissionKey
        );
      };
      if (hasPermissionName()) {
        return next();
      } else {
        return res.status(403).send({ message: "You do not have permission to access" });
      }
    } catch (error) {
      handleErrorResponse(res, 500, error);
    }
  };
};

module.exports = checkPermission;
