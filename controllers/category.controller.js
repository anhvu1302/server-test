const CacheManager = require("../cache/CacheManager");
const { Category, ParentCategory } = require("../models");
const handleErrorResponse = require("../utils/handleErrorResponse");

const cacheManager = new CacheManager("color");

const createCategory = async (req, res) => {
  const { CategoryName, ParentCategoryId } = req.body;
  try {
    await Category.create({ CategoryName, ParentCategoryId });
    await cacheManager.invalidateCache();
    res.status(201).send({ message: "Created successfully" });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};

const getAllCategory = async (req, res) => {
  try {
    const categoryList = await cacheManager.getOrSetCache(
      req.originalUrl,
      async () => {
        const categoryList = await ParentCategory.findAll({
          include: [
            {
              model: Category,
              as: "categories",
            },
          ],
        });
        return categoryList;
      },
      {
        EX: 86400,
      }
    );

    res.status(200).send({ message: "Ok", categoryList });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const getDetailCategory = async (req, res) => {
  const { CategoryId } = req.params;
  try {
    const categoryDetail = await cacheManager.getOrSetCache(
      req.originalUrl,
      async () => {
        const categoryDetail = await Category.findOne({
          where: {
            CategoryId,
          },
        });
        return categoryDetail;
      },
      {
        EX: 86400,
      }
    );

    res.status(200).send({ message: "Ok", categoryDetail });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};

const updateCategory = async (req, res) => {
  const { CategoryId } = req.params;
  const { CategoryName, ParentCategoryId } = req.body;
  try {
    const categoryDetail = await Category.findOne({
      where: {
        CategoryId,
      },
    });
    categoryDetail.CategoryName = CategoryName;
    categoryDetail.ParentCategoryId = ParentCategoryId;
    categoryDetail.save();
    await cacheManager.invalidateCache();
    res.status(200).send({ message: "Updated successfully" });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};

const deleteCategory = async (req, res) => {
  const { CategoryId } = req.params;
  try {
    const categoryDetail = await Category.findOne({
      where: {
        CategoryId,
      },
    });
    await categoryDetail.destroy();
    await cacheManager.invalidateCache();
    res.status(200).send({ message: "Deleted successfully" });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
module.exports = {
  createCategory,
  getAllCategory,
  getDetailCategory,
  updateCategory,
  deleteCategory,
};
