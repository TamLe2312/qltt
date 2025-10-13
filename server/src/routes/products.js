import express from "express";
import { productController } from "../controllers/productControllers.js";
import { uploadImage } from "../middlewares/multerConfig.js";
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

export const productsApi = Router;
