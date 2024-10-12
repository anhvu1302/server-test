const CacheManager = require("../cache/CacheManager");
const { ParentCategory } = require("../models");
const handleErrorResponse = require("../utils/handleErrorResponse");

const cacheManager = new CacheManager("parent-category");

const createParCategory = async (req, res) => {
  const { ParentCategoryName } = req.body;
  try {
    await ParentCategory.create({ ParentCategoryName });
    await cacheManager.invalidateCache();
    res.status(201).send({ message: "Created successfully" });
  } catch (error) {
    res.status(500).send(error.errors[0].message);
  }
};

const getAllParCategory = async (req, res) => {
  try {
    const parCategoryList = await cacheManager.getOrSetCache(
      req.originalUrl,
      async () => {
        const parCategoryList = await ParentCategory.findAll();
        return parCategoryList;
      },
      {
        EX: 86400,
      }
    );

    res.status(200).send({ message: "Ok", parCategoryList });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const getDetailParCategory = async (req, res) => {
  const { ParentCategoryId } = req.params;
  try {
    const parCategory = await cacheManager.getOrSetCache(
      req.originalUrl,
      async () => {
        const parCategory = await ParentCategory.findOne({
          where: {
            ParentCategoryId,
          },
        });
        return parCategory;
      },
      {
        EX: 86400, // 24 hours
      }
    );

    res.status(200).send({ message: "Ok", parCategory });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const updateParCategory = async (req, res) => {
  const { ParentCategoryId } = req.params;
  const { ParentCategoryName } = req.body;
  try {
    const parCategoryDetail = await ParentCategory.findOne({
      where: {
        ParentCategoryId,
      },
    });
    parCategoryDetail.ParentCategoryName = ParentCategoryName;
    parCategoryDetail.save();
    await cacheManager.invalidateCache();
    res
      .status(200)
      .send({ message: "Updated successfully", parCategoryDetail });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const deleteParCategory = async (req, res) => {
  const { ParentCategoryId } = req.params;
  try {
    const parCategoryDetail = await ParentCategory.findOne({
      where: {
        ParentCategoryId,
      },
    });
    await parCategoryDetail.destroy();
    await cacheManager.invalidateCache();
    res
      .status(200)
      .send({ message: "Deleted successfully", parCategoryDetail });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};

module.exports = {
  createParCategory,
  getAllParCategory,
  getDetailParCategory,
  updateParCategory,
  deleteParCategory,
};
