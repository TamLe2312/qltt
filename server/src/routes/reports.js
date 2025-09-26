import express from "express";
import { reportController } from "../controllers/reportControllers.js";
const Router = express.Router();

Router.get("/", reportController.getSalesReport);

export const reportsApi = Router;
