const express = require("express");
const { reportController } = require("../controllers/reportControllers.js");
const Router = express.Router();

Router.get("/", reportController.getSalesReport);

module.exports = { reportsApi: Router };
