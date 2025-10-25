const buildTree = require("../helpers/buildTree");
const { QueryTypes } = require("sequelize");
const { dbHeadOffice, getDbByBranchId } = require("../config/db");

const getAllCategoriesTree = async (req, res) => {
  const t = await dbHeadOffice.transaction();
  try {
    const { limit, page } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offsetNum = (pageNum - 1) * limitNum;

    const results = await dbHeadOffice.query(
      `SELECT * FROM get_all_categories_hierarchy_paginated(?, ?)`,
      {
        replacements: [limitNum, offsetNum],
        type: QueryTypes.SELECT,
        transaction: t,
      }
    );

    const trees = buildTree(results);

    const totalResult = await dbHeadOffice.query(
      `SELECT COUNT(*) AS total FROM categories`,
      {
        type: QueryTypes.SELECT,
        transaction: t,
      }
    );
    const total = parseInt(totalResult[0].total, 10);
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      data: {
        items: trees,
        pagination: {
          total,
          pageNum,
          perPage: limitNum,
          totalPages,
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
  const t = await dbHeadOffice.transaction();
  try {
    const { limit, page, sortBy, sortOrder } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offsetNum = (pageNum - 1) * limitNum;

    const sortMap = {
      id: "id",
      name: "name",
      parent_id: "parent_id",
      created_at: "created_at",
      updated_at: "updated_at",
    };

    const allowedSortColumns = Object.keys(sortMap);
    const sortKey = allowedSortColumns.includes(sortBy) ? sortBy : "created_at";
    const sortColumn = sortMap[sortKey];
    const sortDir = sortOrder === "asc" ? "ASC" : "DESC";

    const results = await dbHeadOffice.query(
      `
      SELECT *
      FROM categories
      ORDER BY ${sortColumn} ${sortDir}
      OFFSET ? ROWS
      FETCH NEXT ? ROWS ONLY
      `,
      {
        replacements: [offsetNum, limitNum],
        type: QueryTypes.SELECT,
        transaction: t,
      }
    );

    const totalResult = await dbHeadOffice.query(
      "SELECT COUNT(*) AS total FROM categories",
      {
        type: QueryTypes.SELECT,
        transaction: t,
      }
    );

    const total = parseInt(totalResult[0].total, 10);
    const totalPages = Math.ceil(total / limitNum);

    await t.commit();
    res.json({
      data: {
        items: results,
        pagination: {
          total,
          pageNum,
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

const getCategories = async (req, res) => {
  const t = await dbHeadOffice.transaction();
  try {
    const { limit, page, sortBy, sortOrder } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offsetNum = (pageNum - 1) * limitNum;

    const sortMap = {
      id: "c.id",
      name: "c.name",
      parent_name: "parent_name",
      created_at: "c.created_at",
    };

    const allowedSortColumns = Object.keys(sortMap);
    const sortKey = allowedSortColumns.includes(sortBy) ? sortBy : "created_at";
    const sortColumn = sortMap[sortKey];
    const sortDir = sortOrder === "asc" ? "ASC" : "DESC";

    const results = await dbHeadOffice.query(
      `SELECT c.*, COALESCE(p.name, 'ROOT') AS parent_name FROM categories c
       LEFT JOIN categories p ON c.parent_id = p.id
       ORDER BY ${sortColumn} ${sortDir}
       OFFSET ? ROWS
       FETCH NEXT ? ROWS ONLY`,
      {
        replacements: [offsetNum, limitNum],
        type: QueryTypes.SELECT,
        transaction: t,
      }
    );

    const totalResult = await dbHeadOffice.query(
      "SELECT COUNT(*) AS total FROM categories",
      {
        type: QueryTypes.SELECT,
        transaction: t,
      }
    );

    const total = parseInt(totalResult[0].total, 10);
    const totalPages = Math.ceil(total / limitNum);

    await t.commit();

    res.json({
      data: {
        items: results,
        pagination: {
          total,
          pageNum,
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

const createCategory = async (req, res) => {
  const t = await dbHeadOffice.transaction();
  try {
    const { name, parent_id } = req.body;
    await dbHeadOffice.query(
      `INSERT INTO categories (name, parent_id)
      VALUES (? ,?)`,
      {
        replacements: [name, parent_id || null],
        type: QueryTypes.INSERT,
        transaction: t,
      }
    );
    await t.commit();
    res.status(201).json({ message: "Category created" });
  } catch (err) {
    await t.rollback();
    console.error(err);
    return res.status(500).json({ error: "Lỗi hệ thống", detail: err.message });
  }
};

const updateCategory = async (req, res) => {
  const t = await dbHeadOffice.transaction();
  try {
    const { id } = req.params;
    const { name, parent_id } = req.body;

    const result = await dbHeadOffice.query(
      `UPDATE categories
        SET name = ?, parent_id = ?, updated_at = SYSDATETIME()
        OUTPUT INSERTED.*
        WHERE id = ?`,
      {
        replacements: [name, parent_id || null, id],
        type: QueryTypes.SELECT,
        transaction: t,
      }
    );
    if (result.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }
    await t.commit();
    res.status(201).json({ message: "Category updated" });
  } catch (err) {
    await t.rollback();
    console.error(err);
    return res.status(500).json({ error: "Lỗi hệ thống", detail: err.message });
  }
};

const deleteCategory = async (req, res) => {
  const t = await dbHeadOffice.transaction();
  try {
    const { id } = req.params;

    const [affectedCount] = await dbHeadOffice.query(
      `
      DELETE FROM categories WHERE id = ?
      `,
      {
        replacements: [id],
        type: QueryTypes.DELETE,
        transaction: t,
      }
    );

    if (affectedCount === 0) {
      return res.status(404).json({ error: "Category not found" });
    }
    await t.commit();

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    await t.rollback();
    console.error(err);
    return res.status(500).json({ error: "Lỗi hệ thống", detail: err.message });
  }
};

module.exports = {
  categoryController: {
    getAllCategories,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getAllCategoriesTree,
  },
};
