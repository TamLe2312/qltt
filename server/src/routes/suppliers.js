import express from "express";
import { supplierController } from "../controllers/supplierControllers.js";
const Router = express.Router();

Router.get("/", supplierController.getAllSuppliers);
Router.post("/create", supplierController.createSupplier);
Router.put("/update/:id", supplierController.updateSupplier);
Router.delete("/delete/:id", supplierController.deleteSupplier);

export const suppliersApi = Router;
