const express = require("express");
const { orderController } = require("../controllers/orderControllers.js");
const { upload } = require("../middlewares/multerConfig.js");

const Router = express.Router();

Router.get("/", orderController.getAllOrders);
Router.get("/:id", orderController.getOrderById);
Router.get("/:id/products", orderController.getOrderProducts);
Router.post("/create", upload.none(), orderController.createOrder);
Router.put("/update/:id", upload.none(), orderController.updateOrder);
Router.delete("/delete/:id", orderController.deleteOrder);
Router.post("/statistics", orderController.getOrdersStatistics);

module.exports = { ordersApi: Router };
