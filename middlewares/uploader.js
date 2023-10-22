const multer = require("multer");
const ApiError = require("../utils/ApiError");

const multerFiltering = (req, file, cb) => {
  if (
    file.mimetype == "image/png" ||
    file.mimetype == "image/jpg" ||
    file.mimetype == "image/jpeg"
  ) {
    cb(null, true);
  } else {
    return cb(
      new ApiError("hanya menerima format gambar .jpg, .jpeg, dan .png", 400)
    );
  }
};

const upload = multer({
  fileFilter: multerFiltering,
});

module.exports = upload;
