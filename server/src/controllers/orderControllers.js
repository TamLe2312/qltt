import pool from "../config/db.js";

const getAllOrders = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM orders");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM orders WHERE order_id = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(result.rows[0]);
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
    const { notes, metadata, products } = req.body;
    const result = await pool.query(
      `SELECT * FROM update_order($1, $2, $3, $4)`,
      [id, notes, JSON.stringify(metadata), JSON.stringify(products)]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
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
      return res.status(404).json({ message: "Order not found" });
    }
    res.json({ message: "Order deleted", order: result.rows[0] });
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
  getOrderById,
};
