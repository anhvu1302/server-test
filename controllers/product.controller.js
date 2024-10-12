const { Op, Sequelize } = require("sequelize");
const {
  Product,
  ProductVariant,
  ProductImage,
  Category,
  Color,
  Size,
  ProductReview,
  ParentCategory,
  User,
  sequelize,
} = require("../models");
const CacheManager = require("../cache/CacheManager");
const handleErrorResponse = require("../utils/handleErrorResponse");

const cacheManager = new CacheManager("product");

const createProduct = async (req, res) => {
  const { ProductName, CategoryId, ProductDescription, ProductReview } =
    req.body;
  try {
    await Product.create({
      ProductName,
      CategoryId,
      ReviewCount: 0,
      ProductDescription,
      ProductReview,
      DeletedAt: null,
      CreatedAt: sequelize.literal("NOW()"),
    });
    await cacheManager.invalidateCache();
    res.status(201).send({ message: "Successfully created" });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const getAllProductActive = async (req, res) => {
  try {
    const cache = await cacheManager.getOrSetCache(
      req.originalUrl,
      async () => {
        const page = parseInt(req.query.page, 10) || 1;
        const pageSize = parseInt(req.query.pageSize, 10) || 12;

        const limit = pageSize;
        const offset = (page - 1) * pageSize;

        const {
          categoryId,
          parentCategoryId,
          price,
          search,
          colorId,
          sizeId,
          sortBy,
        } = req.query;

        const order = [];
        if (sortBy) {
          const [field, direction] = sortBy.split(":");
          order.push([
            field,
            direction.toUpperCase() === "DESC" ? "DESC" : "ASC",
          ]);
        } else {
          order.push(["CreatedAt", "DESC"]);
        }

        let productVariantWhere = "";
        if (price) {
          try {
            const [minPrice, maxPrice] = price.split(":").map(Number);
            productVariantWhere = `AND tbl_product_variants.Price BETWEEN ${minPrice} AND ${maxPrice}`;
          } catch (error) {
            productVariantWhere = "";
          }
        }
        if (colorId) {
          productVariantWhere += ` AND tbl_product_variants.ColorId = '${colorId}'`;
        }
        if (sizeId) {
          productVariantWhere += ` AND tbl_product_variants.SizeId = '${sizeId}'`;
        }

        const where = {
          DeletedAt: null,
          [Op.and]: [
            Sequelize.literal(
              `(SELECT COUNT(*) FROM tbl_product_variants WHERE tbl_product_variants.ProductId = Product.ProductId ${productVariantWhere}) > 0`
            ),
          ],
        };
        if (search) {
          const searchWords = search.split(" ");
          const searchConditions = searchWords.map((word) => ({
            ProductName: { [Op.like]: `%${word}%` },
          }));

          where[Op.and] = [...where[Op.and], ...searchConditions];
        }
        if (categoryId) {
          where.CategoryId = categoryId;
        }
        if (parentCategoryId) {
          where["$category.ParentCategoryId$"] = parentCategoryId;
        }

        const include = [
          {
            model: Category,
            as: "category",
            include: [
              {
                model: ParentCategory,
                as: "parentCategory",
              },
            ],
          },
          {
            model: ProductVariant,
            as: "productVariants",
            attributes: {
              include: [
                [
                  Sequelize.fn(
                    "fn_GetProductImage",
                    Sequelize.col("ProductId"),
                    Sequelize.col("ColorId")
                  ),
                  "Image",
                ],
              ],
            },
            required: true,
            limit: 1,
          },
        ];
        const { count, rows: productList } = await Product.findAndCountAll({
          attributes: {
            include: [
              [
                Sequelize.fn(
                  "fn_CalculateAverageRating",
                  Sequelize.col("Product.ProductId")
                ),
                "Rating",
              ],
              [
                Sequelize.fn(
                  "fn_CalculateSoldQuantity",
                  Sequelize.col("Product.ProductId")
                ),
                "SoldQuantity",
              ],
            ],
          },
          include,
          where: {
            ...where,
          },
          order: order,
          limit,
          offset,
        });

        const totalPages = Math.ceil(count / pageSize);

        return {
          productList,
          pagination: {
            page,
            pageSize,
            totalItems: count,
            totalPages,
          },
        };
      },
      {
        EX: 21600, // 12 hours
      }
    );

    res.status(200).send({
      message: "Ok",
      ...cache,
    });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const getAllProduct = async (req, res) => {
  try {
    const productList = await cacheManager.getOrSetCache(
      req.originalUrl,
      async () => {
        const productList = await Product.findAll({
          attributes: {
            include: [
              [
                sequelize.fn(
                  "fn_CalculateAverageRating",
                  sequelize.col("Product.ProductId")
                ),
                "Rating",
              ],
              [
                sequelize.literal(`(
                  SELECT COUNT(*)
                  FROM tbl_product_variants AS ProductVariant
                  WHERE
                    ProductVariant.ProductId = Product.ProductId
                )`),
                "VariantCount",
              ],
            ],
          },
          include: [
            {
              model: Category,
              as: "category",
              include: [
                {
                  model: ParentCategory,
                  as: "parentCategory",
                },
              ],
            },
          ],
          order: [["CreatedAt", "DESC"]],
        });
        return productList;
      },
      {
        EX: 21600,
      }
    );

    res.status(200).send({ message: "Ok", productList });
  } catch (error) {
    console.log(error);
    handleErrorResponse(res, 500, error);
  }
};
const getDetailProduct = async (req, res) => {
  const { ProductId } = req.params;
  try {
    const productDetail = await cacheManager.getOrSetCache(
      req.originalUrl,
      async () => {
        const productDetail = await Product.findOne({
          attributes: {
            include: [
              [
                sequelize.fn(
                  "fn_CalculateAverageRating",
                  sequelize.col("Product.ProductId")
                ),
                "Rating",
              ],
            ],
          },
          include: [
            {
              model: Category,
              as: "category",
              include: [
                {
                  model: ParentCategory,
                  as: "parentCategory",
                },
              ],
            },
            {
              model: ProductVariant,
              as: "productVariants",
              attributes: {
                include: [
                  [
                    sequelize.fn(
                      "fn_GetProductImage",
                      sequelize.col("productVariants.ProductId"),
                      sequelize.col("productVariants.ColorId")
                    ),
                    "Image",
                  ],
                ],
              },
              include: [
                {
                  model: Size,
                  as: "size",
                },
                {
                  model: Color,
                  as: "color",
                },
              ],
            },
          ],
          where: {
            ProductId,
          },
        });
        return productDetail;
      },
      {
        EX: 21600,
      }
    );

    res.status(200).send({ message: "Successful", productDetail });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const getProductReviews = async (req, res) => {
  const { ProductId } = req.params;
  try {
    const productReviews = await cacheManager.getOrSetCache(
      req.originalUrl,
      async () => {
        const productReviews = await ProductReview.findAll({
          where: {
            ProductId,
            ReviewStatus: "Approved",
          },
          include: [
            {
              model: User,
              as: "user",
              attributes: ["FullName", "Avatar"],
            },
          ],
        });
        return productReviews;
      },
      {
        EX: 21600,
      }
    );

    res.status(200).send({ message: "Successful", productReviews });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};

const updateProduct = async (req, res) => {
  const { ProductId } = req.params;
  const { ProductName, CategoryId, ProductDescription, ProductReview } =
    req.body;
  try {
    await Product.update(
      {
        ProductName,
        CategoryId,
        ProductDescription,
        ProductReview,
      },
      {
        where: {
          ProductId,
        },
      }
    );
    await cacheManager.invalidateCache();
    res.status(200).send({ message: "Updated successful" });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};

const deleteProduct = async (req, res) => {
  const { ProductId } = req.params;
  try {
    await Product.softDelete(ProductId);
    await cacheManager.invalidateCache();
    res.status(200).send({ message: "Deleted successfully" });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const restoreProduct = async (req, res) => {
  const { ProductId } = req.params;
  try {
    await Product.restore(ProductId);
    await cacheManager.invalidateCache();
    res.status(200).send({ message: "Restored successfully" });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const uploadProductImage = async (req, res) => {
  try {
    const { file } = req;
    const urlImage = `${process.env.BACKEND_URL}/${file.path}`.replace(
      /\\/g,
      "/"
    );
    res.status(200).send({ imageUrl: urlImage });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const getParityProduct = async (req, res) => {
  const { ProductId } = req.params;
  try {
    const parityProducts = await cacheManager.getOrSetCache(
      req.originalUrl,
      async () => {
        const product = await Product.findOne({
          where: {
            ProductId,
          },
          include: [
            {
              model: Category,
              as: "category",
            },
          ],
        });
        const parityProducts = await Product.findAll({
          attributes: {
            include: [
              [
                sequelize.fn(
                  "fn_CalculateAverageRating",
                  sequelize.col("Product.ProductId")
                ),
                "Rating",
              ],
            ],
          },
          include: [
            {
              model: Category,
              as: "category",
              where: {
                ParentCategoryId: product.category.ParentCategoryId,
              },
            },
            {
              model: ProductVariant,
              as: "productVariants",
              attributes: {
                include: [
                  [
                    sequelize.fn(
                      "fn_GetProductImage",
                      sequelize.col("productVariants.ProductId"),
                      sequelize.col("productVariants.ColorId")
                    ),
                    "Image",
                  ],
                ],
              },
              include: [
                {
                  model: Size,
                  as: "size",
                },
                {
                  model: Color,
                  as: "color",
                },
              ],
            },
          ],
        });
        return parityProducts;
      },
      {
        EX: 21600,
      }
    );
    res.status(200).send({ message: "Successfull", parityProducts });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
module.exports = {
  getAllProductActive,
  getAllProduct,
  getDetailProduct,
  getProductReviews,
  getParityProduct,

  createProduct,

  deleteProduct,

  restoreProduct,

  updateProduct,
  uploadProductImage,
};
