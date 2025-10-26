const express = require("express");
const {
  inventoriesController,
} = require("../controllers/inventoriesControllers.js");
const { upload } = require("../middlewares/multerConfig.js");
const authenticateToken = require("../middlewares/authenticateToken.js");
const authorizeRole = require("../middlewares/authorizeRole.js");

const Router = express.Router();

Router.get(
  "/",
  authenticateToken,
  authorizeRole(["Admin", "Employee"]),
  inventoriesController.getAllInventories
);
Router.post(
  "/create",
  authenticateToken,
  authorizeRole(["Admin", "Employee"]),
  upload.none(),
  inventoriesController.createInventory
);
Router.put(
  "/update/:id",
  authenticateToken,
  authorizeRole(["Admin", "Employee"]),
  upload.none(),
  inventoriesController.updateInventory
);
Router.delete(
  "/delete/:id",
  authenticateToken,
  authorizeRole(["Admin"]),
  inventoriesController.deleteInventory
);

module.exports = { inventoriesApi: Router };
