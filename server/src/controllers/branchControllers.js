import pool from "../config/db.js";

const getAllBranches = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM branches");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

export const branchController = {
  getAllBranches,
};
