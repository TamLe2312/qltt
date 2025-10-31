const { pool } = require("../config/db.js");
const handlePgError = require("../middlewares/handlePgError.js");


// === Server: getAllInventories (backend) ===
const getAllInventories = async (req, res) => {
  try {
    let { page = 1, page_size: limit = 20, sort_field: sortField = 'created_at', sort_order: sortOrder = 'desc', search = '', branch_id = '' } = req.query;
    limit = parseInt(limit, 10);
    page = parseInt(page, 10);
    const offset = (page - 1) * limit;

    const sortFieldMap = {
      id: 'i.id',
      product_name: 'p.name',
      sku: 'p.sku',
      supplier_name: 's.name',
      branch_name: 'b.name',
      quantity: 'i.quantity',
      reserved_stock: 'i.reserved_stock',
      created_at: 'i.created_at'
    };
    const dbSortField = sortFieldMap[sortField] ?? sortFieldMap['created_at'];
    sortOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const filters = ['i.deleted_at IS NULL'];
    const params = [];
    let paramIndex = 1;

    if (search) {
      filters.push(`
                (
                    unaccent(p.name) ILIKE unaccent($${paramIndex})
                    OR unaccent(s.name) ILIKE unaccent($${paramIndex})
                    OR unaccent(b.name) ILIKE unaccent($${paramIndex})
                )
            `);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (branch_id) {
      const branchIdNum = parseInt(branch_id, 10);
      if (!isNaN(branchIdNum)) {
        filters.push(`i.branch_id = $${paramIndex}`);
        params.push(branchIdNum);
        paramIndex++;
      }
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const result = await pool.query(
      `
            SELECT 
                i.id, i.status, 
                p.id AS product_id, p.name AS product_name, p.sku, 
                s.id AS supplier_id, s.name AS supplier_name, 
                i.quantity, i.reserved_stock, 
                b.id AS branch_id, b.name AS branch_name
            FROM inventories i
            JOIN products p ON i.product_id = p.id
            JOIN suppliers s ON i.supplier_id = s.id
            JOIN branches b ON i.branch_id = b.id
            ${whereClause}
            ORDER BY ${dbSortField} ${sortOrder}
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
            `,
      [...params, limit, offset]
    );

    const totalQuery = `
            SELECT COUNT(*) AS total
            FROM inventories i
            JOIN products p ON i.product_id = p.id
            JOIN suppliers s ON i.supplier_id = s.id
            JOIN branches b ON i.branch_id = b.id
            ${whereClause}
        `;
    const totalResult = await pool.query(totalQuery, params);
    const total = parseInt(totalResult.rows[0].total, 10);

    res.json({
      data: {
        items: result.rows,
        pagination: {
          total,
          page,
          perPage: limit,
          totalPages: Math.ceil(total / limit),
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


const createInventory = async (req, res) => {
  try {
    const { product_id, supplier_id, branch_id, quantity } = req.body;

    await pool.query(
      "INSERT INTO inventories (product_id, supplier_id, branch_id, quantity) VALUES ($1, $2, $3, $4) RETURNING *",
      [product_id, supplier_id, branch_id, quantity]
    );
    res.status(201).json({ message: "Branch created" });
  } catch (err) {
    handlePgError(err, res);
  }
};

const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { product_id, supplier_id, quantity } = req.body;
    const result = await pool.query(
      `UPDATE inventories 
       SET product_id = $1, supplier_id = $2, quantity = $3
        WHERE id = $4 RETURNING *`,
      [product_id, supplier_id, quantity, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Inventory not found" });
    }
    res.json({ message: "Inventory updated" });
  } catch (err) {
    handlePgError(err, res);
  }
};

const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra bản ghi tồn tại và chưa bị soft delete
    const { rows } = await pool.query(
      "SELECT id FROM inventories WHERE id = $1 AND deleted_at IS NULL",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Inventory not found or already deleted" });
    }

    // Thực hiện DELETE (trigger sẽ cập nhật deleted_at)
    await pool.query("DELETE FROM inventories WHERE id = $1", [id]);

    res.json({
      status: "success",
      message: "Inventory deleted (soft delete triggered)"
    });
  } catch (err) {
    handlePgError(err, res);
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
