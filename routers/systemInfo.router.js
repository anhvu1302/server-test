const systemInfo = require("express").Router();
const { getAllSystemInfo } = require("../controllers/systemInfo.controller");

systemInfo.get("/", getAllSystemInfo);

module.exports = systemInfo;
