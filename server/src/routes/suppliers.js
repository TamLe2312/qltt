import express from "express";
import { upload } from "../middlewares/multerConfig.js";
import { supplierController } from "../controllers/supplierControllers.js";
const Router = express.Router();

Router.get("/", supplierController.getAllSuppliers);
Router.post("/create", upload.none(), supplierController.createSupplier);
Router.put("/update/:id", upload.none(), supplierController.updateSupplier);
Router.delete("/delete/:id", supplierController.deleteSupplier);

export const suppliersApi = Router;
