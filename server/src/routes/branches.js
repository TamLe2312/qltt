import express from "express";
import { branchController } from "../controllers/branchControllers.js";
const Router = express.Router();

Router.get("/", branchController.getAllBranches);
Router.post("/create", branchController.createBranch);
Router.put("/update/:id", branchController.updateBranch);
Router.delete("/delete/:id", branchController.deleteBranch);

export const branchesApi = Router;
