const CryptoJS = require("crypto-js");
require("dotenv").config();
const hashSeparator = process.env.HASH_SEPARATOR;
class PasswordEncryptor {
  /**
   * Generates a random salt.
   *
   * @param {number} length - The length of the salt.
   * @returns {string} - The generated salt.
   */
  generateSalt(length = 16) {
    return CryptoJS.lib.WordArray.random(length).toString();
  }

  /**
   * Hashes a password using SHA-256 with a salt.
   *
   * @param {string} password - The password to hash.
   * @param {string} secretKey - The secret key to use for hashing.
   * @returns {string} - The hashed password with the salt.
   */
  hashPassword(password, secretKey) {
    const salt = this.generateSalt();
    const hash = CryptoJS.SHA256(password + secretKey + salt).toString(
      CryptoJS.enc.Hex
    );
    return `${salt}${hashSeparator}${hash}`;
  }

  /**
   * Verifies a password by comparing it with a hashed password with salt.
   *
   * @param {string} password - The password to verify.
   * @param {string} storedHash - The stored hashed password with the salt.
   * @param {string} secretKey - The secret key used for hashing.
   * @returns {boolean} - True if the password is correct, false otherwise.
   */
  verifyPassword(password, storedHash, secretKey) {
    const [salt, hash] = storedHash.split(hashSeparator);
    const inputHash = CryptoJS.SHA256(password + secretKey + salt).toString(
      CryptoJS.enc.Hex
    );
    return inputHash === hash;
  }
}

module.exports = new PasswordEncryptor();
