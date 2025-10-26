const express = require("express");
const { categoryController } = require("../controllers/categoryControllers.js");
const { upload } = require("../middlewares/multerConfig.js");
const authenticateToken = require("../middlewares/authenticateToken.js");
const authorizeRole = require("../middlewares/authorizeRole.js");
const Router = express.Router();

Router.get(
  "/",
  authenticateToken,
  authorizeRole(["Admin", "Employee"]),
  categoryController.getAllCategories
);
Router.get(
  "/tree",
  authenticateToken,
  authorizeRole(["Admin", "Employee"]),
  categoryController.getAllCategoriesTree
);
Router.get(
  "/list",
  authenticateToken,
  authorizeRole(["Admin", "Employee"]),
  categoryController.getCategories
);
Router.post(
  "/create",
  authenticateToken,
  authorizeRole(["Admin", "Employee"]),
  upload.none(),
  categoryController.createCategory
);
Router.put(
  "/update/:id",
  authenticateToken,
  authorizeRole(["Admin", "Employee"]),
  upload.none(),
  categoryController.updateCategory
);
Router.delete(
  "/delete/:id",
  authenticateToken,
  authorizeRole(["Admin"]),
  categoryController.deleteCategory
);

module.exports = { categoriesApi: Router };
