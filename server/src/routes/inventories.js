import express from "express";
import { inventoriesController } from "../controllers/inventoriesControllers.js";
import { upload } from "../middlewares/multerConfig.js";

const Router = express.Router();

Router.get("/", inventoriesController.getAllInventories);
Router.post("/create", upload.none(), inventoriesController.createInventory);
Router.put("/update/:id", upload.none(), inventoriesController.updateInventory);
Router.delete("/delete/:id", inventoriesController.deleteInventory);

export const inventoriesApi = Router;
