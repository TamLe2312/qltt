import express from "express";
import { inventoriesController } from "../controllers/inventoriesControllers.js";
const Router = express.Router();

Router.get("/", inventoriesController.getAllInventories);

export const inventoriesApi = Router;
