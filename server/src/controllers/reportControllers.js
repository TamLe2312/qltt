import pool from "../config/db.js";
import handlePgError from "../middlewares/handlePgError.js";
import { getDateRangeFromPeriod } from "../helpers/getDateRangeFromPeriod.js";

const getSalesReport = async (req, res) => {
  try {
    const { period, branch_id, limit = 20, page = 1 } = req.query;

    const { startDate, endDate } = getDateRangeFromPeriod(period);
    if (!startDate) {
      return res.status(400).send({
        message:
          "Invalid period parameter. Use 'week', 'month', 'quarter', or 'year'.",
      });
    }

    let params = [startDate, endDate];
    let sql = `
            SELECT 
                u.id,
                u.full_name,
                u.username,
                SUM(o.total_amount) AS total_revenue,
                COUNT(o.id) AS total_orders
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.created_at BETWEEN $1 AND $2 
        `;

    if (branch_id) {
      params.push(branch_id);
      sql += ` AND o.branch_id = $${params.length}`;
    }

    sql += `
            GROUP BY u.id, u.full_name, u.username
            ORDER BY total_revenue DESC
        `;

    const offset = (page - 1) * limit;
    params.push(limit);
    sql += ` LIMIT $${params.length}`;
    params.push(offset);
    sql += ` OFFSET $${params.length}`;

    // console.log("Executing SQL:", sql);
    // console.log("With parameters:", params);
    const result = await pool.query(sql, params);

    res.json(result.rows);
  } catch (err) {
    handlePgError(err, res);
  }
};

export const reportController = {
  getSalesReport,
};
