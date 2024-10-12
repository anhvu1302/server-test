const { Permission } = require("../models");
const CacheManager = require("../cache/CacheManager");
const handleErrorResponse = require("../utils/handleErrorResponse");

const cacheManager = new CacheManager("permission");

const getAllPermission = async (req, res) => {
  try {
    const permissions = await cacheManager.getOrSetCache(
      req.originalUrl,
      async () => {
        const permissions = await Permission.findAll({
          order: [["PermissionName", "ASC"]],
        });
        return permissions;
      },
      {
        EX: 21600,
      }
    );

    res.status(200).send({ message: "Successful", permissions });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};

module.exports = {
  getAllPermission,
};
