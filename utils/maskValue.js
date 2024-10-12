class MaskValue {
  /**
   * Masks part of the email address for privacy.
   *
   * @param {string} email - The email address to be masked.
   * @returns {string} - The masked email address.
   */
  maskEmail = (email) => {
    const atIndex = email.indexOf("@");
    if (atIndex >= 0) {
      const username = email.slice(0, atIndex);
      const maskedUsername =
        username.charAt(0) +
        username.charAt(2) +
        username.charAt(3) +
        "*********" +
        username.charAt(username.length - 1);
      return maskedUsername + email.slice(atIndex);
    } else {
      return email;
    }
  };

  /**
   * Masks part of the phone number for privacy.
   *
   * @param {string} phoneNum - The phone number to be masked.
   * @returns {string} - The masked phone number.
   */
  maskPhoneNumber = (phoneNum) => {
    return "*******" + phoneNum.slice(-3);
  };
}

// Export an instance of the MaskValue class
module.exports = new MaskValue();
