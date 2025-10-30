const { QueryTypes } = require("sequelize");
const { dbHeadOffice, getDbByBranchId } = require("../config/db");

const getAllSuppliers = async (req, res) => {
  try {
    const { limit, page, sortBy, sortOrder, search } = req.query;

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

    let whereClauses = ["deleted_at IS NULL"];
    let replacements = [];

    if (search) {
      const searchTerm = `%${search}%`;

      whereClauses.push(`
    (name COLLATE SQL_Latin1_General_CP1_CI_AI LIKE ? 
     OR email COLLATE SQL_Latin1_General_CP1_CI_AI LIKE ? 
     OR phone LIKE ?)
  `);

      replacements.push(searchTerm, searchTerm, searchTerm);
    }

    const whereString = whereClauses.join(" AND ");

    const mainQuery = `SELECT id, name, street, ward, district, city, country, zipcode, email, phone, created_at FROM suppliers
       WHERE ${whereString}
       ORDER BY ${sortColumn} ${sortDir}
       OFFSET ? ROWS
       FETCH NEXT ? ROWS ONLY`;

    const countQuery = `SELECT COUNT(*) AS totalCount FROM suppliers WHERE ${whereString}`;

    const replacementsMain = [...replacements, offsetNum, limitNum];

    const results = await dbHeadOffice.query(mainQuery, {
      replacements: replacementsMain,
      type: QueryTypes.SELECT,
    });

    const countResult = await dbHeadOffice.query(countQuery, {
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

const createSupplier = async (req, res) => {
  const t = await dbHeadOffice.transaction();
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

    await dbHeadOffice.query(
      `INSERT INTO suppliers (name, street, ward, district, city, country, zipcode, email, phone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        ],
        type: QueryTypes.INSERT,
        transaction: t,
      }
    );
    await t.commit();
    res.status(201).json({ message: "Supplier created" });
  } catch (err) {
    await t.rollback();
    console.error(err);
    return res.status(500).json({ error: "Lỗi hệ thống", detail: err.message });
  }
};

const updateSupplier = async (req, res) => {
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
      `UPDATE suppliers
        SET name = ?, street = ?, ward = ?, district = ?, city = ?, country = ?, zipcode = ?, email = ?, phone = ?, updated_at = SYSDATETIME()
        OUTPUT INSERTED.*
        WHERE id = ?`,
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
      return res.status(404).json({ message: "Supplier not found" });
    }
    await t.commit();
    res.json({ message: "Supplier updated" });
  } catch (err) {
    await t.rollback();
    console.error(err);
    return res.status(500).json({ error: "Lỗi hệ thống", detail: err.message });
  }
};

const deleteSupplier = async (req, res) => {
  const t = await dbHeadOffice.transaction();
  try {
    const { id } = req.params;

    const [result, metadata] = await dbHeadOffice.query(
      "DELETE FROM suppliers WHERE id = ? AND deleted_at IS NULL",
      {
        replacements: [id],
        transaction: t,
      }
    );

    if (metadata.affectedCount === 0) {
      await t.rollback();
      return res
        .status(404)
        .json({ message: "Supplier not found or already deleted" });
    }
    await t.commit();
    res.json({
      status: "success",
      message: "Supplier deleted",
    });
  } catch (err) {
    await t.rollback();
    console.error(err);
    return res.status(500).json({ error: "Lỗi hệ thống", detail: err.message });
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
