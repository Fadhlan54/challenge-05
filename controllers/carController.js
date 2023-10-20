const { Car } = require("../models");
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
      next(new ApiError("server gagal mengupload gambar", 500));

    return uploadedImage.url;
  } catch (err) {
    return err.message;
  }
};

const createCar = async (req, res, next) => {
  try {
    const { name, model, price } = req.body;
    const file = req.file;
    let imageUrl;

    if (file) {
      imageUrl = await uploadImage(file);
    }

    const newCar = await Car.create({
      name,
      price,
      model,
      createdBy: req.user.name,
      lastUpdatedBy: req.user.name,
      imageUrl,
    });

    if (!newCar) next(new ApiError("Gagal membuat data mobil baru", 500));

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

    if (!car) return new ApiError("id tidak ditemukan", 404);

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

    if (!checkCar) next(new ApiError("Id tidak ditemukan", 404));

    const { name, model, price } = req.body;
    const file = req.file;

    let imageUrl;

    if (file) {
      imageUrl = await uploadImage(file);
    }
    const updatedCar = await Car.update(
      {
        name,
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

    if (!car) next(new ApiError("Car id tersebut tidak ditemukan", 404));

    await Car.update(
      {
        deletedBy: req.user.id,
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
  const { name, model, maxPrice, minPrice, createdBy } = req.query;
  try {
    if (minPrice && maxPrice && parseInt(minPrice) > parseInt(maxPrice))
      next(
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

    if (createdBy) {
      filterCondition.createdBy = {
        [Op.iLike]: `%${createdBy}%`,
      };
    }

    const cars = await Car.findAll({ where: filterCondition });

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
