const express = require("express");
const { branchController } = require("../controllers/branchControllers.js");
const { upload } = require("../middlewares/multerConfig.js");
const Router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken.js");
const authorizeRole = require("../middlewares/authorizeRole.js");

Router.get(
  "/",
  authenticateToken,
  authorizeRole(["Admin", "Employee"]),
  branchController.getAllBranches
);
Router.get(
  "/:id/products",
  authenticateToken,
  authorizeRole(["Admin", "Employee"]),
  branchController.getAllProductsByBranch
);
Router.put(
  "/update/:id",
  authenticateToken,
  authorizeRole(["Admin, Employee"]),
  upload.none(),
  branchController.updateBranch
);

module.exports = { branchesApi: Router };
