import pool from "../config/db.js";
import { formatMoneyType } from "../helpers/formatMoneyType.js";

const getAllOrders = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM orders");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

const createOrder = async (req, res) => {
  try {
    const { customer_id, branch_id, notes, metadata, products } = req.body;

    const result = await pool.query(
      `SELECT * FROM create_order($1, $2, $3, $4, $5)`,
      [
        customer_id,
        branch_id,
        notes,
        JSON.stringify(metadata),
        JSON.stringify(products),
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { customer_id, branch_id, notes, metadata } = req.body;
    const result = await pool.query(
      "UPDATE orders SET customer_id = $1, branch_id = $2, notes = $3, metadata = $4 WHERE order_id = $5 RETURNING *",
      [customer_id, branch_id, notes, metadata, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: "Order not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM orders WHERE order_id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: "Order not found" });
    }
    res.json({ msg: "Order deleted", order: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

export const orderController = {
  getAllOrders,
  createOrder,
  updateOrder,
  deleteOrder,
};
