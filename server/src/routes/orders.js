import express from "express";
import { orderController } from "../controllers/orderControllers.js";
const Router = express.Router();

Router.get("/", orderController.getAllOrders);
Router.post("/create", orderController.createOrder);
Router.put("/update/:id", orderController.updateOrder);
Router.delete("/delete/:id", orderController.deleteOrder);

export const ordersApi = Router;
