const { QueryTypes } = require("sequelize");
const { dbHeadOffice, getDbByBranchId } = require("../config/db");

const getAllInventories = async (req, res) => {
  try {
    const { limit, page, sortBy, sortOrder, branch_id, search } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offsetNum = (pageNum - 1) * limitNum;

    const sortMap = {
      id: "i.id",
      product_name: "p.name",
      sku: "p.sku",
      supplier_name: "s.name",
      branch_name: "b.name",
      quantity: "i.quantity",
      reserved_stock: "i.reserved_stock",
      created_at: "i.created_at",
    };

    const allowedSortColumns = Object.keys(sortMap);
    const sortKey = allowedSortColumns.includes(sortBy) ? sortBy : "created_at";
    const sortColumn = sortMap[sortKey];
    const sortDir = sortOrder === "asc" ? "ASC" : "DESC";

    let whereClauses = ["i.deleted_at IS NULL AND i.branch_id = ?"];
    let replacements = [branch_id];

    if (search) {
      const searchTerm = `%${search}%`;

      whereClauses.push(`
    (p.sku COLLATE SQL_Latin1_General_CP1_CI_AI LIKE ? 
     OR p.name COLLATE SQL_Latin1_General_CP1_CI_AI LIKE ?
     OR s.name COLLATE SQL_Latin1_General_CP1_CI_AI LIKE ?)
  `);

      replacements.push(searchTerm, searchTerm, searchTerm);
    }
    const whereString = whereClauses.join(" AND ");

    const db = getDbByBranchId(branch_id);

    const mainQuery = `SELECT 
        i.id, 
        p.id AS product_id, p.name AS product_name, p.sku, 
        s.id AS supplier_id, s.name AS supplier_name, 
        i.quantity, i.reserved_stock, 
        b.id AS branch_id, b.name AS branch_name, i.created_at
      FROM inventories i
      JOIN products p ON i.product_id = p.id
      JOIN suppliers s ON i.supplier_id = s.id
      JOIN branches b ON i.branch_id = b.id
      WHERE ${whereString}
      ORDER BY ${sortColumn} ${sortDir}
      OFFSET ? ROWS
      FETCH NEXT ? ROWS ONLY`;

    const countQuery = `SELECT COUNT(i.id) AS totalCount 
    FROM inventories i
    JOIN products p ON i.product_id = p.id
    JOIN suppliers s ON i.supplier_id = s.id
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
    console.error(err);
    return res.status(500).json({ error: "Lỗi hệ thống", detail: err.message });
  }
};

const createInventory = async (req, res) => {
  let t;
  try {
    const { branch_id } = req.query;
    const { product_id, supplier_id, quantity } = req.body;

    const db = getDbByBranchId(branch_id);
    t = await db.transaction();
    const result = await db.query(
      `INSERT INTO inventories (product_id, supplier_id, branch_id, quantity) 
      OUTPUT INSERTED.id
      VALUES (?, ?, ?, ?)`,
      {
        replacements: [product_id, supplier_id, branch_id, quantity],
        type: QueryTypes.SELECT,
        transaction: t,
      }
    );

    if (!result || result.length === 0) {
      throw new Error("Inventory creation failed, no ID returned.");
    }

    await t.commit();
    res.status(201).json({ message: "Inventory created" });
  } catch (err) {
    await t.rollback();
    console.error(err);
    return res.status(500).json({ error: "Lỗi hệ thống", detail: err.message });
  }
};

const updateInventory = async (req, res) => {
  let t;
  try {
    const { id } = req.params;
    const { product_id, supplier_id, quantity } = req.body;
    const { branch_id } = req.query;
    const db = getDbByBranchId(branch_id);
    t = await db.transaction();
    const result = await db.query(
      `UPDATE inventories 
       SET product_id = ?, supplier_id = ?, quantity = ?,
       updated_at = SYSDATETIME()
       OUTPUT INSERTED.*
       WHERE id = ?`,
      {
        replacements: [product_id, supplier_id, quantity, id],
        type: QueryTypes.SELECT,
        transaction: t,
      }
    );

    if (result.length === 0) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    await t.commit();
    res.json({ message: "Inventory updated" });
  } catch (err) {
    await t.rollback();
    console.error(err);
    return res.status(500).json({ error: "Lỗi hệ thống", detail: err.message });
  }
};

const deleteInventory = async (req, res) => {
  let t;
  try {
    const { id } = req.params;

    const { branch_id } = req.query;
    const db = getDbByBranchId(branch_id);
    t = await db.transaction();

    const [result, metadata] = await db.query(
      "DELETE FROM inventories WHERE id = ? AND deleted_at IS NULL",
      {
        replacements: [id],
        transaction: t,
      }
    );

    if (metadata.affectedCount === 0) {
      await t.rollback();
      return res
        .status(404)
        .json({ message: "Inventory not found or already deleted" });
    }

    await t.commit();
    res.json({
      status: "success",
      message: "Inventory deleted",
    });
  } catch (err) {
    await t.rollback();
    console.error(err);
    return res.status(500).json({ error: "Lỗi hệ thống", detail: err.message });
  }
};

module.exports = {
  inventoriesController: {
    getAllInventories,
    createInventory,
    updateInventory,
    deleteInventory,
  },
};
