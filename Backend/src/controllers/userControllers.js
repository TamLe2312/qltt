const { pool } = require("../config/db.js");
const handlePgError = require("../middlewares/handlePgError.js");
const bcrypt = require("bcrypt");

// const getAllUsers = async (req, res) => {
//   try {
//     const { limit, page, sortBy, sortOrder } = req.query;
//     const offset = page && limit ? (page - 1) * limit : 0;
//     const results = await pool.query(
//       `SELECT u.id, u.full_name, u.username, u.email, u.phone, u.status, r.id AS role_id, r.name AS role_name
//       FROM users u
//       JOIN user_roles ur ON u.id = ur.user_id
//       JOIN roles r ON ur.role_id = r.id
//       ORDER BY ${sortBy || "u.id"} ${sortOrder === "desc" ? "DESC" : "ASC"}
//       LIMIT $1 OFFSET $2`,
//       [limit || 20, offset]
//     );
//     const countResult = await pool.query("SELECT COUNT(*) FROM users;");
//     res.json({ data: results.rows, total: countResult.rows[0].count });
//   } catch (err) {
//     handlePgError(err, res);
//   }
// };

const getAllUsers = async (req, res) => {
  try {
    let { limit = 20, page = 1, sortField = 'u.id', sortOrder = 'desc' } = req.query;
    limit = parseInt(limit, 10);
    page = parseInt(page, 10);
    const offset = (page - 1) * limit;

    // Danh sách cột cho phép sắp xếp để tránh SQL injection
    const allowedSortFields = ['u.id', 'u.full_name', 'u.username', 'u.email', 'u.phone', 'u.status', 'r.name'];
    if (!allowedSortFields.includes(sortField)) sortField = 'u.id';
    sortOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Truy vấn danh sách người dùng với phân trang và sắp xếp
    const results = await pool.query(
      `SELECT u.id, u.full_name, u.username, u.email, u.phone, u.status,
              r.id AS role_id, r.name AS role_name
       FROM users u
       JOIN user_roles ur ON u.id = ur.user_id
       JOIN roles r ON ur.role_id = r.id
       WHERE u.deleted_at IS NULL
       ORDER BY ${sortField} ${sortOrder}
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    // Truy vấn tổng số bản ghi
    const countResult = await pool.query(`SELECT COUNT(*) AS total FROM users`);
    const total = parseInt(countResult.rows[0].total, 10);
    const totalPages = Math.ceil(total / limit);

    // Trả dữ liệu theo định dạng chuẩn
    res.json({
      data: {
        items: results.rows,
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


const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    handlePgError(err, res);
  }
};

const getRoles = async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name FROM roles ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    handlePgError(err, res);
  }
};

const createUser = async (req, res) => {
  try {
    const { full_name, status, username, email, phone, password, role_id } =
      req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (full_name, status, username, email, phone, password)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [full_name, status, username, email, phone, hashedPassword]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ message: "User creation failed" });
    }

    await pool.query(
      `INSERT INTO user_roles (user_id, role_id)
       VALUES ($1, $2)`,
      [result.rows[0].id, role_id]
    );

    res.status(201).json({ message: "User created" });
  } catch (err) {
    handlePgError(err, res);
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, status, username, email, phone, password } = req.body;
    await pool.query("BEGIN");
    const currentUserResult = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [id]
    );
    if (currentUserResult.rowCount === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({ message: "User not found" });
    }
    const currentUser = currentUserResult.rows[0];
    const newEmail = req.body.email;
    if (newEmail && newEmail !== currentUser.email) {
      const emailExistsResult = await pool.query(
        "SELECT id FROM users WHERE email = $1 AND id <> $2",
        [newEmail, id]
      );
      if (emailExistsResult.rowCount > 0) {
        await pool.query("ROLLBACK");
        return res
          .status(409)
          .json({ message: `Email "${newEmail}" already exists.` });
      }
    }

    const newUsername = req.body.username;
    if (newUsername && newUsername !== currentUser.username) {
      const usernameExistsResult = await pool.query(
        "SELECT id FROM users WHERE username = $1 AND id <> $2",
        [newUsername, id]
      );
      if (usernameExistsResult.rowCount > 0) {
        await pool.query("ROLLBACK");
        return res
          .status(409)
          .json({ message: `Username "${newUsername}" already exists.` });
      }
    }
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    const result = await pool.query(
      `UPDATE users 
       SET full_name = $1, status = $2, username = $3, email = $4, phone = $5, password = COALESCE($6, password)
         WHERE id = $7 RETURNING *`,
      [full_name, status, username, email, phone, hashedPassword, id]
    );
    await pool.query("COMMIT");
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated" });
  } catch (err) {
    handlePgError(err, res);
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Bước 1: Kiểm tra xem user có tồn tại không
    const check = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    console.log("User found:", check.rows); // để debug
    if (check.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Bước 2: Thực hiện DELETE (trigger soft delete sẽ chạy)
    const result = await pool.query("DELETE FROM users WHERE id = $1", [id]);
    console.log("Delete rowCount:", result.rowCount);

    res.json({ status: "success", message: "User deleted successfully" });
  } catch (err) {
    handlePgError(err, res);
  }
};


const userDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `
      SELECT u.id, u.full_name, u.username, u.email, u.phone, u.status, u.password,
      r.id AS role_id, r.name AS role_name,
      ca.street, ca.ward, ca.district, ca.city, ca.zipcode, ca.country, ca.is_default
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      JOIN customer_address ca ON u.id = ca.user_id
      WHERE u.id = $1`,
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ data: result.rows[0] });
  } catch (err) {
    handlePgError(err, res);
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
