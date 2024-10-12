const { where } = require("sequelize");
const { Color, ProductVariant } = require("../models");
const CacheManager = require("../cache/CacheManager");
const handleErrorResponse = require("../utils/handleErrorResponse");

const cacheManager = new CacheManager("color");

const createColor = async (req, res) => {
  const { ColorName } = req.body;
  try {
    await Color.create({ ColorName });
    await cacheManager.invalidateCache();
    res.status(201).send({ message: "Created successfully" });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};

const getAllColor = async (req, res) => {
  try {
    const colorList = await cacheManager.getOrSetCache(
      req.originalUrl,
      async () => {
        const colorList = await Color.findAll();
        return colorList;
      },
      {
        EX: 21600,
      }
    );

    res.status(200).send({ message: "Successful", colorList });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const getAllColorOfProduct = async (req, res) => {
  const { ProductId } = req.params;
  try {
    const uniqueColors = await cacheManager.getOrSetCache(
      req.originalUrl,
      async () => {
        const productVariants = await ProductVariant.findAll({
          where: {
            ProductId,
          },
          include: [
            {
              model: Color,
              as: "color",
            },
          ],
        });
        const uniqueColors = Array.from(
          new Set(productVariants.map((variant) => variant.color.ColorId))
        ).map((colorId) => {
          return productVariants.find(
            (variant) => variant.color.ColorId === colorId
          ).color;
        });
        return uniqueColors;
      },
      {
        EX: 21600,
      },
      "product"
    );

    res.status(200).send({ message: "Successful", colors: uniqueColors });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
module.exports = {
  createColor,
  getAllColor,
  getAllColorOfProduct,
};
