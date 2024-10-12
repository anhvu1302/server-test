const CacheManager = require("../cache/CacheManager");
const {
  Order,
  OrderDetail,
  OrderState,
  User,
  Product,
  Color,
  Size,
  ProductVariant,
  sequelize,
} = require("../models");
const handleErrorResponse = require("../utils/handleErrorResponse");

const cacheManager = new CacheManager("order");

const getAllOrder = async (req, res) => {
  try {
    const orders = await cacheManager.getOrSetCache(
      req.originalUrl,
      async () => {
        const orders = await Order.findAll({
          order: [["OrderTime", "DESC"]],
          include: [
            {
              attributes: ["UserId", "UserName", "FullName", "Avatar"],
              model: User,
              as: "user",
            },
          ],
        });
        return orders;
      },
      {
        EX: 10800,
      }
    );

    res.status(200).send({ message: "Successful", orders });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const getOrderDetail = async (req, res) => {
  const { OrderId } = req.params;
  try {
    const order = await cacheManager.getOrSetCache(
      req.originalUrl,
      async () => {
        const order = await Order.findOne({
          where: {
            OrderId,
          },
          include: [
            {
              model: OrderDetail,
              as: "orderDetails",
              include: [
                {
                  model: ProductVariant,
                  as: "productVariant",
                  attributes: {
                    include: [
                      [
                        sequelize.fn(
                          "fn_GetProductImage",
                          sequelize.col(
                            "orderDetails->productVariant.ProductId"
                          ),
                          sequelize.col("orderDetails->productVariant.ColorId")
                        ),
                        "Image",
                      ],
                    ],
                  },
                  include: [
                    {
                      attributes: ["ProductId", "ProductName"],
                      model: Product,
                      as: "product",
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
                },
              ],
            },
            {
              model: OrderState,
              as: "orderStates",
            },
            {
              attributes: ["UserId", "UserName", "FullName"],
              model: User,
              as: "user",
            },
          ],
          order: [["OrderTime", "DESC"]],
        });
        return order;
      },
      {
        EX: 21600,
      }
    );

    res.status(200).send({ message: "Successful", orderDetail: order });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const confirmPayment = async (req, res) => {
  const { OrderId } = req.params;
  try {
    const order = await Order.findByPk(OrderId);

    if (order.PaymentAt) {
      return res
        .status(400)
        .json({ message: "Payment has already been confirmed" });
    }

    order.PaymentAt = new Date();
    await order.save();
    await cacheManager.invalidateCache();
    return res.status(200).json({ message: "Payment confirmed" });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const confirmCompletion = async (req, res) => {
  const { OrderId } = req.params;
  try {
    const order = await Order.findByPk(OrderId);

    if (order.CompletedAt) {
      return res
        .status(400)
        .json({ message: "Order has already been completed" });
    }

    order.CompletedAt = new Date();
    await order.save();
    await cacheManager.invalidateCache();

    return res.status(200).json({ message: "Order completed" });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const cancelOrder = async (req, res) => {
  const { OrderId } = req.params;
  try {
    const order = await Order.findByPk(OrderId);

    if (order.CancelledAt) {
      return res
        .status(400)
        .json({ message: "Order has already been cancelled" });
    }

    order.CancelledAt = new Date();
    await order.save();
    await cacheManager.invalidateCache();

    return res.status(200).json({ message: "Order cancelled" });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const restoreOrder = async (req, res) => {
  const { OrderId } = req.params;

  try {
    const order = await Order.findByPk(OrderId);

    if (order.CancelledAt) {
      order.CancelledAt = null;
      await order.save();
      await cacheManager.invalidateCache();

      return res.status(200).json({ message: "Order restored" });
    } else {
      return res
        .status(400)
        .json({ message: "Order cannot be restored unless it is cancelled" });
    }
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
module.exports = {
  cancelOrder,
  confirmCompletion,
  confirmPayment,
  getAllOrder,
  getOrderDetail,
  restoreOrder,
};
