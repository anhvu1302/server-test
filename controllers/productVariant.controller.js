const CacheManager = require("../cache/CacheManager");
const { ProductVariant, Product, Color, Size } = require("../models");
const handleErrorResponse = require("../utils/handleErrorResponse");

const cacheManager = new CacheManager("product-variant");

const getAllProductVariant = async (req, res) => {
  try {
    const productVariants = await cacheManager.getOrSetCache(
      req.originalUrl,
      async () => {
        const productVariants = await ProductVariant.findAll({
          attributes: {
            exclude: ["ProductId", "ColorId", "SizeId"],
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
            {
              model: Size,
              as: "size",
            },
          ],
          order: [
            ["product", "CreatedAt", "DESC"],
            ["color", "ColorName", "DESC"],
          ],
        });
        return productVariants;
      },
      {
        EX: 21600,
      }
    );
    res.status(200).send({ message: "Successful", productVariants });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const getDetailProductVariant = async (req, res) => {
  const { ProductVariantId } = req.params;
  try {
    const productVariant = await cacheManager.getOrSetCache(
      req.originalUrl,
      async () => {
        const productVariant = await ProductVariant.findOne({
          where: {
            ProductVariantId,
          },
        });
        return productVariant;
      },
      {
        EX: 21600,
      }
    );
    res.status(200).send({ message: "Successful", productVariant });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const createProductVariant = async (req, res) => {
  const { ProductId, ColorId, SizeId, Price, Discount } = req.body;
  try {
    const productVariant = await ProductVariant.findOne({
      where: {
        ProductId,
        ColorId,
        SizeId,
      },
    });
    if (productVariant) {
      return res
        .status(400)
        .send({ message: "Product Variant already exists." });
    }

    await ProductVariant.create({
      ProductId,
      ColorId,
      SizeId,
      Price,
      Discount,
      InventoryNumber: 0,
      DeletedAt: null,
    });
    await cacheManager.invalidateCache();
    res.status(201).send({ message: "Successfully created" });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const deleteProductVariant = async (req, res) => {
  const { ProductVariantId } = req.params;
  try {
    await ProductVariant.softDelete(ProductVariantId);
    await cacheManager.invalidateCache();
    res.status(200).send({ message: "Deleted successfully" });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const restoreProductVariant = async (req, res) => {
  const { ProductVariantId } = req.params;
  try {
    await ProductVariant.restore(ProductVariantId);
    await cacheManager.invalidateCache();
    res.status(200).send({ message: "Restore successfully" });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const updateProductVariant = async (req, res) => {
  const { ProductVariantId } = req.params;
  const { ProductId, ColorId, SizeId, Price, Discount, DeletedAt } = req.body;

  try {
    await ProductVariant.update(
      {
        ProductId,
        ColorId,
        SizeId,
        Price,
        Discount,
        DeletedAt,
      },
      {
        where: {
          ProductVariantId,
        },
      }
    );
    await cacheManager.invalidateCache();
    res.status(200).send({ message: "Updated successfully" });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};

module.exports = {
  getAllProductVariant,
  getDetailProductVariant,

  createProductVariant,

  updateProductVariant,

  deleteProductVariant,

  restoreProductVariant,
};
