const { QueryTypes } = require("sequelize");
const { dbHeadOffice, getDbByBranchId } = require("../config/db");

const getAllBranches = async (req, res) => {
  const t = await dbHeadOffice.transaction();
  try {
    const { limit, page, sortBy, sortOrder } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offsetNum = (pageNum - 1) * limitNum;

    const sortMap = {
      id: "id",
      name: "name",
      created_at: "created_at",
    };

    const allowedSortColumns = Object.keys(sortMap);
    const sortKey = allowedSortColumns.includes(sortBy) ? sortBy : "created_at";
    const sortColumn = sortMap[sortKey];
    const sortDir = sortOrder === "asc" ? "ASC" : "DESC";

    const results = await dbHeadOffice.query(
      `SELECT id, name, street, ward, district, city, country, zipcode, email, phone, created_at FROM branches
      WHERE deleted_at IS NULL
       ORDER BY ${sortColumn} ${sortDir}
       OFFSET ? ROWS
       FETCH NEXT ? ROWS ONLY`,
      {
        replacements: [offsetNum, limitNum],
        type: QueryTypes.SELECT,
        transaction: t,
      }
    );

    const countResult = await dbHeadOffice.query(
      "SELECT COUNT(*) AS totalCount FROM branches WHERE deleted_at IS NULL",
      {
        type: QueryTypes.SELECT,
        transaction: t,
      }
    );
    const total = parseInt(countResult[0].totalCount, 10);
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

const getAllProductsByBranch = async (req, res) => {
  let t;
  try {
    const { branch_id } = req.query;

    const { limit, page, sortBy, sortOrder } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offsetNum = (pageNum - 1) * limitNum;

    const sortMap = {
      id: "p.id",
      product_name: "p.name",
      price: "p.price",
      quantity: "quantity",
      created_at: "p.created_at",
    };

    const allowedSortColumns = Object.keys(sortMap);
    const sortKey = allowedSortColumns.includes(sortBy) ? sortBy : "created_at";
    const sortColumn = sortMap[sortKey];
    const sortDir = sortOrder === "asc" ? "ASC" : "DESC";

    const db = getDbByBranchId(branch_id);
    t = await db.transaction();

    const result = await db.query(
      `
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
        WHERE i.branch_id = ?
        ORDER BY ${sortColumn} ${sortDir}
        OFFSET ? ROWS
        FETCH NEXT ? ROWS ONLY
      `,
      {
        replacements: [branch_id, offsetNum, limitNum],
        type: QueryTypes.SELECT,
        transaction: t,
      }
    );

    const totalResult = await db.query(
      `SELECT COUNT(*) AS total FROM inventories WHERE branch_id = ?`,
      {
        replacements: [branch_id],
        type: QueryTypes.SELECT,
        transaction: t,
      }
    );

    const total = parseInt(totalResult[0].total, 10);
    const totalPages = Math.ceil(total / limitNum);

    await t.commit();
    res.json({
      data: {
        items: result,
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

const updateBranch = async (req, res) => {
  const t = await dbHeadOffice.transaction();
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

    const result = await dbHeadOffice.query(
      `
      UPDATE branches
      SET name = ?, street = ?, ward = ?, district = ?, city = ?, 
      country = ?, zipcode = ?, email = ?, phone = ?, updated_at = SYSDATETIME()
      OUTPUT INSERTED.*
      WHERE id = ?
    `,
      {
        replacements: [
          name,
          street,
          ward,
          district,
          city,
          country,
          zipcode,
          email,
          phone,
          id,
        ],
        type: QueryTypes.SELECT,
        transaction: t,
      }
    );

    if (result.length === 0) {
      return res.status(404).json({ message: "Branch not found" });
    }

    await t.commit();
    res.json({ message: "Branch updated" });
  } catch (err) {
    await t.rollback();
    console.error(err);
    return res.status(500).json({ error: "Lỗi hệ thống", detail: err.message });
  }
};

module.exports = {
  branchController: {
    getAllBranches,
    updateBranch,
    getAllProductsByBranch,
  },
};
