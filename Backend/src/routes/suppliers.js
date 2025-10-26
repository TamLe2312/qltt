const express = require("express");
const { upload } = require("../middlewares/multerConfig.js");
const { supplierController } = require("../controllers/supplierControllers.js");
const authenticateToken = require("../middlewares/authenticateToken.js");
const authorizeRole = require("../middlewares/authorizeRole.js");
const Router = express.Router();

Router.get(
  "/",
  authenticateToken,
  authorizeRole(["Admin", "Employee"]),
  supplierController.getAllSuppliers
);
Router.post(
  "/create",
  authenticateToken,
  authorizeRole(["Admin", "Employee"]),
  upload.none(),
  supplierController.createSupplier
);
Router.put(
  "/update/:id",
  authenticateToken,
  authorizeRole(["Admin", "Employee"]),
  upload.none(),
  supplierController.updateSupplier
);
Router.delete(
  "/delete/:id",
  authenticateToken,
  authorizeRole(["Admin"]),
  supplierController.deleteSupplier
);

module.exports = { suppliersApi: Router };
