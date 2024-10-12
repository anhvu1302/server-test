const {
  createCheckoutUrl,
  getProductCheckout,
} = require("../controllers/checkout.controller");
const authenticate = require("../middlewares/auth/authenticate");

const checkoutRouter = require("express").Router();

checkoutRouter.post("/create-url", authenticate, createCheckoutUrl);
checkoutRouter.get("/get-product-checkout", authenticate, getProductCheckout);

module.exports = checkoutRouter;
