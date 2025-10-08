import express from "express";
import { productController } from "../controllers/productControllers.js";
const Router = express.Router();

Router.get("/", productController.getAllProducts);

export const productsApi = Router;
