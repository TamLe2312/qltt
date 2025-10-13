const pool = require("../config/db.js");
const handlePgError = require("../middlewares/handlePgError.js");

const getAllSuppliers = async (req, res) => {
  try {
    const { limit, page } = req.query;
    const offset = page && limit ? (page - 1) * limit : 0;
    const result = await pool.query(
      `SELECT * 
      FROM suppliers
      ORDER BY id
      LIMIT $1 OFFSET $2`,
      [limit || 20, offset]
    );
    res.json(result.rows);
  } catch (err) {
    handlePgError(err, res);
  }
};

const createSupplier = async (req, res) => {
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
      `INSERT INTO suppliers (name, street, ward, district, city, country, zipcode, email, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [name, street, ward, district, city, country, zipcode, email, phone]
    );
    res.status(201).json({ message: "Supplier created" });
  } catch (err) {
    handlePgError(err, res);
  }
};

const updateSupplier = async (req, res) => {
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
      `UPDATE suppliers
        SET name = $1, street = $2, ward = $3, district = $4, city = $5, country = $6, zipcode = $7, email = $8, phone = $9
        WHERE id = $10
        RETURNING *`,
      [name, street, ward, district, city, country, zipcode, email, phone, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.json({ message: "Supplier updated" });
  } catch (err) {
    handlePgError(err, res);
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM suppliers WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.json({ message: "Supplier deleted" });
  } catch (err) {
    handlePgError(err, res);
  }
};

module.exports = {
  supplierController: {
    getAllSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  },
};
