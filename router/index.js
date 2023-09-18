const { Router } = require("express");

const authMiddleware = require("../modules/auth-middleware");
const auth = require("./auth");
const user = require("./user");
const users = require("./users");
const inscription = require("./inscription");
const modifUser = require("./user");
const delUser = require("./user");

const router = Router();
router.use("/auth", auth);
router.use("/user", authMiddleware, user);
router.use("/users", users);
router.use("/inscription", inscription);
router.use("/user/modifUser", modifUser);
router.use("/user/delUser", delUser);
module.exports = router;
