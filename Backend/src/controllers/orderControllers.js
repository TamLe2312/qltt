const { QueryTypes, DatabaseError } = require("sequelize");
const { dbHeadOffice, getDbByBranchId } = require("../config/db.js");

const getAllOrders = async (req, res) => {
  try {
    const { branch_id, limit, page, sortBy, sortOrder, search } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offsetNum = (pageNum - 1) * limitNum;

    const sortMap = {
      id: "oc.id",
      order_code: "oc.order_code",
      username: "username",
      status: "oe.status",
      total_amount: "oe.total_amount",
      created_at: "oc.created_at",
    };

    const allowedSortColumns = Object.keys(sortMap);
    const sortKey = allowedSortColumns.includes(sortBy) ? sortBy : "created_at";
    const sortColumn = sortMap[sortKey];
    const sortDir = sortOrder === "asc" ? "ASC" : "DESC";

    let whereClauses = ["oc.deleted_at IS NULL AND oc.branch_id = ?"];
    let replacements = [branch_id];

    if (search) {
      const searchTerm = `%${search}%`;

      whereClauses.push(`
    (oc.order_code COLLATE SQL_Latin1_General_CP1_CI_AI LIKE ? 
     OR u.full_name COLLATE SQL_Latin1_General_CP1_CI_AI LIKE ?)
  `);

      replacements.push(searchTerm, searchTerm);
    }
    const whereString = whereClauses.join(" AND ");

    const db = getDbByBranchId(branch_id);

    const mainQuery = `SELECT oc.id, oc.order_code, oe.status, oe.note, oe.total_amount, u.full_name AS username, b.name AS branch_name, oc.created_at
      FROM orders_core oc
      LEFT JOIN users u ON oc.user_id = u.id
      LEFT JOIN branches b ON oc.branch_id = b.id
      LEFT JOIN orders_extra oe ON oc.id = oe.order_id
      WHERE ${whereString}
      ORDER BY ${sortColumn} ${sortDir}
      OFFSET ? ROWS
      FETCH NEXT ? ROWS ONLY`;

    const countQuery = `SELECT COUNT(oc.id) AS totalCount 
    FROM orders_core oc
    LEFT JOIN users u ON oc.user_id = u.id
    LEFT JOIN branches b ON oc.branch_id = b.id
    WHERE ${whereString}`;

    const replacementsMain = [...replacements, offsetNum, limitNum];

    const results = await db.query(mainQuery, {
      replacements: replacementsMain,
      type: QueryTypes.SELECT,
    });

    const countResult = await db.query(countQuery, {
      replacements: replacements,
      type: QueryTypes.SELECT,
    });

    const total = parseInt(countResult[0].totalCount, 10);
    const totalPages = Math.ceil(total / limitNum);
    res.json({
      data: {
        items: results,
        pagination: {
          total,
          page: pageNum,
          perPage: limitNum,
          totalPages,
        },
        sort: {
          field: sortColumn,
          order: sortDir,
        },
      },
      status: "success",
      message: "Fetched successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Lỗi hệ thống", detail: err.message });
  }
};

const getOrdersStatistics = async (req, res) => {
  try {
    let { filters = {}, groupBy = "month" } = req.body;
    console.log(filters, groupBy);

    const validGroups = ["day", "month", "quarter", "year"];
    if (!validGroups.includes(groupBy)) {
      return res.status(400).json({
        status: "error",
        message: "groupBy must be one of: day, month, quarter, year",
      });
    }
    const db = await getDbByBranchId(filters.branchId);

    const result = await db.query(
      `EXEC sp_get_orders_statistics 
         @filters = :filters, 
         @group_by = :group_by`,
      {
        replacements: {
          filters: JSON.stringify(filters),
          group_by: groupBy,
        },
        type: QueryTypes.RAW,
      }
    );
    const items = result[0];
    res.json({
      data: { items },
      status: "success",
      message: items.length ? "Fetched successfully" : "No statistics found",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Lỗi hệ thống", detail: err.message });
  }
};

const getOrderById = async (req, res) => {
  let t;
  try {
    const { id } = req.params;
    const { branch_id } = req.query;
    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "Order ID is required",
      });
    }

    const db = getDbByBranchId(branch_id);
    t = await db.transaction();
    const result = await db.query(
      `
      SELECT oc.id, oc.order_code, oe.total_amount, oe.status,u.full_name AS user_name, b.name AS branch_name
      FROM orders_core oc
      LEFT JOIN users u ON oc.user_id = u.id
      LEFT JOIN branches b ON oc.branch_id = b.id
      LEFT JOIN orders_extra oe ON oc.id = oe.order_id
      WHERE oc.id = ?
      `,
      {
        replacements: [id],
        type: QueryTypes.SELECT,
        transaction: t,
      }
    );

    if (result.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Order not found",
      });
    }

    res.json({
      data: result[0],
      status: "success",
      message: "Fetched successfully",
    });
  } catch (err) {
    await t.rollback();
    console.error(err);
    return res.status(500).json({ error: "Lỗi hệ thống", detail: err.message });
  }
};

