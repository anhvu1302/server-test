const speakeasy = require("speakeasy");

/**
 * Generates a secret key for OTP generation
 *
 * @returns {string} - The generated secret key encoded in base32.
 */
const generateSecretKey = () => {
  const secret = speakeasy.generateSecret({ length: 30 });
  return secret.base32;
};

/**
 * Generates an OTP based on a secret key and expiration time
 *
 * @param {string} secret - The secret key used to generate the OTP, encoded in base32.
 * @param {number} [step=60] - The expiration time of the OTP in seconds. Default is 60 seconds.
 * @returns {string} - The generated OTP.
 */
const generateOTP = (secret, step = 60) => {
  const token = speakeasy.totp({
    secret: secret,
    encoding: "base32",
    algorithm: "sha512",
    step: step,
  });
  return token;
};

/**
 * Verifies an OTP based on a secret key and expiration time
 *
 * @param {string} secret - The secret key used to generate the OTP, encoded in base32.
 * @param {string} OTP - The OTP to be verified.
 * @param {number} [step=60] - The expiration time of the OTP in seconds. Default is 60 seconds.
 * @returns {boolean} - True if the OTP is valid, false otherwise.
 */
const verifyOTP = (secret, OTP, step = 60) => {
  const tokenValidates = speakeasy.totp.verify({
    secret: secret,
    encoding: "base32",
    algorithm: "sha512",
    token: OTP,             
    step: step,
  });
  return tokenValidates;
};

module.exports = {
  generateSecretKey,
  generateOTP,
  verifyOTP,
};
