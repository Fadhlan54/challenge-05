const { Car, User } = require("../models");
const imagekit = require("../lib/imagekit");
const ApiError = require("../utils/ApiError");
const { Op } = require("sequelize");

const uploadImage = async (file) => {
  try {
    const split = file.originalname.split(".");
    const extension = split[split.length - 1];

    // upload file ke imagekit
    const uploadedImage = await imagekit.upload({
      file: file.buffer,
      fileName: `IMG-${Date.now()}.${extension}`,
    });

    if (!uploadedImage)
      return next(new ApiError("server gagal mengupload gambar", 500));

    return uploadedImage.url;
  } catch (err) {
    return err.message;
  }
};

const createCar = async (req, res, next) => {
  try {
    const { model, type, price } = req.body;

    const file = req.file;
    if (!model || !type || !price || !file) {
      next(new ApiError("model, type, price, dan image harus diisi", 400));
    }
    let imageUrl;

    if (file) {
      imageUrl = await uploadImage(file);
    }

    const newCar = await Car.create({
      model,
      type,
      price,
      createdBy: req.user.name,
      lastUpdatedBy: req.user.name,
      imageUrl,
    });

    if (!newCar)
      return next(new ApiError("Gagal membuat data mobil baru", 500));

    res.status(200).json({
      status: "Success",
      data: {
        newCar,
      },
    });
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};

const findCars = async (req, res, next) => {
  try {
    const cars = await Car.findAll({ paranoid: false });

    res.status(200).json({
      status: "Success",
      data: {
        cars,
      },
    });
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};

const findCarById = async (req, res, next) => {
  try {
    const car = await Car.findByPk(req.params.id);

    if (!car) return next(new ApiError("id tidak ditemukan", 404));

    res.status(200).json({
      status: "Success",
      data: {
        car,
      },
    });
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};

const updateCar = async (req, res, next) => {
  try {
    const checkCar = await Car.findByPk(req.params.id);

    if (!checkCar) return next(new ApiError("Id tidak ditemukan", 404));

    const { model, type, price } = req.body;
    const file = req.file;

    let imageUrl;

    if (file) {
      imageUrl = await uploadImage(file);
    }

    await Car.update(
      {
        type,
        price,
        model,
        imageUrl,
        lastUpdatedBy: req.user.name,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );

    const updatedCar = await Car.findByPk(req.params.id);

    res.status(200).json({
      status: "Success",
      message: "sukses update produk",
      data: updatedCar,
    });
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};

const deleteCar = async (req, res, next) => {
  try {
    const car = await Car.findOne({
      where: {
        id: req.params.id,
      },
    });

    if (!car) return next(new ApiError("Car id tersebut tidak ditemukan", 404));

    const deletedBy = await User.findByPk(req.user.id);

    await Car.update(
      {
        deletedBy: deletedBy.name,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );

    await Car.destroy({
      where: {
        id: req.params.id,
      },
    });

    res.status(200).json({
      status: "Success",
      message: `berhasil menghapus data mobil id: ${car.id}`,
    });
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};

const availableCars = async (req, res, next) => {
  const { name, model, maxPrice, minPrice } = req.query;
  try {
    if (minPrice && maxPrice && parseInt(minPrice) > parseInt(maxPrice))
      return next(
        new ApiError(
          "Harga minimum tidak boleh lebih besar dari harga maksimum",
          400
        )
      );

    let filterCondition = {};

    if (name) {
      filterCondition.name = {
        [Op.iLike]: `%${name}%`,
      };
    }

    if (model) {
      filterCondition.model = {
        [Op.iLike]: `%${model}%`,
      };
    }

    if (maxPrice && minPrice) {
      filterCondition.price = {
        [Op.between]: [minPrice, maxPrice],
      };
    } else if (maxPrice) {
      filterCondition.price = {
        [Op.lte]: maxPrice,
      };
    } else if (minPrice) {
      filterCondition.price = {
        [Op.gte]: minPrice,
      };
    }

    const cars = await Car.findAll({ where: filterCondition });

    if (!cars) {
      next(new ApiError("Data tidak ditemukan", 404));
    }

    res.status(200).json({
      status: "Success",
      data: {
        cars,
      },
    });
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};

module.exports = {
  createCar,
  findCars,
  findCarById,
  updateCar,
  deleteCar,
  availableCars,
};
