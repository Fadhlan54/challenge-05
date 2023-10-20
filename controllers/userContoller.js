const { User, Auth } = require("../models");
const ApiError = require("../utils/ApiError");

const createAdmin = async (req, res, next) => {
  try {
    const { name, age, address, email, password, confirmPassword } = req.body;

    if (!name || !email || !password)
      next(new ApiError("name, email, dan password wajib diisi", 400));

    // validasi untuk check apakah email nya udah ada
    const checkUser = await Auth.findOne({
      where: {
        email,
      },
    });

    if (checkUser) {
      next(new ApiError("Email sudah ada", 400));
    }

    // minimum password length
    if (password.length < 8) {
      next(new ApiError("Panjang password minimal 8 karakter", 400));
    }

    // minimum password length
    if (password !== confirmPassword) {
      next(new ApiError("password tidak cocok", 400));
    }

    // hashing password
    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);

    const newUser = await User.create({
      name,
      address,
      role: "Admin",
      age,
    });

    await Auth.create({
      email,
      password,
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

const findUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      include: ["Auth", "Shop"],
    });

    res.status(200).json({
      status: "Success",
      data: {
        users,
      },
    });
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};

const findUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: ["Auth", "Shop"],
    });

    res.status(200).json({
      status: "Success",
      data: {
        user,
      },
    });
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};

const UpdateUser = async (req, res, next) => {
  try {
    const { name, age, address, email, password, confirmPassword } =
      req.newUser;

    // minimum password length
    if (password.length < 8) {
      next(new ApiError("Panjang password minimal 8 karakter", 400));
    }

    // minimum password length
    if (password !== confirmPassword) {
      next(new ApiError("password tidak cocok", 400));
    }

    // hashing password
    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);

    const userUpdate = await User.update(
      {
        name,
        age,
        address,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );
    const authUpdate = await Auth.update(
      {
        email,
        password: hashedPassword,
      },
      {
        where: {
          userId: userUpdate.id,
        },
      }
    );

    res.status(200).json({
      status: "Success",
      data: {
        id: userUpdate.id,
        name: userUpdate.name,
        age: userUpdate.age,
        address: userUpdate.address,
        role: userUpdate.role,
        email: authUpdate.email,
      },
    });
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        id: req.params.id,
      },
    });

    if (!user) {
      next(new ApiError("User dengan id tersebut gak ada", 404));
    }

    await User.destroy({
      where: {
        id: req.params.id,
      },
    });

    res.status(200).json({
      status: "Success",
      message: `sukses delete user ${user.name}`,
    });
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};

module.exports = {
  createAdmin,
  findUsers,
  findUserById,
  UpdateUser,
  deleteUser,
};
