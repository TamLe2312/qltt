import express from "express";
import { branchController } from "../controllers/branchControllers.js";
import { upload } from "../middlewares/multerConfig.js";
const Router = express.Router();

Router.get("/", branchController.getAllBranches);
Router.post("/create", upload.none(), branchController.createBranch);
Router.put("/update/:id", upload.none(), branchController.updateBranch);
Router.delete("/delete/:id", branchController.deleteBranch);

export const branchesApi = Router;
