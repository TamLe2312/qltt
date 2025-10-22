const { pool } = require("../config/db.js");
const buildTree = require("../helpers/buildTree.js");
const handlePgError = require("../middlewares/handlePgError.js");

// const getAllCategories = async (req, res) => {
//   try {
//     const { limit, page } = req.query;
//     const offset = page && limit ? (page - 1) * limit : 0;
//     const result = await pool.query(
//       `SELECT * FROM get_all_categories_hierarchy_paginated($1, $2)`,
//       [limit || 20, offset]
//     );

//     const trees = buildTree(result.rows);
//     res.json(trees);
//   } catch (err) {
//     handlePgError(err, res);
//   }
// };

const getAllCategoriesTree = async (req, res) => {
  try {
    const { limit = 20, page = 1, sortField = 'created_at', sortOrder = 'desc' } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT * FROM get_all_categories_hierarchy_paginated($1, $2)`,
      [limit, offset]
    );

    const trees = buildTree(result.rows);

    const totalResult = await pool.query(`SELECT COUNT(*) AS total FROM categories`);
    const total = parseInt(totalResult.rows[0].total, 10);
    const totalPages = Math.ceil(total / limit);

    res.json({
      data: {
        items: trees,
        pagination: {
          total: total,
          page: page,
          perPage: limit,
          totalPages: totalPages,
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

const getAllCategories = async (req, res) => {
  try {
    let { limit = 20, page = 1, sortField = 'created_at', sortOrder = 'asc' } = req.query;
    limit = parseInt(limit, 10);
    page = parseInt(page, 10);
    const offset = (page - 1) * limit;

    // ✅ Danh sách cột được phép sắp xếp
    const allowedSortFields = ['id', 'name', 'parent_id', 'created_at', 'updated_at'];
    if (!allowedSortFields.includes(sortField)) sortField = 'created_at';
    sortOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // ✅ Lấy danh sách categories
    const result = await pool.query(
      `
      SELECT *
      FROM categories
      ORDER BY ${sortField} ${sortOrder}
      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );

    // ✅ Lấy tổng số bản ghi
    const totalResult = await pool.query(`SELECT COUNT(*) AS total FROM categories`);
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


const getCategories = async (req, res) => {
  try {
    const { limit, page } = req.query;
    const offset = page && limit ? (page - 1) * limit : 0;
    const result = await pool.query(
      `SELECT c.*, COALESCE(p.name, 'ROOT') AS parent_name FROM categories c
       LEFT JOIN categories p ON c.parent_id = p.id
       ORDER BY c.id
       LIMIT $1 OFFSET $2`,
      [limit || 20, offset]
    );
    const countResult = await pool.query("SELECT COUNT(*) FROM categories;");
    res.json({ data: result.rows, total: countResult.rows[0].count });
  } catch (err) {
    handlePgError(err, res);
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, parent_id } = req.body;
    await pool.query(
      `INSERT INTO categories (name, parent_id)
      VALUES ($1, $2)
        RETURNING *`,
      [name, parent_id || null]
    );
    res.status(201).json({ message: "Category created" });
  } catch (err) {
    handlePgError(err, res);
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, parent_id } = req.body;
    const result = await pool.query(
      `UPDATE categories
            SET name = $1, parent_id = $2, updated_at = NOW()
            WHERE id = $3
            RETURNING *`,
      [name, parent_id || null, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.status(201).json({ message: "Category updated" });
  } catch (err) {
    handlePgError(err, res);
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `DELETE FROM categories
            WHERE id = $1
            RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.status(201).json({ message: "Category deleted successfully" });
  } catch (err) {
    handlePgError(err, res);
  }
};

module.exports = {
  categoryController: {
    getAllCategories,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getAllCategoriesTree
  },
};
