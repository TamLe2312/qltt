import express from "express";
import { inventoriesController } from "../controllers/inventoriesControllers.js";
const Router = express.Router();

Router.get("/", inventoriesController.getAllInventories);
Router.post("/create", inventoriesController.createInventory);
Router.put("/update/:id", inventoriesController.updateInventory);
Router.delete("/delete/:id", inventoriesController.deleteInventory);

export const inventoriesApi = Router;
