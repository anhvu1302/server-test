const multer = require("multer");
const mkdirp = require("mkdirp");

const uploadImage = (type) => {
  mkdirp.sync(`./public/images/${type}`);

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `./public/images/${type}`);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix =
        Date.now() + "_" + Math.round(Math.random() * 1e9) + `_${type}`;
      const ext = file.originalname.split(".").pop();
      cb(null, uniqueSuffix + "." + ext);
    },
  });

  const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
      const extensionImageList = [
        "png",
        "jpg",
        "jpeg",
        "ico",
        "gif",
        "svg",
        "svgz",
        "webp",
        "xbm",
      ];
      if (extensionImageList.indexOf(file.originalname.split(".").pop()) > -1) {
        return cb(null, true);
      } else {
        return cb(new Error("Invalid file"), false);
      }
    },
  }).single(type);

  return (req, res, next) => {
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        res.status(400).json({ message: "Multer Error: " + err.message });
      } else if (err) {
        res.status(500).json({ message: "Upload Error: " + err.message });
      } else {
        next();
      }
    });
  };
};
module.exports = uploadImage;
