const express = require("express");
const { branchController } = require("../controllers/branchControllers.js");
const { upload } = require("../middlewares/multerConfig.js");
const Router = express.Router();

Router.get("/", branchController.getAllBranches);
Router.get("/:id/products", branchController.getAllProductsByBranch);
Router.put("/update/:id", upload.none(), branchController.updateBranch);

module.exports = { branchesApi: Router };
