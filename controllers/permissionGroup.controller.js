const { where, JSON } = require("sequelize");
const {
  Permission,
  GroupHasUser,
  GroupHasPermission,
  PermissionGroup,
} = require("../models");
const CacheManager = require("../cache/CacheManager");
const handleErrorResponse = require("../utils/handleErrorResponse");

const cacheManager = new CacheManager("permission-group");

const getAllPermissionGroup = async (req, res) => {
  try {
    const permissionGroups = await cacheManager.getOrSetCache(
      req.originalUrl,
      async () => {
        const permissionGroups = await PermissionGroup.findAll();
        return permissionGroups;
      },
      {
        EX: 43200, // 12 hours
      }
    );

    res.status(200).send({ message: "Successful", permissionGroups });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const getPermissionGroupDetail = async (req, res) => {
  const { PermissionGroupId } = req.params;
  try {
    const groupDetail = await cacheManager.getOrSetCache(
      req.originalUrl,
      async () => {
        const groupDetail = await PermissionGroup.findOne({
          where: {
            PermissionGroupId,
          },
          include: [
            {
              model: GroupHasPermission,
              as: "permissions",
            },
            {
              model: GroupHasUser,
              as: "users",
            },
          ],
        });
        return groupDetail;
      },
      {
        EX: 43200,
      }
    );

    res.status(200).send({ message: "Successful", groupDetail });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};

const updateGroupPermission = async (req, res) => {
  const { PermissionGroupId } = req.params;
  const { PermissionId } = req.body;
  let { Action } = req.body;
  try {
    const validActions = ["add", "remove"];
    Action = validActions.includes(Action) ? Action : null;
    if (!Action) {
      return res.status(400).send({ message: "Invalid Action specified." });
    }
    const permGRP = await PermissionGroup.findByPk(PermissionGroupId);
    if (permGRP.PermissionGroupName === "SUPER_ADMIN") {
      return res
        .status(403)
        .json({ message: "You cannot modify the permissions of this group" });
    }

    if (Action === "add") {
      await GroupHasPermission.create({
        PermissionGroupId,
        PermissionId,
      });
    } else {
      await GroupHasPermission.destroy({
        where: {
          PermissionGroupId,
          PermissionId,
        },
      });
    }
    const groupDetail = await PermissionGroup.findOne({
      where: {
        PermissionGroupId,
      },
      include: [
        {
          model: GroupHasPermission,
          as: "permissions",
        },
      ],
    });
    await cacheManager.invalidateCache();
    res.status(200).send({ message: "Updated successfully", groupDetail });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const updateGroupUser = async (req, res) => {
  const { PermissionGroupId } = req.params;
  const { UserId } = req.body;
  let { Action } = req.body;
  try {
    const validActions = ["add", "remove"];
    Action = validActions.includes(Action) ? Action : null;
    if (!Action) {
      return res.status(400).send({ message: "Invalid Action specified." });
    }
    // Fetch the group level of the user making the request
    const userGroups = await GroupHasUser.findAll({
      where: {
        UserId: req.session.user.UserId,
      },
      include: [
        {
          model: PermissionGroup,
          as: "permissionGroup",
        },
      ],
    });

    // Transform the result to extract only data values
    const userGroupData = userGroups.map((userGroup) =>
      userGroup.get({ plain: true })
    );

    // Find the minimum role level of the current user in groups
    const userGroupLevel =
      userGroupData.length > 0
        ? Math.max(
            ...userGroupData.map((group) => group.permissionGroup.RoleLevel)
          )
        : 0;

    // Fetch the target user's group information
    const targetUserGroups = await GroupHasUser.findAll({
      where: {
        UserId,
      },
      include: [
        {
          model: PermissionGroup,
          as: "permissionGroup",
        },
      ],
    });

    // Transform the result to extract only data values
    const targetUserGroupData = targetUserGroups.map((userGroup) =>
      userGroup.get({ plain: true })
    );

    // Find the maximum role level of the target user
    const targetUserMaxLevel =
      targetUserGroupData.length > 0
        ? Math.max(
            ...targetUserGroupData.map(
              (group) => group.permissionGroup.RoleLevel
            )
          )
        : 0;

    // Fetch the target group's information
    const targetGroup = await PermissionGroup.findOne({
      where: { PermissionGroupId },
    });
    const targetGroupData = targetGroup.get({ plain: true });

    // Check if the user is attempting to modify another user
    if (UserId !== req.session.user.UserId) {
      // Check if the current user's role level is higher than the max level of the target user
      if (
        userGroupLevel < targetUserMaxLevel ||
        userGroupLevel < targetGroupData.RoleLevel
      ) {
        return res.status(403).send({
          message: "You do not have permission to change this user's group.",
        });
      }
    }

    if (Action === "add") {
      await GroupHasUser.create({
        PermissionGroupId,
        UserId,
      });
    } else {
      if (
        userGroupData.length <= 1 &&
        UserId === req.session.user.UserId &&
        userGroupData[0].PermissionGroupId === PermissionGroupId
      ) {
        return res.status(400).send({
          message: "Cannot remove the only permission group for the user.",
        });
      }
      await GroupHasUser.destroy({
        where: {
          PermissionGroupId,
          UserId,
        },
      });
    }
    const groupDetail = await PermissionGroup.findOne({
      where: {
        PermissionGroupId,
      },
      include: [
        {
          model: GroupHasUser,
          as: "users",
        },
      ],
    });
    await cacheManager.invalidateCache();
    res.status(200).send({
      message: "Updated successfully",
      groupDetail,
      userGroups,
      targetGroup,
    });
  } catch (error) {
    console.log(error);
    handleErrorResponse(res, 500, error);
  }
};
module.exports = {
  getAllPermissionGroup,
  getPermissionGroupDetail,
  updateGroupPermission,
  updateGroupUser,
};
