import pool from "../config/db.js";
import handlePgError from "../middlewares/handlePgError.js";

const getAllAddresses = async (req, res) => {
  try {
    const { limit, page } = req.query;
    const offset = page && limit ? (page - 1) * limit : 0;
    const result = await pool.query(
      `SELECT * 
      FROM customer_address
      ORDER BY id
      LIMIT $1 OFFSET $2`,
      [limit || 20, offset]
    );
    res.json(result.rows);
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
    const result = await pool.query(
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
    const result = await pool.query(
      `UPDATE customer_address
            SET street = $1, ward = $2, district = $3, city = $4, country = $5, zipcode = $6, user_id = $7, is_default = $8, updated_at = NOW()
            WHERE id = $9
            RETURNING *`,
      [street, ward, district, city, country, zipcode, user_id, is_default, id]
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

export const addressController = {
  getAllAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
};
