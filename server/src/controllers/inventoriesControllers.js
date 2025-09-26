import pool from "../config/db.js";

const getAllInventories = async (req, res) => {
  try {
    const results = await pool.query(`
        SELECT i.id, p.name AS product_name, p.sku,  b.name AS branch_name, i.quantity 
        FROM inventories i
        JOIN products p ON i.product_id = p.id
        JOIN branches b ON i.branch_id = b.id
        ORDER BY i.id ASC
        `);
    res.json(results.rows);
  } catch (error) {
    console.error(err.message);
    res.status(500).send({ message: "Server Error", error: err.message });
  }
};
export const inventoriesController = {
  getAllInventories,
};
