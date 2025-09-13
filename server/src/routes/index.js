import express from "express";
import { branchesApi } from "./branches.js";

const Router = express.Router();

Router.use("/branches", branchesApi);

Router.get("/", (req, res) => {
  res.send("Hello from API!");
});

export const APIs = Router;
