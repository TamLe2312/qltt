const express = require("express");
const { productController } = require("../controllers/productControllers.js");
const { uploadImage } = require("../middlewares/multerConfig.js");
const Router = express.Router();

Router.get("/", productController.getAllProducts);
Router.post(
  "/create",
  uploadImage.fields([
    { name: "avatar", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  productController.createProduct
);
Router.put(
  "/update/:id",
  uploadImage.fields([
    { name: "avatar", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  productController.updateProduct
);
Router.delete("/delete/:id", productController.deleteProduct);

module.exports = { productsApi: Router };
