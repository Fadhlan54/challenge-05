const router = require("express").Router();

const Car = require("../controllers/carController");

const autentikasi = require("../middlewares/authenticate");
const checkRole = require("../middlewares/checkRole");
const upload = require("../middlewares/uploader");

router.post(
  "/",
  autentikasi,
  checkRole("Superadmin", "Admin"),
  upload.single("image"),
  Car.createCar
);

router.get("/", autentikasi, checkRole("Superadmin", "Admin"), Car.findCars);

router.patch(
  "/:id",
  autentikasi,
  checkRole("Superadmin", "Admin"),
  upload.single("image"),
  Car.updateCar
);

router.delete(
  "/:id",
  autentikasi,
  checkRole("Superadmin", "Admin"),
  Car.deleteCar
);

router.get("/available", autentikasi, Car.availableCars);

module.exports = router;
