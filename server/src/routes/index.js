import express from "express";
import { branchesApi } from "./branches.js";
import { ordersApi } from "./orders.js";

const Router = express.Router();

Router.use("/branches", branchesApi);
Router.use("/orders", ordersApi);

Router.get("/", (req, res) => {
  res.send("Hello from API!");
});

export const APIs = Router;
