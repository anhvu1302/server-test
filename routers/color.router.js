const {
  getAllColor,
  createColor,
  getAllColorOfProduct,
} = require("../controllers/color.controller");
const colorRouter = require("express").Router();
const authenticate = require("../middlewares/auth/authenticate.js");

colorRouter.get("/", getAllColor);
colorRouter.get("/:ProductId/product", getAllColorOfProduct);
colorRouter.post("/", authenticate, createColor);

module.exports = colorRouter;
