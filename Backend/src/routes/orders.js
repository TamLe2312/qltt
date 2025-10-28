const express = require("express");
const { orderController } = require("../controllers/orderControllers.js");
const { upload } = require("../middlewares/multerConfig.js");
const authenticateToken = require("../middlewares/authenticateToken.js");
const authorizeRole = require("../middlewares/authorizeRole.js");

const Router = express.Router();

Router.get(
  "/",
  authenticateToken,
  authorizeRole(["Admin", "Employee"]),
  orderController.getAllOrders
);
Router.get(
  "/:id",
  authenticateToken,
  authorizeRole(["Admin"]),
  orderController.getOrderById
);
Router.get(
  "/:id/products",
  authenticateToken,
  authorizeRole(["Admin"]),
  orderController.getOrderProducts
);
Router.post(
  "/create",
  authenticateToken,
  authorizeRole(["Admin", "Employee"]),
  upload.none(),
  orderController.createOrder
);
Router.put(
  "/:id",
  authenticateToken,
  authorizeRole(["Admin", "Employee"]),
  upload.none(),
  orderController.updateOrder
);

Router.put(
  "/:id/status",
  authenticateToken,
  authorizeRole(["Admin", "Employee"]),
  orderController.changeOrderStatus
);

Router.delete(
  "/delete/:id",
  authenticateToken,
  authorizeRole(["Admin"]),
  orderController.deleteOrder
);
Router.post(
  "/statistics",
  authenticateToken,
  authorizeRole(["Admin"]),
  orderController.getOrdersStatistics
);

module.exports = { ordersApi: Router };
