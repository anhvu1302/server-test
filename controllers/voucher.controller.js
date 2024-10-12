const { Voucher, sequelize } = require("../models");
const fs = require("fs");
const csv = require("csvtojson");
const CacheManager = require("../cache/CacheManager");
const handleErrorResponse = require("../utils/handleErrorResponse");

const cacheManager = new CacheManager("voucher");

const getAllVoucher = async (req, res) => {
  try {
    const vouchers = await cacheManager.getOrSetCache(
      req.originalUrl,
      async () => {
        const vouchers = await Voucher.findAll({
          order: [["CreatedAt", "DESC"]],
        });
        return vouchers;
      },
      {
        EX: 10800,
      }
    );

    res.status(200).send({ message: "Successful", vouchers });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const getVoucherById = async (req, res) => {
  const { VoucherId } = req.params;
  try {
    const voucher = await cacheManager.getOrSetCache(
      req.originalUrl,
      async () => {
        const voucher = await Voucher.findOne({
          where: {
            VoucherId,
          },
        });
        return voucher;
      },
      {
        EX: 10800,
      }
    );
    res.status(200).send({ message: "Successful", voucher });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const createVoucher = async (req, res) => {
  const {
    DiscountType,
    DiscountAmount,
    MaxDiscountAmount,
    MinOrderAmount,
    UsageLimit,
    ExpiryDate,
  } = req.body;
  try {
    await Voucher.create({
      DiscountType,
      DiscountAmount,
      MaxDiscountAmount,
      MinOrderAmount,
      UsageLimit,
      CurrentUsage: 0,
      ExpiryDate,
      CreatedAt: sequelize.literal("NOW()"),
    });
    await cacheManager.invalidateCache();
    res.status(201).send({ message: "Created successful" });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const updateVoucher = async (req, res) => {
  const { VoucherId } = req.params;
  const {
    DiscountType,
    DiscountAmount,
    MaxDiscountAmount,
    MinOrderAmount,
    UsageLimit,
    ExpiryDate,
  } = req.body;
  try {
    await Voucher.update(
      {
        DiscountType,
        DiscountAmount,
        MaxDiscountAmount,
        MinOrderAmount,
        UsageLimit,
        ExpiryDate,
      },
      {
        where: {
          VoucherId,
        },
      }
    );
    await cacheManager.invalidateCache();
    res.status(200).send({ message: "Updated successfully" });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const deleteVoucher = async (req, res) => {
  const { VoucherId } = req.params;
  try {
    await Voucher.destroy({
      where: {
        VoucherId,
      },
    });
    await cacheManager.invalidateCache();
    res.status(200).send({ message: "Deleted successfully" });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const importData = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    let fileContent;
    fileContent = fs.readFileSync(req.file.path, "utf8");
    if (req.file.mimetype === "application/json") {
      fileContent = JSON.parse(fileContent);
    } else if (req.file.mimetype === "text/csv") {
      const jsonObj = await csv().fromString(fileContent);
      fileContent = jsonObj;
    } else {
      return res.status(400).send({ message: "Invalid file" });
    }
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
      }
    });

    await Promise.all(
      fileContent.map(async (voucher) => {
        await Voucher.create(
          {
            DiscountType: voucher.DiscountType,
            DiscountAmount: voucher.DiscountAmount,
            MaxDiscountAmount: voucher.MaxDiscountAmount,
            MinOrderAmount: voucher.MinOrderAmount,
            UsageLimit: voucher.UsageLimit,
            CurrentUsage: 0,
            ExpiryDate: voucher.ExpiryDate,
            CreatedAt: sequelize.literal("NOW()"),
          },
          { transaction: t }
        );
      })
    );
    t.commit();
    res.status(200).send({ message: "Import data successful" });
  } catch (error) {
    t.rollback();
    handleErrorResponse(res, 500, error);
  }
};
module.exports = {
  getAllVoucher,
  getVoucherById,
  updateVoucher,
  deleteVoucher,
  createVoucher,
  importData,
};
