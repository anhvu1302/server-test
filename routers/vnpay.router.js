const express = require("express");
const dayjs = require("dayjs");
const querystring = require("qs");
const CryptoJS = require("crypto-js");
const vnpayRouter = express.Router();
const { Order, sequelize, OrderState } = require("../models");
const handleErrorResponse = require("../utils/handleErrorResponse");

require("dotenv").config();
let tmnCode = process.env.VNP_TMNCODE;
let secretKey = process.env.VNP_HASHSECRET;
let vnpUrl = process.env.VNP_URL;
let returnUrl = process.env.VNP_RETURNURL;

vnpayRouter.post("/create_payment_url", function (req, res, next) {
  let { amount, bankCode, OrderId } = req.body;
  process.env.TZ = "Asia/Ho_Chi_Minh";

  let date = new Date();
  let createDate = dayjs(date).format("YYYYMMDDHHmmss");

  let ipAddr =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  let orderId = dayjs(date).format("DDHHmmss");

  let currCode = "VND";
  let vnp_Params = {};
  vnp_Params["vnp_Version"] = "2.1.0";
  vnp_Params["vnp_Command"] = "pay";
  vnp_Params["vnp_TmnCode"] = tmnCode;
  vnp_Params["vnp_Locale"] = "vn";
  vnp_Params["vnp_CurrCode"] = currCode;
  vnp_Params["vnp_TxnRef"] = orderId;
  vnp_Params["vnp_OrderInfo"] = "TT_" + OrderId;
  vnp_Params["vnp_OrderType"] = "other";
  vnp_Params["vnp_Amount"] = amount * 100;
  vnp_Params["vnp_ReturnUrl"] = returnUrl;
  vnp_Params["vnp_IpAddr"] = ipAddr;
  vnp_Params["vnp_CreateDate"] = createDate;
  if (bankCode !== null && bankCode !== "") {
    vnp_Params["vnp_BankCode"] = bankCode;
  }

  vnp_Params = sortObject(vnp_Params);

  let signData = querystring.stringify(vnp_Params, { encode: false });
  let hmac = CryptoJS.HmacSHA512(signData, secretKey);
  let signed = hmac.toString(CryptoJS.enc.Hex);

  vnp_Params["vnp_SecureHash"] = signed;
  vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });
  res.status(200).send(vnpUrl);
});

vnpayRouter.get("/vnpay-return", async (req, res, next) => {
  try {
    let vnp_Params = req.query;
    let secureHash = vnp_Params["vnp_SecureHash"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);
    let signData = querystring.stringify(vnp_Params, { encode: false });

    let hmac = CryptoJS.HmacSHA512(signData, secretKey);
    let signed = hmac.toString(CryptoJS.enc.Hex);

    // Verify secure hash
    if (secureHash === signed) {
      if (vnp_Params["vnp_ResponseCode"] === "00") {
        const t = await sequelize.transaction();
        const orderId = vnp_Params["vnp_OrderInfo"].split("_")[1];

        try {
          const order = await Order.findOne({
            where: {
              OrderId: orderId,
            },
          });
          if (!order) {
            return res.status(404).json({
              message: "Order not found.",
              vnp_ResponseCode: "97",
              vnp_OrderInfo: vnp_Params["vnp_OrderInfo"],
            });
          }

          if (order.PaymentAt) {
            await t.rollback();
            return res
              .status(200)
              .send({
                message: "The order has been paid.",
                vnp_ResponseCode: vnp_Params["vnp_ResponseCode"],
                vnp_OrderInfo: vnp_Params["vnp_OrderInfo"],
              });
          }

          order.PaymentAt = new Date();
          await order.save({ transaction: t });

          await OrderState.create(
            {
              OrderId: orderId,
              Status: "Thanh toán đơn hàng thành công qua VNPAY",
              CreatedAt: sequelize.literal("NOW()"),
            },
            { transaction: t }
          );

          await t.commit();

          return res.status(200).json({
            message: "Payment successful.",
            vnp_ResponseCode: vnp_Params["vnp_ResponseCode"],
            vnp_OrderInfo: vnp_Params["vnp_OrderInfo"],
          });
        } catch (error) {
          console.log(error);
          await t.rollback();
          handleErrorResponse(res, 500, error);
        }
      } else {
        return res.status(200).json({
          message: "Success",
          vnp_ResponseCode: vnp_Params["vnp_ResponseCode"],
          vnp_OrderInfo: vnp_Params["vnp_OrderInfo"],
        });
      }
    } else {
      return res.status(200).json({
        message: "Success",
        vnp_ResponseCode: "97",
        vnp_OrderInfo: vnp_Params["vnp_OrderInfo"],
      });
    }
  } catch (error) {
    console.log(error);
    handleErrorResponse(res, 500, error);
  }
});

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}
module.exports = vnpayRouter;
