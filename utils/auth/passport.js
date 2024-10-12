const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const {
  User,
  PermissionGroup,
  GroupHasUser,
  sequelize,
  Sequelize,
} = require("../../models");
const { Op } = require("sequelize");
const passport = require("passport");
const { generateSecretKey, generateOTP } = require("./2FA");
const generateId = require("../generateId");
const PasswordEncryptor = require("../PasswordEncryptor");
require("dotenv").config();

const createUserFormThirdParty = async (profile, provider) => {
  const t = await sequelize.transaction();
  try {
    const providerMappings = {
      facebook: "fb",
      google: "gg",
      github: "gh",
    };
    const mappedProvider = providerMappings[provider] || "unknown";
    const UserName = `${mappedProvider}_${profile.id}`;
    const Email = profile.emails[0].value;
    const user = await User.findOne({
      where: {
        [Op.or]: {
          UserName,
          Email,
        },
      },
    });
    if (!user) {
      let UserId;
      let existingUser;
      do {
        UserId = generateId(12);
        existingUser = await User.findOne({
          attributes: ["UserId"],
          where: {
            UserId,
          },
        });
      } while (existingUser);
      const secret = generateSecretKey();
      const smartOTP = generateOTP(secret, 60);

      const generateRandomPassword = new Date();
      const hashedPassword = PasswordEncryptor.hashPassword(
        generateRandomPassword + process.env.APP_SECRET_KEY,
        process.env.APP_SECRET_KEY
      );

      await User.create(
        {
          UserId,
          UserName,
          Password: hashedPassword,
          FullName: profile.displayName,
          DOB: null,
          Gender: null,
          Address: "",
          PhoneNumber: null,
          Email,
          Avatar: profile.photos[0].value,
          SecretKey: secret,
          OTP: smartOTP,
          UserType: "CUSTOMER",
          VerifiedAt: sequelize.literal("NOW()"),
          LoginAt: sequelize.literal("NOW()"),
          CreatedAt: sequelize.literal("NOW()"),
        },
        { transaction: t }
      );
      const permissionGroup = await PermissionGroup.findOne({
        where: {
          PermissionGroupName: "CUSTOMER",
        },
      });
      await GroupHasUser.create(
        {
          PermissionGroupId: permissionGroup.PermissionGroupId,
          UserId,
        },
        { transaction: t }
      );
      await t.commit();
    }
  } catch (error) {
    await t.rollback();
    console.log("Error creating user from third-party");
  }
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        await createUserFormThirdParty(profile, "google");
        done(null, profile);
      } catch (error) {
        console.log("Error creating user from third-party");
      }
    }
  )
);
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      profileFields: ["id", "displayName", "photos", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        await createUserFormThirdParty(profile, "facebook");
        done(null, profile);
      } catch (error) {
        console.log("Error creating user from third-party");
      }
    }
  )
);
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
module.exports = passport;
