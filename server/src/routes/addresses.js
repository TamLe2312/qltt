import express from "express";
import { upload } from "../middlewares/multerConfig.js";
import { addressController } from "../controllers/addressController.js";
const Router = express.Router();

Router.get("/", addressController.getAllAddresses);
Router.post("/create", upload.none(), addressController.createAddress);
Router.put("/update/:id", upload.none(), addressController.updateAddress);
Router.delete("/delete/:id", addressController.deleteAddress);

export const addressesApi = Router;
