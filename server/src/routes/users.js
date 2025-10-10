import express from "express";
import { userController } from "../controllers/userControllers.js";
import { upload } from "../middlewares/multerConfig.js";
const Router = express.Router();

Router.get("/", userController.getAllUsers);
Router.get("/:id", userController.getUserById);
Router.post("/create", upload.none(), userController.createUser);
Router.put("/update/:id", upload.none(), userController.updateUser);
Router.delete("/delete/:id", userController.deleteUser);

export const usersApi = Router;
