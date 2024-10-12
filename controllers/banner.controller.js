const CacheManager = require("../cache/CacheManager");
const { Banner, User } = require("../models");
const { Op } = require("sequelize");
const handleErrorResponse = require("../utils/handleErrorResponse");

const cacheManager = new CacheManager("banner");

const getAllActiveBanners = async (req, res) => {
  try {
    const banners = await cacheManager.getOrSetCache(
      req.originalUrl,
      async () => {
        const banners = await Banner.findAll({
          where: {
            DeletedAt: null,
            [Op.and]: [
              {
                [Op.or]: [
                  { StartDate: { [Op.lte]: new Date() } }, // less than or equal to
                  { StartDate: null },
                ],
              },
              {
                [Op.or]: [
                  { EndDate: { [Op.gte]: new Date() } }, // greater than or equal to
                  { EndDate: null },
                ],
              },
            ],
          },
          order: [["CreatedAt", "DESC"]],
        });
        return banners;
      },
      {
        EX: 43200, // 12 hours
      }
    );
    res.status(200).send({ message: "Successful", banners });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const getAllBanners = async (req, res) => {
  try {
    const banners = await cacheManager.getOrSetCache(
      req.originalUrl,
      async () => {
        const banners = await Banner.findAll({
          include: [
            {
              model: User,
              as: "creator",
              attributes: ["UserId", "UserName", "FullName", "Avatar"],
            },
          ],
          order: [["CreatedAt", "DESC"]],
        });
        return banners;
      },
      {
        EX: 43200, // 12 hours
      }
    );
    res.status(200).json({ message: "Ok", banners });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const getBannerDetail = async (req, res) => {
  const { BannerId } = req.params;
  try {
    const banner = await cacheManager.getOrSetCache(
      req.originalUrl,
      async () => {
        const banner = await Banner.findOne({
          where: {
            BannerId,
          },
        });
        return banner;
      },
      {
        EX: 43200, // 12 hours
      }
    );

    res.status(200).send({ message: "Successful", banner });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const createBanner = async (req, res) => {
  const { Title, ImageUrl, LinkUrl, StartDate, EndDate } = req.body;
  const { UserId } = req.session.user;
  try {
    await Banner.create({
      Title,
      ImageUrl,
      LinkUrl,
      StartDate,
      EndDate,
      CreatedBy: UserId,
    });
    // del cache 
    await cacheManager.invalidateCache();
    res.status(201).send({ message: "Created successfully" });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const updateBanner = async (req, res) => {
  const { BannerId } = req.params;
  const { UserId } = req.session.user;
  const { Title, ImageUrl, LinkUrl, StartDate, EndDate } = req.body;
  try {
    const banner = await Banner.findByPk(BannerId);
    if (banner) {
      banner.Title = Title;
      banner.ImageUrl = ImageUrl;
      banner.LinkUrl = LinkUrl;
      banner.StartDate = StartDate;
      banner.EndDate = EndDate;

      await banner.save({
        hooks: true,
        individualHooks: true,
        UserId,
      });
    }
    await cacheManager.invalidateCache();
    res.status(200).send({ message: "Updated successfully" });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const deleteBanner = async (req, res) => {
  const { BannerId } = req.params;
  const { UserId } = req.session.user;

  try {
    await Banner.softDelete(BannerId, UserId);
    await cacheManager.invalidateCache();
    res.status(201).send({ message: "Deleted successfully" });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
const restoreBanner = async (req, res) => {
  const { BannerId } = req.params;
  const { UserId } = req.session.user;

  try {
    await Banner.restore(BannerId, UserId);
    await cacheManager.invalidateCache();
    res.status(200).send({ message: "Restored successfully" });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};

const uploadBanner = (req, res) => {
  try {
    const { file } = req;
    const urlImage = `${process.env.BACKEND_URL}/${file.path}`.replace(
      /\\/g,
      "/"
    );
    res.status(200).send({ imageUrl: urlImage });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};
module.exports = {
  getAllBanners,
  getBannerDetail,
  getAllActiveBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  restoreBanner,
  uploadBanner,
};
