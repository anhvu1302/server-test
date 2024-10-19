const {
  CoinHistory,
  Color,
  GroupHasUser,
  Order,
  OrderDetail,
  OrderState,
  Product,
  ProductVariant,
  sequelize,
  ShoppingCart,
  Size,
  User,
  UserVoucher,
  Voucher,
} = require("../models");
const { Op } = require("sequelize");
const PasswordEncryptor = require("../utils/PasswordEncryptor");
const { generateSecretKey, generateOTP } = require("../utils/auth/2FA");
const dayjs = require("dayjs");
const CacheManager = require("../cache/CacheManager");
const handleErrorResponse = require("../utils/handleErrorResponse");

const cacheManager = new CacheManager("user");

const uploadAvatar = async (req, res) => {
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
const getShoppingCartOfUser = async (req, res) => {
  const { UserId } = req.params;
  let { page } = req.query;

  page = page || 1;
  try {
    const shoppingCarts = await cacheManager.getOrSetCache(
      req.originalUrl,
      async () => {
        if (page === "all") {
          var shoppingCarts;
          shoppingCarts = await ShoppingCart.findAll({
            where: {
              UserId,
            },
            include: [
              {
                model: ProductVariant,
                as: "productVariant",
                attributes: {
                  include: [
                    [
                      sequelize.fn(
                        "fn_GetProductImage",
                        sequelize.col("productVariant.ProductId"),
                        sequelize.col("productVariant.ColorId")
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
                    include: [
                      {
                        model: ProductVariant,
                        as: "productVariants",
                        include: [
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
            order: [["CreatedAt", "DESC"]],
          });
        } else {
          if (isNaN(page)) {
            return res
              .status(200)
              .send({ message: "Successful", shoppingCarts: [] });
          } else {
            const pageSize = 10;
            const offset = (page - 1) * pageSize;
            shoppingCarts = await ShoppingCart.findAll({
              where: {
                UserId,
              },
              include: [
                {
                  model: ProductVariant,
                  as: "productVariant",
                  attributes: {
                    include: [
                      [
                        sequelize.fn(
                          "fn_GetProductImage",
                          sequelize.col("productVariant.ProductId"),
                          sequelize.col("productVariant.ColorId")
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
                      include: [
                        {
                          model: ProductVariant,
                          as: "productVariants",
                          include: [
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
              order: [["CreatedAt", "DESC"]],
              limit: pageSize,
              offset: offset,
            });
          }
        }
        return shoppingCarts;
      },
      {
        EX: 3600, //1 minute
      },
      "cart"
    );

    res.status(200).send({ message: "Successful", shoppingCarts });
  } catch (error) {
    console.log(error);
    handleErrorResponse(res, 500, error);
  }
};
const addProductToCart = async (req, res) => {
  const { UserId } = req.params;
  const { ProductVariantId, Quantity } = req.body;
  try {
    const productInCart = await ShoppingCart.findOne({
      where: {
        UserId,
        ProductVariantId,
      },
    });
    if (productInCart) {
      productInCart.Quantity += Quantity;
      await productInCart.save();
    } else {
      await ShoppingCart.create({
        UserId,
        ProductVariantId,
        Quantity,
        CreatedAt: sequelize.literal("NOW()"),
      });
    }
    await cacheManager.invalidateCache();
    res.status(201).send({ message: "Add product to cart successful" });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const removeProductInCart = async (req, res) => {
  const { UserId, ShoppingCartId } = req.params;
  try {
    await ShoppingCart.destroy({
      where: {
        [Op.and]: {
          UserId,
          ShoppingCartId,
        },
      },
    });
    await cacheManager.invalidateCache();
    res.status(200).send({ message: "Remove product in cart successful" });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const updateProductInCart = async (req, res) => {
  const { UserId, ShoppingCartId } = req.params;
  const { ProductVariantId, Quantity } = req.body;
  try {
    const productInCart = await ShoppingCart.findOne({
      where: {
        ShoppingCartId,
      },
      include: [
        {
          model: ProductVariant,
          as: "productVariant",
          attributes: {
            include: [
              [
                sequelize.fn(
                  "fn_GetProductImage",
                  sequelize.col("productVariant.ProductId"),
                  sequelize.col("productVariant.ColorId")
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
              include: [
                {
                  model: ProductVariant,
                  as: "productVariants",
                  include: [
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
    });
    const productInCartDeleted = await ShoppingCart.findOne({
      where: {
        [Op.and]: {
          UserId,
          ProductVariantId,
        },
      },
    });
    if (productInCart) {
      if (productInCartDeleted) {
        if (productInCartDeleted.ShoppingCartId !== ShoppingCartId) {
          productInCartDeleted.Quantity += Quantity;
          await productInCartDeleted.save();
          await productInCart.destroy();
        } else {
          productInCart.ProductVariantId = ProductVariantId;
          productInCart.Quantity = Quantity;
          await productInCart.save();
        }
      } else {
        productInCart.ProductVariantId = ProductVariantId;
        productInCart.Quantity = Quantity;
        await productInCart.save();
      }
    } else {
      productInCart.ProductVariantId = ProductVariantId;
      productInCart.Quantity = Quantity;
      await productInCart.save();
    }
    await cacheManager.invalidateCache();
    res.status(200).send({
      message: "Update cart successful",
      cartItemUpdate: productInCart,
    });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const getOrderOfUser = async (req, res) => {
  const { UserId } = req.params;
  let { type, page } = req.query;

  type = type || "all";
  const validTypes = ["all", "pay", "delivery", "complete", "cancel"];
  type = validTypes.includes(type) ? type : "all";

  page = page || 1;
  const pageSize = 10;
  const offset = (page - 1) * pageSize;

  const includeOrderDetails = {
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
                sequelize.col("orderDetails->productVariant.ProductId"),
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
  };

  const includeOrderStates = {
    model: OrderState,
    as: "orderStates",
  };

  try {
    if (UserId === req.session.user.UserId) {
      const orders = await cacheManager.getOrSetCache(
        req.originalUrl,
        async () => {
          let whereClause = { UserId };

          if (type === "pay") {
            whereClause.PaymentAt = null;
            whereClause.CancelledAt = null;
          } else if (type === "delivery") {
            whereClause.CancelledAt = null;
            whereClause.PaymentAt = { [Op.ne]: null };
            whereClause.CompletedAt = null;
          } else if (type === "complete") {
            whereClause.CancelledAt = null;
            whereClause.PaymentAt = { [Op.ne]: null };
            whereClause.CompletedAt = { [Op.ne]: null };
          } else if (type === "cancel") {
            whereClause.CancelledAt = { [Op.ne]: null };
          }

          const orders = await Order.findAll({
            where: whereClause,
            include: [includeOrderDetails, includeOrderStates],
            order: [
              ["OrderTime", "DESC"],
              ["orderStates", "CreatedAt", "DESC"],
            ],
            limit: pageSize,
            offset,
          });

          return orders;
        },
        {
          EX: 600, //1 minute
        },
        "order"
      );
      res.status(200).send({ message: "Success", orders });
    } else {
      res.status(403).send({ message: "Access Denied" });
    }
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const createOrder = async (req, res) => {
  const { UserId } = req.params;
  const {
    VoucherId,
    PhoneNumber,
    DeliveryAddress,
    PaymentMethod,
    EstimatedDeliveryTime,
    TotalAmount,
    ShippingFee,
    Note,
    orderDetails,
  } = req.body;

  if (!PhoneNumber || PhoneNumber.trim() === '') {
    return res.status(400).json({ message: 'PhoneNumber is required' });
  }
  const phoneRegex = /^[0-9]{10}$/;  // Kiểm tra số điện thoại có đúng 10 chữ số không
  if (!phoneRegex.test(PhoneNumber)) {
    return res.status(400).json({ message: 'PhoneNumber is invalid' });
  }
  if (!DeliveryAddress || DeliveryAddress.trim() === '') {
    return res.status(400).json({ message: 'DeliveryAddress is required' });
  }
  if (!PaymentMethod || PaymentMethod.trim() === '') {
    return res.status(400).json({ message: 'PaymentMethod is required' });
  }

  const t = await sequelize.transaction();
  try {
    const order = await Order.create(
      {
        UserId,
        VoucherId,
        PhoneNumber,
        DeliveryAddress,
        PaymentMethod,
        OrderTime: sequelize.literal("NOW()"),
        EstimatedDeliveryTime: sequelize.literal(
          `DATE_ADD(NOW(), INTERVAL ${EstimatedDeliveryTime} DAY)`
        ),
        PaymentAt: null,
        TotalAmount,
        ShippingFee,
        Note,
        PaymentAt: null,
        CancelledAt: null,
        CompletedAt: null,
      },
      { transaction: t }
    );
    await Promise.all(
      orderDetails.map(async (detail) => {
        await OrderDetail.create(
          {
            OrderId: order.OrderId,
            ProductVariantId: detail.ProductVariantId,
            Quantity: detail.Quantity,
            UnitPrice: detail.UnitPrice,
            ReviewedAt: null,
          },
          { transaction: t }
        );

        await ShoppingCart.destroy({
          where: {
            [Op.and]: {
              UserId,
              ShoppingCartId: detail.ShoppingCartId,
            },
          },
        });
      })
    );

    await OrderState.create(
      {
        OrderId: order.OrderId,
        Status: "Đặt hàng thành công",
        CreatedAt: sequelize.literal("NOW()"),
      },
      { transaction: t }
    );
    await t.commit();
    res
      .status(201)
      .send({ message: "Order created successfully", orderId: order.OrderId });
  } catch (error) {
    console.log(error);
    await t.rollback();
    if (
      error.name === "SequelizeDatabaseError" &&
      error.original.sqlMessage.includes("CHK_InventoryNumber")
    ) {
      res
        .status(400)
        .send({ message: "Not enough inventory available to sell" });
    } else {
      handleErrorResponse(res, 500, error);
    }
  }
};
const cancelOrder = async (req, res) => {
  const { OrderId } = req.params;
  const t = await sequelize.transaction();

  try {
    // Kiểm tra đăng nhập
    if (!req.session.user) {
      return res.status(401).send({ message: "You are not logged in" });
    }

    const order = await Order.findOne({ where: { OrderId } });

    // Kiểm tra đơn hàng tồn tại
    if (!order) {
      return res.status(404).send({ message: "Order not found" });
    }

    // Kiểm tra quyền truy cập
    if (order.UserId !== req.session.user.UserId) {
      return res.status(403).send({ message: "Access denied" });
    }

    // Hủy đơn hàng
    order.CancelledAt = new Date();
    await order.save({ transaction: t });

    await OrderState.create({
      OrderId: order.OrderId,
      Status: "Hủy đơn hàng thành công",
      CreatedAt: sequelize.literal("NOW()"),
    }, { transaction: t });

    await t.commit();

    const updatedOrder = await Order.findOne({
      where: { OrderId },
      include: [
        {
          model: OrderDetail,
          as: "orderDetails",
          include: [
            {
              model: ProductVariant,
              as: "productVariant",
              attributes: [
                [
                  sequelize.fn("fn_GetProductImage", sequelize.col("orderDetails->productVariant.ProductId"), sequelize.col("orderDetails->productVariant.ColorId")),
                  "Image",
                ],
              ],
              include: [
                { model: Product, as: "product", attributes: ["ProductId", "ProductName"] },
                { model: Color, as: "color" },
                { model: Size, as: "size" },
              ],
            },
          ],
        },
        { model: OrderState, as: "orderStates" },
      ],
      order: [
        ["OrderTime", "DESC"],
        ["orderStates", "CreatedAt", "DESC"],
      ],
    });

    res.status(200).send({ message: "Cancelled successfully", order: updatedOrder });
  } catch (error) {
    console.error(error);
    await t.rollback();
    handleErrorResponse(res, 500, error);
  }
};

// const cancelOrder = async (req, res) => {
//   const { UserId, OrderId } = req.params;
//   const t = await sequelize.transaction();
//   try {
//     if (UserId !== req.session.user.UserId) {
//       return res
//         .status(403)
//         .send({ message: "You do not have permission to delete this order" });
//     }
//     const order = await Order.findOne(
//       {
//         where: {
//           OrderId,
//         },
//       },
//       { transaction: t }
//     );
//     if (order.UserId !== req.session.user.UserId) {
//       res.status(403).send({ message: "Access denied" });
//     } else {
//       order.CancelledAt = new Date();
//       await order.save({ transaction: t });
//       await OrderState.create(
//         {
//           OrderId: order.OrderId,
//           Status: "Hủy đơn hàng thành công",
//           CreatedAt: sequelize.literal("NOW()"),
//         },
//         { transaction: t }
//       );
//       await t.commit();

//       const updatedOrder = await Order.findOne({
//         where: {
//           OrderId,
//         },
//         include: [
//           {
//             model: OrderDetail,
//             as: "orderDetails",
//             include: [
//               {
//                 model: ProductVariant,
//                 as: "productVariant",
//                 attributes: {
//                   include: [
//                     [
//                       sequelize.fn(
//                         "fn_GetProductImage",
//                         sequelize.col("orderDetails->productVariant.ProductId"),
//                         sequelize.col("orderDetails->productVariant.ColorId")
//                       ),
//                       "Image",
//                     ],
//                   ],
//                 },
//                 include: [
//                   {
//                     attributes: ["ProductId", "ProductName"],
//                     model: Product,
//                     as: "product",
//                   },
//                   {
//                     model: Color,
//                     as: "color",
//                   },
//                   {
//                     model: Size,
//                     as: "size",
//                   },
//                 ],
//               },
//             ],
//           },
//           {
//             model: OrderState,
//             as: "orderStates",
//           },
//         ],
//         order: [
//           ["OrderTime", "DESC"],
//           ["orderStates", "CreatedAt", "DESC"],
//         ],
//       });
//       res
//         .status(200)
//         .send({ message: "Cancelled successfully", order: updatedOrder });
//     }
//   } catch (error) {
//     await t.rollback();
//     handleErrorResponse(res, 500, error);
//   }
// };
const getUserCoinHistory = async (req, res) => {
  const { UserId } = req.params;
  let { type } = req.query;
  type = type || all;
  const validTypes = ["all", "in", "out"];
  type = validTypes.includes(type) ? type : "all";
  try {
    let coinHistories;
    switch (type) {
      case "all":
        {
          coinHistories = await CoinHistory.findAll({
            where: {
              UserId,
            },
            order: [["CreatedAt", "DESC"]],
          });
        }
        break;
      case "in":
        {
          coinHistories = await CoinHistory.findAll({
            where: {
              UserId,
              CoinAmount: {
                [Op.gt]: 0,
              },
            },
            order: [["CreatedAt", "DESC"]],
          });
        }
        break;
      case "out":
        {
          coinHistories = await CoinHistory.findAll({
            where: {
              UserId,
              CoinAmount: {
                [Op.lt]: 0,
              },
            },
            order: [["CreatedAt", "DESC"]],
          });
        }
        break;
      default:
        break;
    }
    res.status(200).send({ message: "Successful", coinHistories });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const updateProfile = async (req, res) => {
  const { UserId } = req.params;
  const { FullName, DOB, Gender, Address, Avatar } = req.body;
  try {
    await User.update(
      { FullName, DOB, Gender, Address, Avatar },
      {
        where: {
          UserId,
        },
      }
    );
    res.status(200).send({ message: "Update successfully " });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};

const changePassword = async (req, res) => {
  const { UserId } = req.params;
  const { OldPassword, NewPassword, ConfirmNewPassword } = req.body;
  try {
    const user = await User.findOne({
      where: {
        UserId,
      },
    });
    const isAuthn = PasswordEncryptor.verifyPassword(
      OldPassword,
      user.Password,
      process.env.APP_SECRET_KEY
    );

    if (!isAuthn) {
      return res.status(401).send({ message: "Incorrect Password." });
    } else {
      if (NewPassword != ConfirmNewPassword) {
        return res
          .status(400)
          .send({ message: "Confirm password don't match." });
      }
      const hashedPassword = PasswordEncryptor.hashPassword(
        NewPassword,
        process.env.APP_SECRET_KEY
      );

      user.Password = hashedPassword;
      await user.save();
      await cacheManager.invalidateCache();
      res.status(200).send({ message: "Updated successfully" });
    }
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};

const changeEmail = async (req, res) => {
  const { UserId } = req.params;
  const { Email, Password } = req.body;
  try {
    const user = await User.findOne({
      where: {
        UserId,
      },
    });
    const isAuthn = PasswordEncryptor.verifyPassword(
      Password,
      user.Password,
      process.env.APP_SECRET_KEY
    );

    if (!isAuthn) {
      return res
        .status(401)
        .send({ message: "Incorrect Username or Password." });
    }
    user.Email = Email;
    await user.save();
    await cacheManager.invalidateCache();
    res.status(200).send({ message: "Update successfully" });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};

const changePhoneNumber = async (req, res) => {
  const { UserId } = req.params;
  const { PhoneNumber, Password } = req.body;
  try {
    const user = await User.findOne({
      where: {
        UserId,
      },
    });
    const isAuthn = PasswordEncryptor.verifyPassword(
      Password,
      user.Password,
      process.env.APP_SECRET_KEY
    );

    if (!isAuthn) {
      return res
        .status(401)
        .send({ message: "Incorrect Username or Password." });
    }
    user.PhoneNumber = PhoneNumber;
    await user.save();
    await cacheManager.invalidateCache();
    res.status(200).send({ message: "Update successfully" });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};

const getUserVouchers = async (req, res) => {
  const { UserId } = req.params;
  try {
    const vouchers = await UserVoucher.findAll({
      where: {
        UserId,
        UsedAt: null,
      },
      include: [
        {
          model: Voucher,
          as: "voucher",
          where: {
            ExpiryDate: { [Op.gt]: dayjs().toDate() },
          },
        },
      ],
    });
    await cacheManager.invalidateCache();
    res.status(200).send({ message: "Successful", vouchers });
  } catch (error) {
    console.log(error)
    handleErrorResponse(res, 500, error);
  }
};

const createUserVoucher = async (req, res) => {
  const { UserId } = req.params;
  const { VoucherId } = req.body;
  try {
    const userVoucher = await UserVoucher.findOne({
      where: {
        UserId,
        VoucherId,
      },
    });
    if (userVoucher) {
      return res.status(400).send({ message: "You already have this voucher" });
    }
    const voucher = await Voucher.findOne({
      where: {
        VoucherId,
      },
    });
    if (!voucher) {
      return res.status(400).send({ message: "Voucher does not exist" });
    }
    if (dayjs(voucher.ExpiryDate).isBefore(dayjs())) {
      return res.status(400).send({ message: "Voucher has expired" });
    } else {
      if (voucher.CurrentUsage >= voucher.UsageLimit) {
        return res.status(400).send({
          message: "The usage limit for this voucher has been reached",
        });
      } else {
        await UserVoucher.create({
          UserId,
          VoucherId,
          UsedAt: null,
        });
        await cacheManager.invalidateCache();
        res.status(201).send({ message: "Created successfully", voucher });
      }
    }
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};

const deleteUserVoucher = async (req, res) => {
  const { UserId, VoucherId } = req.params;
  try {
    const voucher = await UserVoucher.findOne({
      where: {
        UserId,
        VoucherId,
      },
    });
    if (voucher.UsedAt) {
      return res.status(400).send({ message: "Voucher is already used" });
    }
    await voucher.destroy();
    await cacheManager.invalidateCache();
    res.status(200).send({ message: "Deleted successful" });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};

const getAllUser = async (req, res) => {
  try {
    const users = await cacheManager.getOrSetCache(
      req.originalUrl,
      async () => {
        const users = await User.findAll({
          attributes: { exclude: ["Password", "SecretKey", "OTP"] },
        });
        return users;
      },
      {
        EX: 10800,
      }
    );
    res.status(200).send({ message: "Successful", users });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};

const getUserDetail = async (req, res) => {
  const { UserId } = req.params;
  try {
    const user = await cacheManager.getOrSetCache(
      req.originalUrl,
      async () => {
        const user = await User.findOne({
          attributes: { exclude: ["Password", "SecretKey", "OTP"] },
          where: {
            UserId,
          },
          include: [
            {
              model: GroupHasUser,
              as: "groupHasUsers",
            },
          ],
        });
        return user;
      },
      {
        EX: 10800,
      }
    );

    res.status(200).send({ message: "Successful", user });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};

const createUser = async (req, res) => {
  const {
    UserName,
    Password,
    FullName,
    DOB,
    Gender,
    Address,
    PhoneNumber,
    Email,
    UserType,
    PermissionGroups,
  } = req.body;
  const t = await sequelize.transaction();
  try {
    const avatarUrl = `https://ui-avatars.com/api/?name=${FullName}`;
    const hashedPassword = PasswordEncryptor.hashPassword(
      Password,
      process.env.APP_SECRET_KEY
    );
    const secret = generateSecretKey();
    const smartOTP = generateOTP(secret, 300);

    const newUser = await User.create(
      {
        UserName,
        Password: hashedPassword,
        FullName,
        DOB: DOB ? DOB : null,
        Gender,
        Address,
        PhoneNumber,
        Email,
        Avatar: avatarUrl,
        SecretKey: secret,
        OTP: smartOTP,
        UserType,
        LoginAt: sequelize.literal("NOW()"),
        VerifiedAt: sequelize.literal("NOW()"),
        CreatedAt: sequelize.literal("NOW()"),
      },
      { transaction: t }
    );

    await Promise.all(
      PermissionGroups.map(async (group) => {
        await GroupHasUser.create(
          {
            PermissionGroupId: group,
            UserId: newUser.UserId,
          },
          { transaction: t }
        );
      })
    );

    await t.commit();
    await cacheManager.invalidateCache();
    res.status(201).send({
      message: "Created successfully.",
    });
  } catch (error) {
    await t.rollback();
    handleErrorResponse(res, 500, error);
  }
};
const updateUser = async (req, res) => {
  const { UserId } = req.params;
  const {
    Password,
    FullName,
    DOB,
    Gender,
    Address,
    Email,
    PhoneNumber,
    UserType,
    PermissionGroups,
  } = req.body;

  const t = await sequelize.transaction();
  try {
    const updateData = {
      FullName,
      DOB,
      Gender,
      Address,
      Email,
      PhoneNumber,
      UserType,
    };

    if (Password !== null) {
      updateData.Password = PasswordEncryptor.hashPassword(
        Password,
        process.env.APP_SECRET_KEY
      );
    }

    await User.update(updateData, {
      where: {
        UserId,
      },
      transaction: t,
    });

    await GroupHasUser.destroy({
      where: {
        UserId,
        PermissionGroupId: {
          [Op.notIn]: PermissionGroups,
        },
      },
      transaction: t,
    });

    await Promise.all(
      PermissionGroups.map(async (PermissionGroupId) => {
        const existingEntry = await GroupHasUser.findOne({
          where: { PermissionGroupId, UserId },
          transaction: t,
        });

        if (!existingEntry) {
          await GroupHasUser.create(
            { PermissionGroupId, UserId },
            { transaction: t }
          );
        }
      })
    );
    await cacheManager.invalidateCache();
    await t.commit();
    res.status(200).send({ message: "Updated successfully" });
  } catch (error) {
    await t.rollback();
    handleErrorResponse(res, 500, error);
  }
};
const deleteUser = async (req, res) => {
  const { UserId } = req.params;
  try {
    const user = await User.findOne({
      where: {
        UserId,
      },
    });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    user.DeletedAt = new Date();
    await user.save();
    await cacheManager.invalidateCache();
    res.status(200).send({ message: "Deleted successfully" });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const restoreUser = async (req, res) => {
  const { UserId } = req.params;
  try {
    const user = await User.findOne({
      where: {
        UserId,
      },
    });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    user.DeletedAt = null;
    await user.save();
    await cacheManager.invalidateCache();
    res.status(200).send({ message: "Restored successfully" });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const verifyUser = async (req, res) => {
  const { UserId } = req.params;
  try {
    const user = await User.findOne({
      where: {
        UserId,
      },
    });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    if (user.VerifiedAt) {
      return res.status(400).send({ message: "User is already verified" });
    }

    user.VerifiedAt = new Date();
    await user.save();
    await cacheManager.invalidateCache();
    return res.status(200).send({ message: "User verified successfully" });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const banUser = async (req, res) => {
  const { UserId } = req.params;
  try {
    const user = await User.findOne({
      where: {
        UserId,
      },
    });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    if (user.BlockedAt) {
      return res.status(400).send({ message: "User is already banned" });
    }

    user.BlockedAt = new Date();
    await user.save();
    await cacheManager.invalidateCache();
    return res.status(200).send({ message: "User banned successfully" });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const unbanUser = async (req, res) => {
  const { UserId } = req.params;
  try {
    const user = await User.findOne({
      where: {
        UserId,
      },
    });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    if (!user.BlockedAt) {
      return res.status(400).send({ message: "User is not banned" });
    }

    user.BlockedAt = null;
    await user.save();
    await cacheManager.invalidateCache();
    return res.status(200).send({ message: "User unbanned successfully" });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
module.exports = {
  addProductToCart,
  banUser,
  cancelOrder,
  changeEmail,
  changePassword,
  changePhoneNumber,
  createOrder,
  createUser,
  createUserVoucher,
  deleteUser,
  deleteUserVoucher,
  getAllUser,
  getOrderOfUser,
  getShoppingCartOfUser,
  getUserCoinHistory,
  getUserDetail,
  getUserVouchers,
  removeProductInCart,
  restoreUser,
  unbanUser,
  updateProductInCart,
  updateProfile,
  updateUser,
  uploadAvatar,
  verifyUser,
};
