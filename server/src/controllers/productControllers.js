import pool from "../config/db.js";
import handlePgError from "../middlewares/handlePgError.js";

const getAllProducts = async (req, res) => {
  try {
    const { limit, page } = req.query;
    const offset = page && limit ? (page - 1) * limit : 0;
    const result = await pool.query(
      `SELECT * 
      FROM products
      ORDER BY id
      LIMIT $1 OFFSET $2`,
      [limit || 20, offset]
    );
    res.json(result.rows);
  } catch (err) {
    handlePgError(err, res);
  }
};

export const productController = {
  getAllProducts,
};
