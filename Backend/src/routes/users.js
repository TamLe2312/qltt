const express = require("express");
const { userController } = require("../controllers/userControllers.js");
const { upload } = require("../middlewares/multerConfig.js");
const authorizeRole = require("../middlewares/authorizeRole.js");
const authenticateToken = require("../middlewares/authenticateToken.js");
const Router = express.Router();

Router.get(
  "/",
  authenticateToken,
  authorizeRole(["Admin", "Employee"]),
  userController.getAllUsers
);
Router.get(
  "/roles",
  authenticateToken,
  authorizeRole(["Admin", "Employee"]),
  userController.getRoles
);
Router.get(
  "/:id",
  authenticateToken,
  authorizeRole(["Admin", "Employee"]),
  userController.getUserById
);
Router.get(
  "/details/:id",
  authenticateToken,
  authorizeRole(["Admin", "Employee"]),
  userController.userDetails
);
Router.post(
  "/create",
  authenticateToken,
  authorizeRole(["Admin", "Employee"]),
  upload.none(),
  userController.createUser
);
Router.put(
  "/update/:id",
  authenticateToken,
  authorizeRole(["Admin", "Employee"]),
  upload.none(),
  userController.updateUser
);
Router.delete(
  "/delete/:id",
  authenticateToken,
  authorizeRole(["Admin"]),
  userController.deleteUser
);

module.exports = { usersApi: Router };
