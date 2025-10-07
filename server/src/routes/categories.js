import express from "express";
import { categoryController } from "../controllers/categoryControllers.js";
const Router = express.Router();

Router.get("/", categoryController.getAllCategories);
Router.post("/create", categoryController.createCategory);
Router.put("/update/:id", categoryController.updateCategory);
Router.delete("/delete/:id", categoryController.deleteCategory);

export const categoriesApi = Router;
