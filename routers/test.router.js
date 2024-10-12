const express = require("express");
const querystring = require("qs");
const CryptoJS = require("crypto-js");
const { verifyOTP, generateOTP } = require("../utils/auth/2FA");
const AppSecretKey = process.env.APP_SECRET_KEY;
// const { checkPermission } = require('../middlewares/permission/checkPermission')
const testRouter = express.Router();
const {
  Permission,
  PermissionGroup,
  GroupHasPermission,
  GroupHasUser,
  sequelize,
  User,
  ProductReview,
} = require("../models");
const axios = require("axios");
const PasswordEncryptor = require("../utils/PasswordEncryptor");
const fs = require("fs");
const CacheManager = require("../cache/CacheManager");
const authenticate = require("../middlewares/auth/authenticate");
const checkPermission = require("../middlewares/permission/checkPermission");

testRouter.get("", authenticate, async (req, res) => {
  try {
    const array = [];
    console.log(Math.max(...array));
    res.status(200).send({ message: "ok" });
  } catch (error) {
    console.log(error);
    handleErrorResponse(res, 500, error);
  }
});

module.exports = testRouter;
