import pool from "../config/db.js";
import handlePgError from "../middlewares/handlePgError.js";

const getAllOrders = async (req, res) => {
  try {
    const { limit, page } = req.query;
    const offset = page ? (page - 1) * (limit || 20) : 0;
    const result = await pool.query(
      "SELECT * FROM orders ORDER BY id LIMIT $1 OFFSET $2",
      [limit || 20, offset]
    );
    res.json(result.rows);
  } catch (err) {
    handlePgError(err, res);
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM orders WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    handlePgError(err, res);
  }
};

const createOrder = async (req, res) => {
  try {
    const {
      user_id,
      branch_id,
      note,
      products,
      street,
      ward,
      district,
      city,
      country,
      zipcode,
    } = req.body;

    await pool.query(
      `SELECT * FROM create_order($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        user_id,
        branch_id,
        note,
        JSON.stringify(products),
        street,
        ward,
        district,
        city,
        country,
        zipcode,
      ]
    );

    res.status(201).json({ message: "Order created" });
  } catch (err) {
    handlePgError(err, res);
  }
};

const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, street, ward, district, city, country, zipcode } =
      req.body;

    const result = await pool.query(
      `SELECT * FROM update_order($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [id, status, note, street, ward, district, city, country, zipcode]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order updated" });
  } catch (err) {
    handlePgError(err, res);
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM orders WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json({ message: "Order deleted" });
  } catch (err) {
    handlePgError(err, res);
  }
};

export const orderController = {
  getAllOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderById,
};
