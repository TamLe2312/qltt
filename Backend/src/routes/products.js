const express = require("express");
const { productController } = require("../controllers/productControllers.js");
const { uploadImage } = require("../middlewares/multerConfig.js");
const authenticateToken = require("../middlewares/authenticateToken.js");
const authorizeRole = require("../middlewares/authorizeRole.js");
const Router = express.Router();

Router.get(
  "/",
  authenticateToken,
  authorizeRole(["Admin", "Employee"]),
  productController.getAllProducts
);
Router.post(
  "/create",
  authenticateToken,
  authorizeRole(["Admin", "Employee"]),
  uploadImage.fields([
    { name: "avatar", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  productController.createProduct
);
Router.put(
  "/update/:id",
  authenticateToken,
  authorizeRole(["Admin", "Employee"]),
  uploadImage.fields([
    { name: "avatar", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  productController.updateProduct
);
Router.delete(
  "/delete/:id",
  authenticateToken,
  authorizeRole(["Admin"]),
  productController.deleteProduct
);

module.exports = { productsApi: Router };
