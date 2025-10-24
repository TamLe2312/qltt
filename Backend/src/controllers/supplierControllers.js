const { pool } = require("../config/db.js");
const handlePgError = require("../middlewares/handlePgError.js");

const getAllSuppliers = async (req, res) => {
  try {
    let { limit = 20, page = 1, sortField = 'created_at', sortOrder = 'desc' } = req.query;
    limit = parseInt(limit, 10);
    page = parseInt(page, 10);
    const offset = (page - 1) * limit;

    // Danh sách cột cho phép sắp xếp để tránh SQL injection
    const allowedSortFields = ['id', 'name', 'created_at'];
    if (!allowedSortFields.includes(sortField)) sortField = 'created_at';
    sortOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Truy vấn danh sách suppliers với phân trang và sắp xếp
    const result = await pool.query(
      `SELECT * FROM suppliers
        WHERE suppliers.deleted_at IS NULL
       ORDER BY ${sortField} ${sortOrder}
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    // Truy vấn tổng số bản ghi
    const totalResult = await pool.query(`SELECT COUNT(*) AS total FROM suppliers`);
    const total = parseInt(totalResult.rows[0].total, 10);
    const totalPages = Math.ceil(total / limit);

    // Trả dữ liệu theo định dạng chuẩn
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


const createSupplier = async (req, res) => {
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
      `INSERT INTO suppliers (name, street, ward, district, city, country, zipcode, email, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [name, street, ward, district, city, country, zipcode, email, phone]
    );
    res.status(201).json({ message: "Supplier created" });
  } catch (err) {
    handlePgError(err, res);
  }
};

const updateSupplier = async (req, res) => {
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
      `UPDATE suppliers
        SET name = $1, street = $2, ward = $3, district = $4, city = $5, country = $6, zipcode = $7, email = $8, phone = $9
        WHERE id = $10
        RETURNING *`,
      [name, street, ward, district, city, country, zipcode, email, phone, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.json({ message: "Supplier updated" });
  } catch (err) {
    handlePgError(err, res);
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra bản ghi tồn tại và chưa bị soft delete
    const { rows } = await pool.query(
      "SELECT id FROM suppliers WHERE id = $1 AND deleted_at IS NULL",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Supplier not found or already deleted" });
    }

    // Thực hiện DELETE (trigger soft delete sẽ cập nhật deleted_at)
    await pool.query("DELETE FROM suppliers WHERE id = $1", [id]);

    res.json({
      status: "success",
      message: "Supplier deleted (soft delete triggered)"
    });
  } catch (err) {
    handlePgError(err, res);
  }
};


module.exports = {
  supplierController: {
    getAllSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  },
};
