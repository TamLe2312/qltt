const express = require("express");
const { branchController } = require("../controllers/branchControllers.js");
const { upload } = require("../middlewares/multerConfig.js");
const Router = express.Router();

Router.get("/", branchController.getAllBranches);
Router.post("/create", upload.none(), branchController.createBranch);
Router.put("/update/:id", upload.none(), branchController.updateBranch);
Router.delete("/delete/:id", branchController.deleteBranch);

module.exports = { branchesApi: Router };
