const express = require("express");
const { categoryController } = require("../controllers/categoryControllers.js");
const { upload } = require("../middlewares/multerConfig.js");
const Router = express.Router();

Router.get("/", categoryController.getAllCategories);
Router.get("/list", categoryController.getCategories);
Router.post("/create", upload.none(), categoryController.createCategory);
Router.put("/update/:id", upload.none(), categoryController.updateCategory);
Router.delete("/delete/:id", categoryController.deleteCategory);

module.exports = { categoriesApi: Router };
