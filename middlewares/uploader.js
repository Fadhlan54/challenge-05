const multer = require("multer");
const ApiError = require("../utils/ApiError");

const multerFiltering = (req, file, next) => {
  if (
    file.mimeType == "image/png" ||
    file.mimeType == "image/jpg" ||
    file.mimeType == "image/jpeg"
  ) {
    cb(null, true);
  } else {
    next(ApiError("hanya menerima format gambar .jpg, .jpeg, dan .png"));
  }
};

const upload = multer({
  fileFilter: multerFiltering,
});

module.exports = upload;
