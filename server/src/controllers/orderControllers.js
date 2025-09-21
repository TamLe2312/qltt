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
    const result = await pool.query("SELECT * FROM orders WHERE id = $1", [id]);
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
    const { customer_address_id, user_id, branch_id, note, products } =
      req.body;

    const result = await pool.query(
      `SELECT * FROM create_order($1, $2, $3, $4, $5)`,
      [customer_address_id, user_id, branch_id, note, JSON.stringify(products)]
    );

    res.status(201).json({ message: "Order created" });
    // console.log(req.body);
    // res.status(201).json(req.body);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      customer_address_id,
      customer_id,
      status,
      note,
      products,
      street,
      ward,
      district,
      city,
      country,
      zipcode,
    } = req.body;

    const result = await pool.query(
      `SELECT * FROM update_order($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        id,
        customer_address_id,
        customer_id,
        status,
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

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order updated" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
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
