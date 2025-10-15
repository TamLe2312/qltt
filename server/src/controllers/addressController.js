const { pool } = require("../config/db.js");
const handlePgError = require("../middlewares/handlePgError.js");

const getAllAddresses = async (req, res) => {
  try {
    const { limit, page, sortBy, sortOrder } = req.query;
    const result = await pool.query(
      `SELECT ca.id, ca.is_default, u.id AS user_id, u.full_name, u.username, ca.street, ca.ward, ca.district, ca.city, ca.country, ca.zipcode
      FROM customer_address ca
      JOIN users u ON ca.user_id = u.id
      ORDER BY ${sortBy || "ca.id"} ${sortOrder === "desc" ? "DESC" : "ASC"}
      LIMIT $1 OFFSET $2`,
      [limit || 20, (page - 1) * limit || 0]
    );
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM customer_address;"
    );
    res.json({ data: result.rows, total: countResult.rows[0].count });
  } catch (err) {
    handlePgError(err, res);
  }
};

const createAddress = async (req, res) => {
  try {
    const {
      street,
      ward,
      district,
      city,
      country,
      zipcode,
      user_id,
      is_default,
    } = req.body;
    await pool.query(
      `INSERT INTO customer_address (street, ward, district, city, country, zipcode, user_id, is_default)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`,
      [street, ward, district, city, country, zipcode, user_id, is_default]
    );
    res.status(201).json({ message: "Address created" });
  } catch (err) {
    handlePgError(err, res);
  }
};

const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { street, ward, district, city, country, zipcode, is_default } =
      req.body;
    const result = await pool.query(
      `UPDATE customer_address
            SET street = $1, ward = $2, district = $3, city = $4, country = $5, zipcode = $6, is_default = $7, updated_at = NOW()
            WHERE id = $8
            RETURNING *`,
      [street, ward, district, city, country, zipcode, is_default, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Address not found" });
    }
    res.json({ message: "Address updated" });
  } catch (err) {
    handlePgError(err, res);
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `DELETE FROM customer_address WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Address not found" });
    }
    res.json({ message: "Address deleted" });
  } catch (err) {
    handlePgError(err, res);
  }
};

module.exports = {
  addressController: {
    getAllAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
  },
};
