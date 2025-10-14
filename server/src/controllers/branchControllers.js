const { pool } = require("../config/db.js");
const handlePgError = require("../middlewares/handlePgError.js");

const getAllBranches = async (req, res) => {
  try {
    const { limit, page, sortBy, sortOrder } = req.query;
    const offset = page && limit ? (page - 1) * limit : 0;
    const results = await pool.query(
      `SELECT * 
      FROM branches
      ORDER BY ${sortBy || "id"} ${sortOrder === "desc" ? "DESC" : "ASC"}
      LIMIT $1 OFFSET $2`,
      [limit || 20, offset]
    );
    const countResult = await pool.query("SELECT COUNT(*) FROM branches;");
    res.json({ data: results.rows, total: countResult.rows[0].count });
  } catch (err) {
    handlePgError(err, res);
  }
};

const createBranch = async (req, res) => {
  try {
    const {
      name,
      street,
      ward,
      district,
      city,
      country,
      zipcode,
      email,
      phone,
    } = req.body;
    await pool.query(
      `INSERT INTO branches (name, street, ward, district, city, country, zipcode, email, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [name, street, ward, district, city, country, zipcode, email, phone]
    );
    res.status(201).json({ message: "Branch created" });
  } catch (err) {
    handlePgError(err, res);
  }
};

const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      street,
      ward,
      district,
      city,
      country,
      zipcode,
      email,
      phone,
    } = req.body;
    const result = await pool.query(
      `UPDATE branches
        SET name = $1, street = $2, ward = $3, district = $4, city = $5, country = $6, zipcode = $7, email = $8, phone = $9
        WHERE id = $10
        RETURNING *`,
      [name, street, ward, district, city, country, zipcode, email, phone, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Branch not found" });
    }
    res.json({ message: "Branch updated" });
  } catch (err) {
    handlePgError(err, res);
  }
};

const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM branches WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Branch not found" });
    }
    res.json({ message: "Branch deleted" });
  } catch (err) {
    handlePgError(err, res);
  }
};

module.exports = {
  branchController: {
    getAllBranches,
    createBranch,
    updateBranch,
    deleteBranch,
  },
};
