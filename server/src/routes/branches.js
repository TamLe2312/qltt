import express from "express";
import { branchController } from "../controllers/branchControllers.js";
const Router = express.Router();

Router.get("/", branchController.getAllBranches);

export const branchesApi = Router;
