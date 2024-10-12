const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticate = (req, res, next) => {
  const token = req.header("x-access-token");
  try {
    const AppSecretKey = process.env.APP_SECRET_KEY;
    const decoded = jwt.verify(token, AppSecretKey);
    if (decoded) {
      req.session.user = decoded
      return next();
    } else {
      res.status(401).send({ message: "You are not logged in" });
    }
  } catch (error) {
    res.status(401).send({ message: "You are not logged in" });
  }
};

module.exports = authenticate;
