const jwt = require("jsonwebtoken");
const { User } = require("../models");
const ApiError = require("../utils/ApiError");

module.exports = async (req, res, next) => {
  try {
    const bearerToken = req.headers.authorization;

    if (!bearerToken) {
      next(new ApiError("token nya gak ada", 401));
    }

    const token = bearerToken.split("Bearer ")[1];

    let payload;

    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (innerErr) {
      next(new ApiError("token tidak valid", 401));
    }

    const user = await User.findByPk(payload.id, {
      include: ["Auth"],
    });
    req.user = user;
    req.payload = payload;
    next();
  } catch (err) {
    next(new ApiError(err.message, 500));
  }
};
