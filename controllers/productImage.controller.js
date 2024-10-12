const CacheManager = require("../cache/CacheManager");
const { ProductImage, Product, Color, ProductVariant } = require("../models");
const handleErrorResponse = require("../utils/handleErrorResponse");

const cacheManager = new CacheManager("product-image");

const createProductImage = async (req, res) => {
  const { ProductId, ColorId, Images } = req.body;
  try {
    const productVariant = await ProductVariant.findOne({
      where: {
        ProductId,
        ColorId,
      },
    });
    if (!productVariant) {
      return res.status(400).send({
        message:
          "Product variant does not exist. Please add product variant first",
      });
    }
    await ProductImage.create({ ProductId, ColorId, Images });
    await cacheManager.invalidateCache();
    res.status(201).send({ message: "Created successfully" });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const getAllProductImage = async (req, res) => {
  try {
    const productImages = await cacheManager.getOrSetCache(
      req.originalUrl,
      async () => {
        const productImages = await ProductImage.findAll({
          attributes: {
            exclude: ["ProductId", "ColorId"],
          },
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["ProductId", "ProductName"],
            },
            {
              model: Color,
              as: "color",
            },
          ],
          order: [["product", "CreatedAt", "DESC"]],
        });
        return productImages;
      },
      {
        EX: 21600,
      }
    );
    res.status(200).send({ message: "Successful", productImages });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const getDetailProductImage = async (req, res) => {
  const { ProductImageId } = req.params;
  try {
    const productImage = await cacheManager.getOrSetCache(
      req.originalUrl,
      async () => {
        const productImage = await ProductImage.findOne({
          attributes: {
            exclude: ["ProductId", "ColorId"],
          },
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["ProductId", "ProductName"],
            },
            {
              model: Color,
              as: "color",
            },
          ],
          where: {
            ProductImageId,
          },
        });
        return productImage;
      },
      {
        EX: 21600,
      }
    );
    res.status(200).send({ message: "Successfully", productImage });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const updateProductImage = async (req, res) => {
  const { ProductImageId } = req.params;
  const { ProductId, ColorId, Images } = req.body;
  try {
    await ProductImage.update(
      {
        ProductId,
        ColorId,
        Images,
      },
      {
        where: {
          ProductImageId,
        },
      }
    );
    await cacheManager.invalidateCache()
    res.status(200).send({ message: "Updated successfully" });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const deleteProductImage = async (req, res) => {
  const { ProductImageId } = req.params;
  try {
    await ProductImage.destroy({
      where: {
        ProductImageId,
      },
    });
    await cacheManager.invalidateCache()
    res.status(200).send({ message: "Deleted successfully" });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
module.exports = {
  getAllProductImage,
  getDetailProductImage,
  createProductImage,
  updateProductImage,
  deleteProductImage,
};
