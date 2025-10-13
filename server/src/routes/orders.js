import express from "express";
import { orderController } from "../controllers/orderControllers.js";
import { upload } from "../middlewares/multerConfig.js";

const Router = express.Router();

Router.get("/", orderController.getAllOrders);
Router.get("/:id", orderController.getOrderById);
Router.post("/create", upload.none(), orderController.createOrder);
Router.put("/update/:id", upload.none(), orderController.updateOrder);
Router.delete("/delete/:id", orderController.deleteOrder);

export const ordersApi = Router;