const getOrderProducts = async (req, res) => {
  let t;

  try {
    const id = req.params.id;
    const { branch_id, limit, page, sortBy, sortOrder } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offsetNum = (pageNum - 1) * limitNum;

    const db = getDbByBranchId(branch_id);
    t = await db.transaction();

    const sortMap = {
      product_id: "product_id",
      product_name: "product_name",
      quantity: "od.quantity",
      price: "od.price",
      subtotal: "subtotal",
    };

    const allowedSortColumns = Object.keys(sortMap);
    const sortKey = allowedSortColumns.includes(sortBy) ? sortBy : "product_id";
    const sortColumn = sortMap[sortKey];
    const sortDir = sortOrder === "asc" ? "ASC" : "DESC";

    const results = await db.query(
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
      WHERE od.order_id = ?
      ORDER BY ${sortColumn} ${sortDir}
      OFFSET ? ROWS
      FETCH NEXT ? ROWS ONLY
      `,
      {
        replacements: [id, offsetNum, limitNum],
        type: QueryTypes.SELECT,
        transaction: t,
      }
    );

    const totalResult = await db.query(
      `SELECT COUNT(*) AS total FROM order_details WHERE order_id = ?`,
      {
        replacements: [id],
        type: QueryTypes.SELECT,
        transaction: t,
      }
    );

    const total = parseInt(totalResult[0].total, 10);
    const totalPages = Math.ceil(total / limitNum);

    if (results.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No products found for this order",
      });
    }

    await t.commit();
    res.json({
      data: {
        items: results,
        pagination: {
          total,
          page: pageNum,
          perPage: limitNum,
          totalPages,
        },
        sort: {
          field: sortColumn,
          order: sortDir,
        },
      },
      status: "success",
      message: "Fetched successfully",
    });
  } catch (err) {
    await t.rollback();
    console.error(err);
    return res.status(500).json({ error: "Lỗi hệ thống", detail: err.message });
  }
};

const createOrder = async (req, res) => {
  let t;
  try {
    const {
      user_id,
      note,
      products,
      street,
      ward,
      district,
      city,
      country,
      zipcode,
      branch_id,
    } = req.body;

    const db = getDbByBranchId(branch_id);
    t = await db.transaction();

    await db.query(
      `EXEC sp_create_order 
         @user_id = :user_id, 
         @branch_id = :branch_id, 
         @note = :note, 
         @street = :street, 
         @ward = :ward, 
         @district = :district, 
         @city = :city, 
         @country = :country, 
         @zipcode = :zipcode, 
         @products_json = :products_json`,
      {
        replacements: {
          user_id: user_id,
          branch_id: branch_id,
          note: note,
          street: street,
          ward: ward,
          district: district,
          city: city,
          country: country,
          zipcode: zipcode,
          products_json: JSON.stringify(products),
        },
        type: QueryTypes.RAW,
        transaction: t,
      }
    );

    await t.commit();

    res.status(201).json({ message: "Order created" });
  } catch (err) {
    await t.rollback();
    console.error(err);
    return res.status(500).json({ error: "Lỗi hệ thống", detail: err.message });
  }
};

const updateOrder = async (req, res) => {
  let t;
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
    await t.rollback();
    console.error(err);
    return res.status(500).json({ error: "Lỗi hệ thống", detail: err.message });
  }
};

const deleteOrder = async (req, res) => {
  let t;
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
    await t.rollback();
    console.error(err);
    return res.status(500).json({ error: "Lỗi hệ thống", detail: err.message });
  }
};

const changeOrderStatus = async (req, res) => {
  let t;
  try {
    const { id } = req.params;
    const { branch_id } = req.query;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({
        status: "error",
        message: "Order ID and new status are required",
      });
    }

    const db = getDbByBranchId(branch_id);
    t = await db.transaction();
    await db.query(`UPDATE orders_extra SET status = ? WHERE order_id = ?`, {
      replacements: [status, id],
      type: QueryTypes.UPDATE,
      transaction: t,
    });

    await t.commit();

    res.json({
      status: "success",
      message: `Order status updated to '${status}'`,
    });
  } catch (err) {
    await t.rollback();
    console.error(err);
    return res.status(500).json({ error: "Lỗi hệ thống", detail: err.message });
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
    changeOrderStatus,
  },
};
