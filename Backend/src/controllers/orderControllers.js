const { pool } = require("../config/db.js");
const handlePgError = require("../middlewares/handlePgError.js");


// ============================================================
// Controller: getAllOrders
// Lọc theo chi nhánh + trạng thái + tìm kiếm
// ============================================================
// ============================
// FILE: ordersController.js
// ============================
const getAllOrders = async (req, res) => {
  try {
    let {
      page = 1,
      page_size: limit = 20,
      sort_field: sortField = 'created_at',
      sort_order: sortOrder = 'desc',
      search = '',
      status = '',
      branch_id = '',
      user_id = '', // ✅ thêm user_id
    } = req.query;

    limit = parseInt(limit, 10);
    page = parseInt(page, 10);
    const offset = (page - 1) * limit;

    const allowedSortFields = ['id', 'order_code', 'status', 'total_amount', 'created_at', 'updated_at'];
    if (!allowedSortFields.includes(sortField)) sortField = 'created_at';
    sortOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const filters = ['orders.deleted_at IS NULL'];
    const params = [];
    let paramIndex = 1;

    // Tìm kiếm
    if (search) {
      filters.push(`
        (
          unaccent(orders.order_code) ILIKE unaccent($${paramIndex})
          OR unaccent(users.full_name) ILIKE unaccent($${paramIndex})
          OR unaccent(branches.name) ILIKE unaccent($${paramIndex})
        )
      `);
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Lọc theo trạng thái
    if (status) {
      filters.push(`orders.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    // Lọc theo chi nhánh
    if (branch_id) {
      const branchIdNum = parseInt(branch_id, 10);
      if (!isNaN(branchIdNum)) {
        filters.push(`orders.branch_id = $${paramIndex}`);
        params.push(branchIdNum);
        paramIndex++;
      }
    }

    // ✅ Lọc theo user
    if (user_id) {
      const userIdNum = parseInt(user_id, 10);
      if (!isNaN(userIdNum)) {
        filters.push(`orders.user_id = $${paramIndex}`);
        params.push(userIdNum);
        paramIndex++;
      }
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const query = `
      SELECT 
        orders.*,
        users.full_name AS user_name,
        branches.name AS branch_name
      FROM orders
      LEFT JOIN users ON orders.user_id = users.id
      LEFT JOIN branches ON orders.branch_id = branches.id
      ${whereClause}
      ORDER BY orders.${sortField} ${sortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    const result = await pool.query(query, [...params, limit, offset]);

    const totalQuery = `
      SELECT COUNT(*) AS total
      FROM orders
      LEFT JOIN users ON orders.user_id = users.id
      LEFT JOIN branches ON orders.branch_id = branches.id
      ${whereClause}
    `;
    const totalResult = await pool.query(totalQuery, params);

    const total = parseInt(totalResult.rows[0].total, 10);
    const totalPages = Math.ceil(total / limit);

    res.json({
      data: {
        items: result.rows,
        pagination: { total, page, perPage: limit, totalPages },
        sort: { field: sortField, order: sortOrder },
      },
      status: 'success',
      message: 'Fetched successfully',
    });
  } catch (err) {
    console.error('Error fetching orders:', err);
    handlePgError(err, res);
  }
};



const getOrdersStatistics = async (req, res) => {
  try {
    let { filters = {}, groupBy = 'month' } = req.body;

    // ✅ Kiểm tra groupBy hợp lệ
    const validGroups = ['day', 'month', 'year'];
    if (!validGroups.includes(groupBy)) {
      return res.status(400).json({
        status: "error",
        message: 'groupBy must be one of: day, month, year'
      });
    }

    // ✅ Chuẩn hoá filters
    if (typeof filters !== 'object') {
      try {
        filters = JSON.parse(filters);
      } catch {
        return res.status(400).json({
          status: "error",
          message: "filters must be a valid JSON object"
        });
      }
    }

    // ✅ Nếu status là chuỗi thì ép thành mảng
    if (filters.status && typeof filters.status === 'string') {
      filters.status = [filters.status];
    }

    // ✅ Loại bỏ field null hoặc rỗng
    Object.keys(filters).forEach((key) => {
      const v = filters[key];
      if (
        v === null ||
        v === undefined ||
        (Array.isArray(v) && v.length === 0) ||
        v === ''
      ) {
        delete filters[key];
      }
    });

    // ✅ Log SQL trước khi thực thi
    const sql = `SELECT * FROM get_orders_statistics($1::jsonb, $2::text)`;
    console.log("SQL to execute:", sql);
    console.log("Parameters:", { filters, groupBy });

    // ✅ Gọi function PostgreSQL (KHÔNG stringify filters)
    const result = await pool.query(sql, [filters, groupBy]);

    // ✅ Trả kết quả
    res.json({
      data: { items: result.rows },
      status: "success",
      message: result.rows.length ? "Fetched successfully" : "No statistics found"
    });
  } catch (err) {
    handlePgError(err, res);
  }
};
;


const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Kiểm tra id hợp lệ
    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "Order ID is required",
      });
    }

    // ✅ Lấy thông tin đơn hàng theo id
    const result = await pool.query(
      `
      SELECT o.*, u.full_name AS user_name, b.name AS branch_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN branches b ON o.branch_id = b.id
      WHERE o.id = $1
      LIMIT 1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Order not found",
      });
    }

    res.json({
      data: result.rows[0],
      status: "success",
      message: "Fetched successfully",
    });
  } catch (err) {
    handlePgError(err, res);
  }
};

const getOrderProducts = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    const { limit = 20, page = 1, sortField = 'created_at', sortOrder = 'desc' } = req.query;
    const offset = (page - 1) * limit;

    // ✅ Lấy danh sách sản phẩm thuộc đơn hàng
    const result = await pool.query(
      `
      SELECT 
        p.id AS product_id,
        p.name AS product_name,
        od.quantity,
        od.price AS unit_price,
        (od.quantity * od.price) AS subtotal
      FROM order_details AS od
      JOIN products AS p 
        ON od.product_id = p.id
      WHERE od.order_id = $1
      ORDER BY p.${sortField} ${sortOrder === 'desc' ? 'DESC' : 'ASC'}
      LIMIT $2 OFFSET $3
      `,
      [orderId, limit, offset]
    );

    // ✅ Lấy tổng số sản phẩm trong đơn hàng
    const totalResult = await pool.query(
      `SELECT COUNT(*) AS total FROM order_details WHERE order_id = $1`,
      [orderId]
    );

    const total = parseInt(totalResult.rows[0].total, 10);
    const totalPages = Math.ceil(total / limit);

    // ✅ Nếu không có sản phẩm nào
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No products found for this order",
      });
    }

    // ✅ Trả kết quả chuẩn hóa
    res.json({
      data: {
        items: result.rows,
        pagination: {
          total,
          page,
          perPage: limit,
          totalPages,
        },
        sort: {
          field: sortField,
          order: sortOrder,
        },
      },
      status: "success",
      message: "Fetched successfully",
    });
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

const changeOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({
        status: "error",
        message: "Order ID and new status are required",
      });
    }

    // Thực hiện gọi function change_order_status trong Postgres
    await pool.query(`SELECT change_order_status($1, $2::order_status)`, [id, status]);

    res.json({
      status: "success",
      message: `Order status updated to '${status}'`,
    });
  } catch (err) {
    handlePgError(err, res);
  }
};


module.exports = {
  orderController: {
    getAllOrders,
    createOrder,
    updateOrder,
    deleteOrder,
    getOrderProducts,
    getOrdersStatistics,
    getOrderById,
    changeOrderStatus
  },
};
