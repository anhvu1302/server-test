const { ShoppingCart, Customer } = require("../../models");

class Authorize {
  static async checkShoppingCartOfUser(req, res, next) {
    const { ShoppingCartId } = req.params;
    try {
      const productInCart = await ShoppingCart.findOne({
        where: {
          ShoppingCartId,
        },
      });
      if (req.session.user.UserId == productInCart.UserId) next();
      else res.status(403).send({ message: "Access denied" });
    } catch (error) {
      handleErrorResponse(res, 500, error);
    }
  }

  static async checkUserIdMatch(req, res, next) {
    const { UserId } = req.params;
    try {
      if (req.session.user.UserId === UserId) next();
      else res.status(403).send({ message: "Access Denied" });
    } catch (error) {
      handleErrorResponse(res, 500, error);
    }
  }
}

module.exports = Authorize;
