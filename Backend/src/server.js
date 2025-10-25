const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const { APIs } = require("./routes/index.js");
const { CONNECT_DB } = require("./config/db.js");

dotenv.config();

const START_SERVER = async () => {
  await CONNECT_DB();
  console.log("Connected to DB successfully");

  const app = express();
  app.use(cookieParser());
  app.use(cors());

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
