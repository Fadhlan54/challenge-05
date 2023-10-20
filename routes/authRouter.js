const router = require("express").Router();

const Auth = require("../controllers/authController");
const autentikasi = require("../middlewares/authenticate");

router.post("/register", Auth.register);
router.post("/login", Auth.login);
router.get("/checktoken", autentikasi, Auth.checkToken);

module.exports = router;
