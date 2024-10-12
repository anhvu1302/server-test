const { where } = require("sequelize");
const CacheManager = require("../cache/CacheManager");
const {
  ProductReview,
  Product,
  Order,
  User,
  OrderDetail,
  ProductVariant,
  Sequelize,
} = require("../models");
const handleErrorResponse = require("../utils/handleErrorResponse");

const cacheManager = new CacheManager("product-review");

const addProductReview = async (req, res) => {
  const { OrderId, ProductVariantId } = req.params;
  try {
    const { Rating, Comment } = req.body;
    const orderInfo = await Order.findOne({
      where: {
        OrderId,
      },
      include: [
        {
          model: OrderDetail,
          as: "orderDetails",
          attributes: ["ReviewedAt"],
          where: {
            ProductVariantId,
          },
          include: [
            {
              model: ProductVariant,
              as: "productVariant",
              attributes: ["ProductId"],
              where: {
                ProductVariantId,
              },
            },
          ],
        },
      ],
    });

    const formattedOD = {
      UserId: orderInfo.UserId,
      ProductId: orderInfo.orderDetails[0]?.productVariant?.ProductId || null,
    };
    if (!orderInfo.orderDetails[0].ReviewedAt) {
      const orderDetail = await OrderDetail.findOne({
        where: {
          OrderId,
          ProductVariantId,
        },
      });

      await ProductReview.create({
        ProductId: formattedOD.ProductId,
        UserId: formattedOD.UserId,
        Rating,
        Comment,
        ReviewTime: new Date(Date.now()),
        ReviewStatus: "Pending",
      });

      orderDetail.ReviewedAt = new Date();
      await orderDetail.save();
      await cacheManager.invalidateCache();
      return res.status(200).send({ message: "Successful" });
    } else {
      return res
        .status(400)
        .send({ message: "You have already reviewed this product" });
    }
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};

const getAllProductReview = async (req, res) => {
  let { type } = req.query;

  type = type || "all";
  const validTypes = ["all", "approved", "pending", "rejected"];
  type = validTypes.includes(type) ? type : "all";
  try {
    const productReviews = await cacheManager.getOrSetCache(
      req.originalUrl,
      async () => {
        let where = {};

        if (type === "approved") {
          where.ReviewStatus = "Approved";
        } else if (type === "pending") {
          where.ReviewStatus = "Pending";
        } else if (type === "rejected") {
          where.ReviewStatus = "Rejected";
        }
        const productReviews = await ProductReview.findAll({
          where,
          include: [
            {
              attributes: ["UserId", "UserName", "FullName", "Avatar"],
              model: User,
              as: "user",
            },
            {
              attributes: ["ProductId", "ProductName"],
              model: Product,
              as: "product",
              include: [
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
              ],
            },
          ],
          order: [["ReviewTime", "DESC"]],
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
const approveReview = async (req, res) => {
  const { ReviewId } = req.params;

  try {
    const review = await ProductReview.findOne({
      where: {
        ReviewId,
      },
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.ReviewStatus === "Approved") {
      return res
        .status(400)
        .json({ message: "Review has already been approved" });
    }
    review.ReviewStatus = "Approved";
    await review.save();
    await cacheManager.invalidateCache();
    res.status(200).json({ message: "Review approved successfully" });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const rejectReview = async (req, res) => {
  const { ReviewId } = req.params;

  try {
    const review = await ProductReview.findOne({
      where: {
        ReviewId,
      },
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.ReviewStatus === "Rejected") {
      return res
        .status(400)
        .json({ message: "Review has already been rejected" });
    }
    review.ReviewStatus = "Rejected";
    await review.save();
    await cacheManager.invalidateCache();
    res.status(200).json({ message: "Review rejected successfully" });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
module.exports = {
  addProductReview,
  getAllProductReview,
  approveReview,
  rejectReview,
};
