const CacheManager = require("../cache/CacheManager");
const { sequelize } = require("../models");
const handleErrorResponse = require("../utils/handleErrorResponse");
const cacheManager = new CacheManager("statistics");

const getUserLoginCount = async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ error: "Please provide both startDate and endDate." });
  }

  try {
    const results = await cacheManager.getOrSetCache(
      req.originalUrl,
      async () => {
        const [results] = await sequelize.query(
          "CALL GetUserLoginCount(:startDate, :endDate)",
          {
            replacements: { startDate, endDate },
          }
        );
        return results;
      },
      {
        EX: 60, //1 minute
      }
    );

    res
      .status(200)
      .send({ message: "Successful", UserLoginCount: results.UserLoginCount });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const getQuantitySoldByCategory = async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ error: "Please provide both startDate and endDate." });
  }

  try {
    const results = await cacheManager.getOrSetCache(
      req.originalUrl,
      async () => {
        const results = await sequelize.query(
          "CALL GetQuantitySoldByCategory(:startDate, :endDate)",
          {
            replacements: { startDate, endDate },
          }
        );
        return results;
      },
      {
        EX: 60, //1 minute
      }
    );

    res.status(200).send({ message: "Successful", results });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const getTotalSalesByCategory = async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ error: "Please provide both startDate and endDate." });
  }

  try {
    const results = await cacheManager.getOrSetCache(
      req.originalUrl,
      async () => {
        const results = await sequelize.query(
          "CALL GetTotalSalesByCategory(:startDate, :endDate)",
          {
            replacements: { startDate, endDate },
          }
        );
        return results;
      },
      {
        EX: 60, //1 minute
      }
    );

    res.status(200).send({ message: "Successful", results });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const getQuantitySoldByParentCategory = async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ error: "Please provide both startDate and endDate." });
  }

  try {
    const results = await cacheManager.getOrSetCache(
      req.originalUrl,
      async () => {
        const results = await sequelize.query(
          "CALL GetQuantitySoldByParentCategory(:startDate, :endDate)",
          {
            replacements: { startDate, endDate },
          }
        );
        return results;
      },
      {
        EX: 60, //1 minute
      }
    );

    res.status(200).send({ message: "Successful", results });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const getTotalSalesByParentCategory = async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ error: "Please provide both startDate and endDate." });
  }

  try {
    const results = await cacheManager.getOrSetCache(
      req.originalUrl,
      async () => {
        const results = await sequelize.query(
          "CALL GetTotalSalesByParentCategory(:startDate, :endDate)",
          {
            replacements: { startDate, endDate },
          }
        );
        return results;
      },
      {
        EX: 60, //1 minute
      }
    );

    res.status(200).send({ message: "Successful", results });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const getMonthlySalesSummary = async (req, res) => {
  const { startMonth, startYear, endMonth, endYear } = req.query;

  if (!startMonth || !startYear || !endMonth || !endYear) {
    return res.status(400).json({
      error: "Please provide startMonth, startYear, endMonth, and endYear.",
    });
  }

  try {
    const results = await cacheManager.getOrSetCache(
      req.originalUrl,
      async () => {
        const results = await sequelize.query(
          "CALL GetMonthlySalesSummary(:startMonth, :startYear, :endMonth, :endYear)",
          {
            replacements: { startMonth, startYear, endMonth, endYear },
          }
        );
        return results;
      },
      {
        EX: 60, //1 minute
      }
    );

    res.status(200).json({ message: "Successful", results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getDailySalesAndRevenue = async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ error: "Please provide both startDate and endDate." });
  }

  try {
    const results = await cacheManager.getOrSetCache(
      req.originalUrl,
      async () => {
        const results = await sequelize.query(
          "CALL GetDailySalesAndRevenue(:startDate, :endDate)",
          {
            replacements: { startDate, endDate },
          }
        );
        return results;
      },
      {
        EX: 60, //1 minute
      }
    );

    res.status(200).send({ message: "Successful", results });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
module.exports = {
  getUserLoginCount,
  getQuantitySoldByCategory,
  getQuantitySoldByParentCategory,
  getTotalSalesByCategory,
  getTotalSalesByParentCategory,
  getMonthlySalesSummary,
  getDailySalesAndRevenue,
};
