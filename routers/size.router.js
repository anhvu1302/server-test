const { getAllSize, createSize } = require("../controllers/size.controller.js");
const sizeRouter = require("express").Router();
const checkPermission = require("../middlewares/permission/checkPermission.js");
const authenticate = require("../middlewares/auth/authenticate.js");


sizeRouter.get("/", getAllSize);
sizeRouter.post("/", authenticate,checkPermission('CREATE_SIZE'), createSize);

module.exports = sizeRouter;
