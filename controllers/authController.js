const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Auth, User } = require("../models");
const ApiError = require("../utils/ApiError");

const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, age, address } = req.body;
    if (!name || !email || !password) {
      next(new ApiError("nama, email, dan password harus diisi", 400));
    }
    // validasi untuk check apakah email sudah ada
    const user = await Auth.findOne({
      where: {
        email,
      },
    });

    // validasi data yang dikirimkan
    if (user) {
      next(new ApiError("Email sudah terdaftar", 409));
    }
    if (password.length < 8) {
      next(new ApiError("Password minimal 8 karakter", 400));
    }
    if (password !== confirmPassword) {
      next(new ApiError("Password tidak cocok", 400));
    }

    // hashing password
    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);

    const newUser = await User.create({
      name,
      address,
      role: "Member",
      age,
    });

    await Auth.create({
      email,
      password: hashedPassword,
      userId: newUser.id,
    });

    res.status(201).json({
      status: "Success",
      data: {
        ...newUser,
        email,
        password: hashedPassword,
      },
    });
  } catch (err) {
    next(new ApiError(err.message, 500));
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if ((!email, !password)) {
      next(new ApiError("email atau password harus diisi", 400));
    }
    const user = await Auth.findOne({
      where: {
        email,
      },
      include: ["User"],
    });

    if (user && bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign(
        {
          id: user.userId,
          username: user.User.name,
          role: user.User.role,
          email: user.email,
        },
        process.env.JWT_SECRET
      );

      res.status(200).json({
        status: "Success",
        message: "Berhasil login",
        data: token,
      });
    } else {
      next(new ApiError("email atau password salah", 400));
    }
  } catch (err) {
    next(new ApiError(err.message, 500));
  }
};

const checkToken = (req, res, next) => {
  try {
    const user = req.user;
    res.status(200).json({
      status: "Success",
      data: {
        id: user.id,
        name: user.name,
        age: user.age,
        address: user.address,
        role: user.role,
        email: req.payload.email,
      },
    });
  } catch (err) {
    next(new ApiError(err.message));
  }
};

module.exports = {
  register,
  login,
  checkToken,
};
