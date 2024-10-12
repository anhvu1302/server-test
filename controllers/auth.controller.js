const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const { GroupHasUser, PermissionGroup, sequelize, User } = require("../models");
const PasswordEncryptor = require("../utils/PasswordEncryptor");
const CryptoJS = require("crypto-js");
const Mailer = require("../utils/mailer");
const {
  generateSecretKey,
  generateOTP,
  verifyOTP,
} = require("../utils/auth/2FA");
const maskValue = require("../utils/maskValue");
const dayjs = require("dayjs");
const handleErrorResponse = require("../utils/handleErrorResponse");
const mailer = new Mailer();

const checkUserInfo = async (req, res) => {
  const { UserName, PhoneNumber, Email } = req.query;
  try {
    let userInfo;
    if (UserName) {
      userInfo = await User.findOne({
        where: {
          UserName,
        },
      });
    }
    if (PhoneNumber) {
      userInfo = await User.findOne({
        where: {
          PhoneNumber,
        },
      });
    }
    if (Email) {
      userInfo = await User.findOne({
        where: {
          Email,
        },
      });
    }
    if (userInfo) {
      res.status(200).send({ exists: true });
    } else {
      res.status(200).send({ exists: false });
    }
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};

const forgotPassword = async (req, res) => {
  const { UserName, Email } = req.query;
  try {
    const user = await User.findOne({
      attributes: ["UserName", "Email", "FullName", "Avatar"],
      where: {
        [Op.or]: {
          UserName: UserName ? UserName : null,
          Email: Email ? Email : null,
        },
      },
    });
    if (!user) {
      res.status(401).send({ message: "Not found user!" });
    }
    const jsonData = JSON.stringify({
      ...user.dataValues,
      CreatedAt: Date.now(),
    });
    const encrypted = CryptoJS.AES.encrypt(
      jsonData,
      process.env.APP_SECRET_KEY
    ).toString();
    res.status(200).send({ message: "Successful", user: encrypted });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};

const getUserInfo = async (req, res) => {
  const accessToken = req.header("x-access-token");
  let token;
  try {
    const decoded = jwt.verify(accessToken, process.env.APP_SECRET_KEY);
    const user = await User.findOne({
      where: { UserId: decoded.UserId },
    });
    if (!user) {
      return res.status(404).send({ message: "User does not exist." });
    }

    if (user.DeletedAt) {
      return res.status(404).send({
        message: "The account no longer exists. Please contact admin.",
      });
    }
    if (user.BlockedAt) {
      return res.status(401).send({
        message: "Your account is banned. Please contact admin.",
      });
    }

    req.session.user = {
      UserId: user.UserId,
      UserName: user.UserName,
      UserType: user.UserType,
    };

    user.LoginAt = new Date();
    user.save();

    let sanitizedUser = {
      ...user.dataValues,
      Email: maskValue.maskEmail(user.Email),
      PhoneNumber: user.PhoneNumber
        ? maskValue.maskPhoneNumber(user.PhoneNumber)
        : null,
    };
    delete sanitizedUser.Password;
    delete sanitizedUser.SecretKey;
    delete sanitizedUser.OTP;

    const jsonData = JSON.stringify({
      message: "Successful",
      userLogin: sanitizedUser,
      token: token ? token : null,
    });
    const encrypted = CryptoJS.AES.encrypt(
      jsonData,
      process.env.APP_SECRET_KEY
    ).toString();

    return res.status(200).send(encrypted);
  } catch (error) {
    return handleErrorResponse(res, 500, error);
  }
};
const handleOAuthCallback = async (req, res) => {
  try {
    const providerMappings = {
      facebook: "fb",
      google: "gg",
      github: "gh",
    };
    const mappedProvider = providerMappings[req.user.provider] || "unknown";
    const UserName = `${mappedProvider}_${req.user.id}`;
    const Email = req.user.emails[0].value;

    const user = await User.findOne({
      where: {
        [Op.or]: {
          UserName,
          Email,
        },
      },
    });

    let message = "Login successful";

    if (!user) {
      message = "User does not exist.";
    }
    if (user && user.DeletedAt) {
      message = "The account no longer exists. Please contact admin.";
    }
    if (user && user.BlockedAt) {
      message = "Your account is banned. Please contact admin.";
    }

    const expDate = eval(process.env.JWT_EXPIRED) || 24 * 60 * 60;
    const token = jwt.sign(
      {
        UserId: user.UserId,
        UserName: user.UserName,
        UserType: user.UserType,
      },
      process.env.APP_SECRET_KEY,
      { expiresIn: expDate }
    );

    const stateObject = {
      message,
      token,
      createdAt: new Date(),
    };

    const encryptedState = CryptoJS.AES.encrypt(
      JSON.stringify(stateObject),
      process.env.APP_SECRET_KEY
    ).toString();

    res.redirect(
      `${process.env.FRONTEND_URL}?state=${encodeURIComponent(encryptedState)}`
    );
  } catch (error) {
    console.error("Error handling OAuth callback:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const googleCallback = async (req, res) => {
  await handleOAuthCallback(req, res);
};

const githubCallback = async (req, res) => {
  await handleOAuthCallback(req, res);
};

const facebookCallback = async (req, res) => {
  await handleOAuthCallback(req, res);
};

const login = async (req, res) => {
  const { UserName, Password } = req.body;
  try {
    const user = await User.findOne({
      where: { UserName },
    });

    const isAuthn = PasswordEncryptor.verifyPassword(
      Password,
      user.Password || "",
      process.env.APP_SECRET_KEY
    );
    if (!isAuthn || !user) {
      return res
        .status(400)
        .send({ message: "Incorrect Username or Password." });
    }

    if (!user.VerifiedAt) {
      const smartOTP = generateOTP(user.SecretKey, 300);
      user.OTP = smartOTP;
      await user.save();
      const expDate = 5 * 60;
      const verifyToken = jwt.sign(
        {
          UserId: user.UserId,
          UserName: user.UserName,
          Email: user.Email,
          SmartOTP: smartOTP,
        },
        process.env.APP_SECRET_KEY,
        { expiresIn: expDate }
      );
      const mailSubject = "Welcome to VAV Shop - Confirm Signup";
      await mailer.sendEmail(
        user.Email,
        mailSubject,
        "VerificationMailer.hbs",
        { frontEndDomain: process.env.FRONTEND_URL, verifyToken }
      );
      return res.status(200).send({
        message: "Successfully registered. Please confirm email to log in.",
      });
    }

    if (user.DeletedAt) {
      return res.status(404).send({
        message: "The account no longer exists. Please contact admin.",
      });
    }

    if (user.BlockedAt) {
      return res.status(401).send({
        message: "Your account is banned. Please contact admin.",
      });
    }

    const expDate = eval(process.env.JWT_EXPIRED) || 24 * 60 * 60;
    const token = jwt.sign(
      {
        UserId: user.UserId,
        UserName: user.UserName,
        UserType: user.UserType,
      },
      process.env.APP_SECRET_KEY,
      { expiresIn: expDate }
    );

    user.LoginAt = new Date();
    user.save();

    const formatUser = { ...user.dataValues };
    delete formatUser.Password;
    delete formatUser.SecretKey;
    delete formatUser.OTP;

    return res.status(200).send({
      message: "Successful",
      userLogin: formatUser,
      token: token,
    });
  } catch (error) {
    return handleErrorResponse(res, 500, error);
  }
};

const loginSuccess = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(403).send({
        success: false,
        message: "Not Authorized",
      });
    }

    const providerMappings = {
      facebook: "fb",
      google: "gg",
      github: "gh",
    };
    const mappedProvider = providerMappings[req.user.provider] || "unknown";
    const UserName = `${mappedProvider}_${req.user.id}`;
    const Email = req.user.emails[0].value;
    const user = await User.findOne({
      where: {
        [Op.or]: {
          UserName,
          Email,
        },
      },
    });

    if (!user || user.DeletedAt) {
      return res.status(404).send({
        message: "The account no longer exists. Please contact admin",
      });
    }

    if (user.BlockedAt) {
      return res.status(401).send({
        message: "Your account is banned, please contact admin",
      });
    }

    const expDate = eval(process.env.JWT_EXPIRED) || 24 * 60 * 60;
    const token = jwt.sign(
      {
        UserId: user.UserId,
        UserName: user.UserName,
        UserType: user.UserType,
      },
      process.env.APP_SECRET_KEY,
      {
        expiresIn: expDate,
      }
    );

    user.LoginAt = new Date();
    user.save();

    const sanitizedUser = { ...user.dataValues };
    delete sanitizedUser.Password;
    delete sanitizedUser.SecretKey;
    delete sanitizedUser.OTP;
    req.session.user = {
      UserId: user.UserId,
      UserName: user.UserName,
      UserType: user.UserType,
    };
    res.status(200).send({
      userLogin: sanitizedUser,
      x_access_token: token,
      isLoginThirdParty: true,
    });
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};

const loginFailed = (req, res) => {
  res.status(401).json({
    success: false,
    message: "failure",
  });
};

const logout = (req, res) => {
  req.logout();
  delete req.session.user;
  res.status(200).send({ message: "Logout successful" });
};

const sendOTPResetPassword = async (req, res) => {
  const { Email } = req.body;
  try {
    const user = await User.findOne({
      where: {
        Email,
      },
    });
    if (user) {
      const otp = generateOTP(user.SecretKey, 60);
      user.OTP = otp;
      await user.save();
      const mailSubject = "Welcome to VAV Shop - Confirm Reset Password";
      await mailer.sendEmail(
        user.Email,
        mailSubject,
        "ForgotPasswordMailer.hbs",
        { FullName: user.FullName, OTP: otp }
      );
      res.status(200).send({ message: "Send OTP successful" });
    }
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};

const register = async (req, res) => {
  const { UserName, Password, FullName, DOB, Gender, Email, PhoneNumber } =
    req.body;
  const t = await sequelize.transaction();
  try {
    const avatarUrl = `https://ui-avatars.com/api/?name=${FullName}`;
    const hashedPassword = PasswordEncryptor.hashPassword(
      Password,
      process.env.APP_SECRET_KEY
    );
    const secret = generateSecretKey();
    const smartOTP = generateOTP(secret, 300);

    const newUser = await User.create(
      {
        UserName,
        Password: hashedPassword,
        FullName,
        DOB: DOB ? DOB : null,
        Gender,
        Address: "",
        PhoneNumber,
        Email,
        Avatar: avatarUrl,
        SecretKey: secret,
        OTP: smartOTP,
        UserType: "CUSTOMER",
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
        UserId: newUser.UserId,
      },
      { transaction: t }
    );

    let verificationToken = {
      UserId: newUser.UserId,
      UserName: newUser.UserName,
      Email: newUser.Email,
      OTP: newUser.OTP,
      Expired: dayjs()
        .add(process.env.OTP_CONFIRM_REGISTER_EXPIRED, "minute")
        .toDate(),
    };
    verificationToken = CryptoJS.AES.encrypt(
      JSON.stringify(verificationToken),
      process.env.APP_SECRET_KEY
    );
    const mailSubject = "Welcome to VAV Shop - Confirm Signup";
    await mailer.sendEmail(Email, mailSubject, "VerificationMailer.hbs", {
      frontEndDomain: process.env.FRONTEND_URL,
      verificationToken: encodeURIComponent(verificationToken),
    });
    await t.commit();
    res.status(201).send({
      message: "Registered successfully, please confirm email to log in",
    });
  } catch (error) {
    await t.rollback();
    handleErrorResponse(res, 500, error);
  }
};

const resetPassword = async (req, res) => {
  const { Email, OTP, Password } = req.body;
  try {
    const hashedPassword = PasswordEncryptor.hashPassword(
      Password,
      process.env.APP_SECRET_KEY
    );
    const user = await User.findOne({
      where: {
        Email,
      },
    });

    const verifiedSuccessfully = verifyOTP(
      user.SecretKey,
      OTP,
      parseInt(process.env.OTP_RESET_PASSWORD_EXPIRED)
    );
    if (verifiedSuccessfully) {
      if (parseInt(user.OTP) === parseInt(OTP)) {
        user.Password = hashedPassword;
        await user.save();
        res.status(200).send({
          verifiedSuccessfully: true,
          message: "Change password Successfully",
        });
      } else {
        res.status(200).send({
          verifiedSuccessfully: false,
          message: "OTP is incorrect, please check again",
        });
      }
    } else {
      res
        .status(200)
        .send({ verifiedSuccessfully: false, message: "OTP has expired" });
    }
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};

const verifyRegistrationToken = async (req, res) => {
  const { verificationToken } = req.query;
  try {
    const decryptedBytes = CryptoJS.AES.decrypt(
      verificationToken,
      process.env.APP_SECRET_KEY
    );
    const decryptedData = JSON.parse(
      decryptedBytes.toString(CryptoJS.enc.Utf8)
    );
    if (decryptedData.Expired && dayjs(decryptedData.Expired) < dayjs()) {
      return res.status(400).send({
        message: "The registration confirmation link has expired.",
      });
    }

    const user = await User.findOne({
      where: {
        UserId: decryptedData.UserId,
      },
    });

    if (user.OTP === decryptedData.OTP) {
      if (user.VerifiedAt) {
        return res.status(200).send({
          message: "Your account has been confirmed. Please login to continue",
        });
      } else {
        user.VerifiedAt = new Date();
        await user.save();
        res.status(200).send({
          message:
            "Your email has been successfully confirmed. Please login to continue.",
        });
      }
    } else {
      res.status(400).send({
        message: "The OTP code is invalid or has expired. Please try again!",
      });
    }
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      res
        .status(400)
        .send({ message: "The registration confirmation link has expired." });
    } else {
      handleErrorResponse(res, 500, error);
    }
  }
};

module.exports = {
  googleCallback,
  githubCallback,
  facebookCallback,
  checkUserInfo,
  forgotPassword,
  getUserInfo,
  login,
  loginFailed,
  loginSuccess,
  logout,
  register,
  resetPassword,
  sendOTPResetPassword,
  verifyRegistrationToken,
};
