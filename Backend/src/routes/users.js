const express = require("express");
const { userController } = require("../controllers/userControllers.js");
const { upload } = require("../middlewares/multerConfig.js");
const Router = express.Router();

Router.get("/", userController.getAllUsers);
Router.get("/roles", userController.getRoles);
Router.get("/:id", userController.getUserById);
Router.get("/details/:id", userController.userDetails);
Router.post("/create", upload.none(), userController.createUser);
Router.put("/update/:id", upload.none(), userController.updateUser);
Router.delete("/delete/:id", userController.deleteUser);

module.exports = { usersApi: Router };
