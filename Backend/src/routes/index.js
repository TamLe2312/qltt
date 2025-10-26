const express = require("express");
const { branchesApi } = require("./branches.js");
const { ordersApi } = require("./orders.js");
const { reportsApi } = require("./reports.js");
const { inventoriesApi } = require("./inventories.js");
const { suppliersApi } = require("./suppliers.js");
const { categoriesApi } = require("./categories.js");
const { productsApi } = require("./products.js");
const { usersApi } = require("./users.js");
const { addressesApi } = require("./addresses.js");
const { authApi } = require("./auth.js");

const Router = express.Router();

Router.use("/branches", branchesApi);
Router.use("/orders", ordersApi);
Router.use("/reports", reportsApi);
Router.use("/inventories", inventoriesApi);
Router.use("/suppliers", suppliersApi);
Router.use("/categories", categoriesApi);
Router.use("/products", productsApi);
Router.use("/users", usersApi);
Router.use("/auth", authApi);
Router.use("/addresses", addressesApi);

Router.get("/", (req, res) => {
  res.send("Hello from API!");
});

module.exports = { APIs: Router };
