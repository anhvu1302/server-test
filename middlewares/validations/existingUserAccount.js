const { User } = require("../../models");
const { generateOTP } = require("../../utils/auth/2FA");
const Mailer = require("../../utils/mailer");
const mailer = new Mailer();
const jwt = require("jsonwebtoken");

require("dotenv").config();
const AppSecretKey = process.env.APP_SECRET_KEY;
const frontEndDomain = process.env.FRONTEND_URL;

const existingUserAccount = async (req, res, next) => {
  const { UserName } = req.body;
  try {
    const user = await User.findOne({
      where: {
        UserName,
      },
    });
    if (user && !user.VerifiedAt) {
      const smartOTP = generateOTP(user.SecretKey,300);
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
        AppSecretKey,
        { expiresIn: expDate }
      );
      const mailSubject = "Welcome to VAV Shop - Confirm Signup";
      await mailer.sendEmail(
        user.Email,
        mailSubject,
        "VerificationMailer.hbs",
        { frontEndDomain, verifyToken }
      );

      return res
        .status(200)
        .send({
          message:
            "This account has already existed. But not confirmed. Please confirm in Email",
        });
    } else if (user) {
      return res
        .status(200)
        .send({
          message:
            "This account has already exists. Please use another username",
        });
    } else {
      return next();
    }
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
};

module.exports = {
  existingUserAccount,
};
