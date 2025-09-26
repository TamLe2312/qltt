import pool from "../config/db.js";

const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, limit, page } = req.query;
    const offset = page && limit ? (page - 1) * limit : 0;
    const result = await pool.query(
      `SELECT 
          u.id,
          u.customer_code,
          u.full_name,
          u.username,
          SUM(o.total_amount) AS total_revenue,
          COUNT(o.id) AS total_orders
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.created_at BETWEEN $1 AND $2
       GROUP BY u.id, u.customer_code, u.full_name, u.username
       ORDER BY total_revenue DESC
       LIMIT $3 OFFSET $4`,
      [startDate, endDate, limit || 20, offset]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ message: "Server Error", error: err.message });
  }
};

export const reportController = {
  getSalesReport,
};
