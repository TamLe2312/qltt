import express from "express";
import { categoryController } from "../controllers/categoryControllers.js";
import { upload } from "../middlewares/multerConfig.js";
const Router = express.Router();

Router.get("/", categoryController.getAllCategories);
Router.post("/create", upload.none(), categoryController.createCategory);
Router.put("/update/:id", upload.none(), categoryController.updateCategory);
Router.delete("/delete/:id", categoryController.deleteCategory);

export const categoriesApi = Router;
