/**
 * Generates a unique identifier with a specified length.
 * For lengths <= 8, it generates a simple random string.
 * For lengths > 8, it includes a date prefix (MMDDYY) followed by a random string.
 *
 * @param {number} [length=12] - The desired length of the identifier.
 * @returns {string} - The generated identifier.
 */
const generateId = (length = 12) => {
  const characters =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomString = "";

  if (length <= 8) {
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }
    return randomString;
  } else {
    const currentDateTime = new Date();
    const year = currentDateTime.getFullYear().toString().slice(-2);
    const month = ("0" + (currentDateTime.getMonth() + 1)).slice(-2);
    const day = ("0" + currentDateTime.getDate()).slice(-2);

    // Generate the random string part
    for (let i = 0; i < length - 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }

    const generatedId = month + day + year + randomString;
    return generatedId;
  }
};

module.exports = generateId;
