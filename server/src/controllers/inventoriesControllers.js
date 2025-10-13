const { pool } = require("../config/db.js");
const handlePgError = require("../middlewares/handlePgError.js");

const getAllInventories = async (req, res) => {
  try {
    const { limit, page, sortBy, sortOrder } = req.query;
    const offset = page && limit ? (page - 1) * limit : 0;
    const results = await pool.query(
      `
        SELECT i.id, p.id AS product_id, p.name AS product_name, p.sku, s.id AS supplier_id, s.name AS supplier_name, i.quantity, i.reserved_stock, b.id AS branch_id, b.name AS branch_name
        FROM inventories i
        JOIN products p ON i.product_id = p.id
        JOIN suppliers s ON i.supplier_id = s.id
        JOIN branches b ON i.branch_id = b.id
        ORDER BY ${sortBy || "i.id"} ${sortOrder === "desc" ? "DESC" : "ASC"}
        LIMIT $1 OFFSET $2
        `,
      [limit || 20, offset]
    );
    const countResult = await pool.query("SELECT COUNT(*) FROM inventories;");
    res.json({ data: results.rows, total: countResult.rows[0].count });
  } catch (error) {
    handlePgError(error, res);
  }
};

const createInventory = async (req, res) => {
  try {
    const { product_id, supplier_id, branch_id, quantity } = req.body;

    await pool.query(
      "INSERT INTO inventories (product_id, supplier_id, branch_id, quantity) VALUES ($1, $2, $3, $4) RETURNING *",
      [product_id, supplier_id, branch_id, quantity]
    );
    res.status(201).json({ message: "Branch created" });
  } catch (err) {
    handlePgError(err, res);
  }
};

const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { product_id, supplier_id, quantity } = req.body;
    const result = await pool.query(
      `UPDATE inventories 
       SET product_id = $1, supplier_id = $2, quantity = $3
        WHERE id = $4 RETURNING *`,
      [product_id, supplier_id, quantity, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Inventory not found" });
    }
    res.json({ message: "Inventory updated" });
  } catch (err) {
    handlePgError(err, res);
  }
};

const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM inventories WHERE id = $1", [
      id,
    ]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Inventory not found" });
    }
    res.json({ message: "Inventory deleted" });
  } catch (err) {
    handlePgError(err, res);
  }
};

module.exports = {
  inventoriesController: {
    getAllInventories,
    createInventory,
    updateInventory,
    deleteInventory,
  },
};
