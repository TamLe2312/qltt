import express from "express";
import { branchesApi } from "./branches.js";
import { ordersApi } from "./orders.js";
import { reportsApi } from "./reports.js";
import { inventoriesApi } from "./inventories.js";

const Router = express.Router();

Router.use("/branches", branchesApi);
Router.use("/orders", ordersApi);
Router.use("/reports", reportsApi);
Router.use("/inventories", inventoriesApi);

Router.get("/", (req, res) => {
  res.send("Hello from API!");
});

export const APIs = Router;
