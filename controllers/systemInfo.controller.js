const { SystemInfo } = require("../models");
const handleErrorResponse = require("../utils/handleErrorResponse");

const getAllSystemInfo = async (req, res) => {
  try {
    const systemInfos = await SystemInfo.findAll();
    res.status(200).send({ message: "Success", systemInfos });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};

module.exports = {
  getAllSystemInfo,
};
