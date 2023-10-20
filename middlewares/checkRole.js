const ApiError = require("../utils/ApiError");

const checkRole = (...roles) => {
  return async (req, res, next) => {
    try {
      if (!roles.includes(req.user.role)) {
        next(new ApiError(`kamu tidak memiliki kepentingan disini`, 401));
      }
      next();
    } catch (err) {
      next(new ApiError(err.message, 500));
    }
  };
};

module.exports = checkRole;
