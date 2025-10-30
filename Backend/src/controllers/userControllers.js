const { QueryTypes } = require("sequelize");
const { dbHeadOffice, getDbByBranchId } = require("../config/db");
const bcrypt = require("bcrypt");

const getAllUsers = async (req, res) => {
  try {
    const { limit, page, sortBy, sortOrder, search } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offsetNum = (pageNum - 1) * limitNum;

    const sortMap = {
      id: "u.id",
      full_name: "u.full_name",
      username: "u.username",
      email: "u.email",
      phone: "u.phone",
      status: "u.status",
      role_name: "r.name",
      created_at: "u.created_at",
    };

    const allowedSortColumns = Object.keys(sortMap);
    const sortKey = allowedSortColumns.includes(sortBy) ? sortBy : "created_at";
    const sortColumn = sortMap[sortKey];
    const sortDir = sortOrder === "asc" ? "ASC" : "DESC";

    let whereClauses = ["u.deleted_at IS NULL"];
    let replacements = [];

    if (search) {
      const searchTerm = `%${search}%`;

      whereClauses.push(`
    (u.full_name COLLATE SQL_Latin1_General_CP1_CI_AI LIKE ? 
     OR u.username COLLATE SQL_Latin1_General_CP1_CI_AI LIKE ?
     OR u.email COLLATE SQL_Latin1_General_CP1_CI_AI LIKE ?
     OR u.phone LIKE ?)
  `);

      replacements.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const whereString = whereClauses.join(" AND ");

    const mainQuery = `SELECT u.id, u.full_name, u.username, u.email, u.phone, u.status,
      r.id AS role_id, r.name AS role_name, u.created_at
       FROM users u
       JOIN user_roles ur ON u.id = ur.user_id
       JOIN roles r ON ur.role_id = r.id
       WHERE ${whereString}
       ORDER BY ${sortColumn} ${sortDir}
       OFFSET ? ROWS
       FETCH NEXT ? ROWS ONLY`;

    const countQuery = `SELECT COUNT(*) AS totalCount FROM users u WHERE ${whereString}`;

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

const getUserById = async (req, res) => {
  const t = await dbHeadOffice.transaction();
  try {
    const { id } = req.params;
    const result = await dbHeadOffice.query(
      "SELECT * FROM users WHERE id = ?",
      {
        replacements: [id],
        type: QueryTypes.SELECT,
        transaction: t,
      }
    );
    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    await t.commit();
    res.json(result[0]);
  } catch (err) {
    await t.rollback();
    console.error(err);
    return res.status(500).json({ error: "Lỗi hệ thống", detail: err.message });
  }
};

const getRoles = async (req, res) => {
  const t = await dbHeadOffice.transaction();
  try {
    const result = await dbHeadOffice.query(
      "SELECT id, name FROM roles ORDER BY id",
      {
        type: QueryTypes.SELECT,
        transaction: t,
      }
    );
    await t.commit();
    res.json(result);
  } catch (err) {
    await t.rollback();
    console.error(err);
    return res.status(500).json({ error: "Lỗi hệ thống", detail: err.message });
  }
};

const createUser = async (req, res) => {
  const t = await dbHeadOffice.transaction();
  try {
    const { full_name, status, username, email, phone, password, role_id } =
      req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertUserResult = await dbHeadOffice.query(
      `INSERT INTO users (full_name, status, username, email, phone, password)
       OUTPUT INSERTED.id
       VALUES (?, ?, ?, ?, ?, ?)`,
      {
        replacements: [
          full_name,
          status,
          username,
          email,
          phone,
          hashedPassword,
        ],
        type: QueryTypes.SELECT,
        transaction: t,
      }
    );

    if (!insertUserResult || insertUserResult.length === 0) {
      throw new Error("User creation failed, no ID returned.");
    }
    const newUserId = insertUserResult[0].id;

    await dbHeadOffice.query(
      `INSERT INTO user_roles (user_id, role_id)
       VALUES (?, ?)`,
      {
        replacements: [newUserId, role_id],
        type: QueryTypes.INSERT,
        transaction: t,
      }
    );

    await t.commit();

    res.status(201).json({ message: "User created" });
  } catch (err) {
    await t.rollback();
    console.error(err);
    return res.status(500).json({ error: "Lỗi hệ thống", detail: err.message });
  }
};

const updateUser = async (req, res) => {
  const t = await dbHeadOffice.transaction();
  try {
    const { id } = req.params;
    const { full_name, status, username, email, phone, password } = req.body;

    const currentUserResult = await dbHeadOffice.query(
      "SELECT * FROM users WHERE id = ?",
      { replacements: [id], type: QueryTypes.SELECT, transaction: t }
    );

    if (currentUserResult.length === 0) {
      await t.rollback();
      return res.status(404).json({ message: "User not found" });
    }

    const currentUser = currentUserResult[0];

    if (email && email !== currentUser.email) {
      const emailExistsResult = await dbHeadOffice.query(
        "SELECT id FROM users WHERE email = ? AND id != ?",
        {
          replacements: [email, id],
          type: QueryTypes.SELECT,
          transaction: t,
        }
      );
      if (emailExistsResult.length > 0) {
        await t.rollback();
        return res
          .status(409)
          .json({ message: `Email "${email}" already exists.` });
      }
    }

    if (username && username !== currentUser.username) {
      const usernameExistsResult = await dbHeadOffice.query(
        "SELECT id FROM users WHERE username = ? AND id != ?",
        {
          replacements: [username, id],
          type: QueryTypes.SELECT,
          transaction: t,
        }
      );
      if (usernameExistsResult.length > 0) {
        await t.rollback();
        return res
          .status(409)
          .json({ message: `Username "${username}" already exists.` });
      }
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    await dbHeadOffice.query(
      `UPDATE users 
       SET 
        full_name = ?, 
        status = ?, 
        username = ?, 
        email = ?, 
        phone = ?, 
        password = COALESCE(?, password),
        updated_at = SYSDATETIME()
       OUTPUT INSERTED.*
       WHERE id = ?`,
      {
        replacements: [
          full_name,
          status,
          username,
          email,
          phone,
          hashedPassword,
          id,
        ],
        type: QueryTypes.SELECT,
        transaction: t,
      }
    );

    await t.commit();

    res.json({ message: "User updated" });
  } catch (err) {
    await t.rollback();
    console.error(err);
    return res.status(500).json({ error: "Lỗi hệ thống", detail: err.message });
  }
};

const deleteUser = async (req, res) => {
  const t = await dbHeadOffice.transaction();
  try {
    const { id } = req.params;

    const [result, metadata] = await dbHeadOffice.query(
      "DELETE FROM users WHERE id = ? AND deleted_at IS NULL",
      {
        replacements: [id],
        transaction: t,
      }
    );

    if (metadata.affectedCount === 0) {
      await t.rollback();
      return res
        .status(404)
        .json({ message: "User not found or already deleted" });
    }

    await t.commit();

    res.json({ status: "success", message: "User deleted successfully" });
  } catch (err) {
    await t.rollback();
    console.error(err);
    return res.status(500).json({ error: "Lỗi hệ thống", detail: err.message });
  }
};

const userDetails = async (req, res) => {
  const t = await dbHeadOffice.transaction();
  try {
    const { id } = req.params;
    const result = await dbHeadOffice.query(
      `
      SELECT u.id, u.full_name, u.username, u.email, u.phone, u.status, u.password,
      r.id AS role_id, r.name AS role_name,
      ca.street, ca.ward, ca.district, ca.city, ca.zipcode, ca.country, ca.is_default
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      JOIN customer_address ca ON u.id = ca.user_id
      WHERE u.id = ?`,
      {
        replacements: [id],
        type: QueryTypes.SELECT,
        transaction: t,
      }
    );
    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    await t.commit();
    res.json({ data: result[0] });
  } catch (err) {
    await t.rollback();
    console.error(err);
    return res.status(500).json({ error: "Lỗi hệ thống", detail: err.message });
  }
};

module.exports = {
  userController: {
    getAllUsers,
    getUserById,
    getRoles,
    createUser,
    updateUser,
    deleteUser,
    userDetails,
  },
};
