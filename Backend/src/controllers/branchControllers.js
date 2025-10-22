const { pool } = require("../config/db.js");
const handlePgError = require("../middlewares/handlePgError.js");

const getAllBranches = async (req, res) => {
  try {
    const { limit = 20, page = 1, sortField = 'created_at', sortOrder = 'desc' } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT * FROM branches
        WHERE branches.deleted_at IS NULL
        ORDER BY ${sortField} ${sortOrder === 'desc' ? 'DESC' : 'ASC'}
        LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const totalResult = await pool.query(`SELECT COUNT(*) AS total FROM branches`);
    const total = parseInt(totalResult.rows[0].total, 10);
    const totalPages = Math.ceil(total / limit);

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

const getAllProductsByBranch = async (req, res) => {
  try {
    const branchId = parseInt(req.params.id, 10);
    const { limit = 20, page = 1, sortField = 'p.created_at', sortOrder = 'asc' } = req.query;
    const offset = (page - 1) * limit;

    // ✅ Lấy danh sách sản phẩm thuộc chi nhánh
    const result = await pool.query(`
      SELECT 
        p.id,
        p.name AS product_name,
        p.price,
        (i.quantity - i.reserved_stock) AS quantity
      FROM inventories AS i
      JOIN products AS p
        ON i.product_id = p.id
      JOIN suppliers AS s
        ON i.supplier_id = s.id
      WHERE i.branch_id = $1
      ORDER BY ${sortField} ${sortOrder === 'desc' ? 'DESC' : 'ASC'}
      LIMIT $2 OFFSET $3
      `,
      [branchId, limit, offset]
    );

    // ✅ Lấy tổng số bản ghi
    const totalResult = await pool.query(
      `SELECT COUNT(*) AS total FROM inventories WHERE branch_id = $1`,
      [branchId]
    );

    const total = parseInt(totalResult.rows[0].total, 10);
    const totalPages = Math.ceil(total / limit);

    // ✅ Trả kết quả
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


const createBranch = async (req, res) => {
  try {
    const {
      name,
      street,
      ward,
      district,
      city,
      country,
      zipcode,
      email,
      phone,
    } = req.body;
    await pool.query(
      `INSERT INTO branches (name, street, ward, district, city, country, zipcode, email, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [name, street, ward, district, city, country, zipcode, email, phone]
    );
    res.status(201).json({ message: "Branch created" });
  } catch (err) {
    handlePgError(err, res);
  }
};

const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      street,
      ward,
      district,
      city,
      country,
      zipcode,
      email,
      phone,
    } = req.body;
    const result = await pool.query(
      `UPDATE branches
        SET name = $1, street = $2, ward = $3, district = $4, city = $5, country = $6, zipcode = $7, email = $8, phone = $9
        WHERE id = $10
        RETURNING *`,
      [name, street, ward, district, city, country, zipcode, email, phone, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Branch not found" });
    }
    res.json({ message: "Branch updated" });
  } catch (err) {
    handlePgError(err, res);
  }
};

const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM branches WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Branch not found" });
    }
    res.json({ message: "Branch deleted" });
  } catch (err) {
    handlePgError(err, res);
  }
};

module.exports = {
  branchController: {
    getAllBranches,
    createBranch,
    updateBranch,
    deleteBranch,
    getAllProductsByBranch
  },
};
