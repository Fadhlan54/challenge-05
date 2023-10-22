const router = require("express").Router();

const User = require("../controllers/userContoller");

const autentikasi = require("../middlewares/authenticate");
const checkRole = require("../middlewares/checkRole");

router.post(
  "/create-admin",
  autentikasi,
  checkRole("Superadmin"),
  User.createAdmin
);
router.get("/", autentikasi, checkRole("Superadmin"), User.findUsers);
router.get("/:id", autentikasi, checkRole("Superadmin"), User.findUserById);
router.patch(
  "/edit/:id",
  autentikasi,
  checkRole("Superadmin"),
  User.UpdateUser
);
router.patch("/edit", autentikasi, User.UpdateUser);
router.delete(
  "/delete/:id",
  autentikasi,
  checkRole("Superadmin"),
  User.deleteUser
);

module.exports = router;
