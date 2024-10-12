const multer = require("multer");
const mkdirp = require("mkdirp");

const uploadFile = (extensionFileList = []) => {
  mkdirp.sync(`./public/files`);

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `./public/files`);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1e9);
      const ext = file.originalname.split(".").pop();
      cb(null, uniqueSuffix + "." + ext);
    },
  });

  const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
      if (
        extensionFileList.length === 0 ||
        extensionFileList.includes(file.originalname.split(".").pop())
      ) {
        return cb(null, true);
      } else {
        return cb(new Error("Invalid file"), false);
      }
    },
  }).single("file");

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

module.exports = uploadFile;
