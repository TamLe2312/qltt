const express = require("express");
const {
  inventoriesController,
} = require("../controllers/inventoriesControllers.js");
const { upload } = require("../middlewares/multerConfig.js");

const Router = express.Router();

Router.get("/", inventoriesController.getAllInventories);
Router.post("/create", upload.none(), inventoriesController.createInventory);
Router.put("/update/:id", upload.none(), inventoriesController.updateInventory);
Router.delete("/delete/:id", inventoriesController.deleteInventory);

module.exports = { inventoriesApi: Router };
