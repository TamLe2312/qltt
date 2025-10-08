import pool from "../config/db.js";
import buildTree from "../helpers/buildTree.js";
import handlePgError from "../middlewares/handlePgError.js";

const getAllCategories = async (req, res) => {
  try {
    const { limit, page } = req.query;
    const offset = page && limit ? (page - 1) * limit : 0;
    const result = await pool.query(
      `SELECT * FROM get_all_categories_hierarchy_paginated($1, $2)`,
      [limit || 20, offset]
    );

    const trees = buildTree(result.rows);
    res.json(trees);
  } catch (err) {
    handlePgError(err, res);
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, parent_id } = req.body;
    const result = await pool.query(
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
            WHERE category_id = $3
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
            WHERE category_id = $1
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

export const categoryController = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
