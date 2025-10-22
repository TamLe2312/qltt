const pkg = require("pg");
const { Pool } = pkg;
const dotenv = require("dotenv");
dotenv.config();

const pool = new Pool({
  user: process.env.USER_DB,
  host: "localhost",
  database: process.env.NAME_DB,
  password: process.env.PASSWORD_DB,
  port: process.env.PORT_DB,
});

const CONNECT_DB = async () => {
  try {
    const client = await pool.connect();
    console.log("Database connected successfully");
    client.release();
  } catch (err) {
    console.error("Database connection error", err.message);
    process.exit(1);
  }
};

module.exports = {
  CONNECT_DB,
  pool,
};
