import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { CONNECT_DB } from "./config/db.js";
import { APIs } from "./routes/index.js";
dotenv.config();

const START_SERVER = async () => {
  await CONNECT_DB();
  console.log("Connected to DB successfully");

  const app = express();
  app.use(cookieParser());
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static("public"));

  app.get("/", function (req, res) {
    res.send("Hello World!");
  });

  app.use("/api", APIs);

  app.listen(process.env.PORT, () => {
    console.log(`Server is running at ${process.env.HOST_URL}`);
  });
};

START_SERVER();
