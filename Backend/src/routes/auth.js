const express = require("express");
const { authController } = require("../controllers/authControllers");
const { upload } = require("../middlewares/multerConfig");
const Router = express.Router();

Router.post("/login", upload.none(), authController.login);
Router.post("/register", upload.none(), authController.register);
Router.post("/logout", upload.none(), authController.logout);

module.exports = { authApi: Router };
