const {
  ProductVariant,
  sequelize,
  Product,
  ShoppingCart,
  Color,
  Size,
} = require("../models");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const handleErrorResponse = require("../utils/handleErrorResponse");
const AppSecretKey = process.env.APP_SECRET_KEY;

const createCheckoutUrl = async (req, res) => {
  const accessToken = req.header("x-access-token");
  const { UserId, CartItems } = req.body;
  try {
    const decoded = jwt.decode(accessToken, AppSecretKey);
    if (decoded.UserId !== UserId) {
      return res.status(403).send({ message: "Access denied" });
    }
    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify({ UserId, CartItems }),
      AppSecretKey
    ).toString();
    res.status(200).send({ message: "Successful", state: encryptedData });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const getProductCheckout = async (req, res) => {
  const accessToken = req.header("x-access-token");
  const { state } = req.query;
  try {
    const decryptedBytes = CryptoJS.AES.decrypt(state, AppSecretKey);
    const decryptedData = JSON.parse(
      decryptedBytes.toString(CryptoJS.enc.Utf8)
    );

    const decoded = jwt.decode(accessToken, AppSecretKey);
    if (decoded.UserId !== decryptedData.UserId) {
      return res.status(403).send({ message: "Access denied" });
    }

    const productCheckout = await Promise.all(
      decryptedData.CartItems.map(async (item) => {
        const product = await ProductVariant.findOne({
          where: {
            ProductVariantId: item.ProductVariantId,
          },
          attributes: {
            include: [
              [
                sequelize.fn(
                  "fn_GetProductImage",
                  sequelize.col("ProductVariant.ProductId"),
                  sequelize.col("ProductVariant.ColorId")
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
        });
        return {
          ...item,
          productVariant: product,
        };
      })
    );
    res.status(200).send({ message: "Successful", productCheckout });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
module.exports = {
  createCheckoutUrl,
  getProductCheckout,
};
