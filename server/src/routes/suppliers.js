const express = require("express");
const { upload } = require("../middlewares/multerConfig.js");
const { supplierController } = require("../controllers/supplierControllers.js");
const Router = express.Router();

Router.get("/", supplierController.getAllSuppliers);
Router.post("/create", upload.none(), supplierController.createSupplier);
Router.put("/update/:id", upload.none(), supplierController.updateSupplier);
Router.delete("/delete/:id", supplierController.deleteSupplier);

module.exports = { suppliersApi: Router };
