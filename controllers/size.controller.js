const CacheManager = require("../cache/CacheManager");
const { Size, Sequelize } = require("../models");
const handleErrorResponse = require("../utils/handleErrorResponse");

const cacheManager = new CacheManager("size");

const createSize = async (req, res) => {
  const { TypeSize } = req.body;
  try {
    await Size.create({ TypeSize });
    await cacheManager.invalidateCache();
    res.status(201).send({ message: "Created successfully" });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};

const getAllSize = async (req, res) => {
  try {
    const sizeList = await cacheManager.getOrSetCache(
      req.originalUrl,
      async () => {
        const sizeList = await Size.findAll();
        return sizeList;
      },
      {
        EX: 43200, // 12 hours
      }
    );

    res.status(200).send({ message: "Ok", sizeList });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
module.exports = {
  createSize,
  getAllSize,
};
