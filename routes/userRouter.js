const router = require("express").Router();

const User = require("../controllers/userContoller");

const autentikasi = require("../middlewares/authenticate");
const checkRole = require("../middlewares/checkRole");

router.post("/", autentikasi, checkRole("Superadmin"), User.createAdmin);
router.get("/", autentikasi, User.findUsers);
router.get("/:id", autentikasi, User.findUserById);
router.patch("/:id", autentikasi, User.UpdateUser);
router.delete("/:id", autentikasi, checkRole("Superadmin"), User.deleteUser);

module.exports = router;
