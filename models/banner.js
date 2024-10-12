const { Model, DataTypes, Sequelize } = require("sequelize");
const generateId = require("../utils/generateId");

module.exports = (sequelize) => {
  class Banner extends Model {
    static associate(models) {
      Banner.belongsTo(models.User, {
        foreignKey: "CreatedBy",
        as: "creator",
      });
      Banner.hasMany(models.BannerHistory, {
        foreignKey: "BannerId",
        as: "bannerHistories",
      });
    }

    static async softDelete(bannerId, userId) {
      const banner = await Banner.findByPk(bannerId);
      if (banner) {
        banner.DeletedAt = new Date();
        await banner.save({ hooks: false });

        await sequelize.models.BannerHistory.create({
          BannerId: banner.BannerId,
          Title: banner.Title,
          ImageUrl: banner.ImageUrl,
          LinkUrl: banner.LinkUrl,
          StartDate: banner.StartDate,
          EndDate: banner.EndDate,
          ChangedBy: userId,
          ChangeAt: sequelize.literal("NOW()"),
          Action: "DELETE",
        });
      }
    }

    static async restore(bannerId, userId) {
      const banner = await Banner.findByPk(bannerId);
      if (banner) {
        banner.DeletedAt = null;
        await banner.save({ hooks: false });

        await sequelize.models.BannerHistory.create({
          BannerId: banner.BannerId,
          Title: banner.Title,
          ImageUrl: banner.ImageUrl,
          LinkUrl: banner.LinkUrl,
          StartDate: banner.StartDate,
          EndDate: banner.EndDate,
          ChangedBy: userId,
          ChangeAt: sequelize.literal("NOW()"),
          Action: "RESTORE",
        });
      }
    }
  }

  Banner.init(
    {
      BannerId: {
        type: DataTypes.STRING(10),
        primaryKey: true,
      },
      Title: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      ImageUrl: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      LinkUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      StartDate: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.fn("NOW"),
      },
      EndDate: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.fn("NOW"),
      },
      CreatedBy: {
        type: DataTypes.STRING(12),
        allowNull: false,
      },
      CreatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      DeletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      sequelize,
      modelName: "Banner",
      tableName: "tbl_banners",
      timestamps: false,
    }
  );

  Banner.beforeCreate(async (record, options) => {
    let id;
    let existingRecord;
    do {
      id = generateId(10);
      existingRecord = await Banner.findOne({
        where: { BannerId: id },
      });
    } while (existingRecord);
    record.BannerId = id;
  });

  Banner.afterCreate(async (banner, options) => {
    await sequelize.models.BannerHistory.create({
      BannerId: banner.BannerId,
      Title: banner.Title,
      ImageUrl: banner.ImageUrl,
      LinkUrl: banner.LinkUrl,
      StartDate: banner.StartDate,
      EndDate: banner.EndDate,
      ChangedBy: banner.CreatedBy,
      ChangeAt: sequelize.literal("NOW()"),
      Action: "CREATE",
    });
  });

  Banner.afterUpdate(async (banner, options) => {
    await sequelize.models.BannerHistory.create({
      BannerId: banner.BannerId,
      Title: banner.Title,
      ImageUrl: banner.ImageUrl,
      LinkUrl: banner.LinkUrl,
      StartDate: banner.StartDate,
      EndDate: banner.EndDate,
      ChangedBy: options.UserId,
      ChangeAt: sequelize.literal("NOW()"),
      Action: "UPDATE",
    });
  });

  return Banner;
};
