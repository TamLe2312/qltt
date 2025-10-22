const express = require("express");
const { upload } = require("../middlewares/multerConfig.js");
const { addressController } = require("../controllers/addressController.js");
const Router = express.Router();

Router.get("/", addressController.getAllAddresses);
Router.post("/create", upload.none(), addressController.createAddress);
Router.put("/update/:id", upload.none(), addressController.updateAddress);
Router.delete("/delete/:id", addressController.deleteAddress);

module.exports = { addressesApi: Router };
