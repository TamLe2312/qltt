const { QueryTypes } = require("sequelize");
const { dbHeadOffice, getDbByBranchId } = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function login(req, res) {
  const t = await dbHeadOffice.transaction();
  try {
    const { email, password } = req.body;
    const user = await dbHeadOffice.query(
      `SELECT u.id, u.full_name, u.username, u.phone, r.name AS role, r.id AS role_id, u.password
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE u.email = ?`,
      {
        replacements: [email],
        type: QueryTypes.SELECT,
        transaction: t,
      }
    );

    if (user.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user[0].password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Mật khẩu không chính xác" });
    }

    const payload = {
      id: user[0].id,
      full_name: user[0].full_name,
      username: user[0].username,
      email: email,
      phone: user[0].phone,
      roleId: user[0].role_id,
      role: user[0].role,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION_TIME,
    });

    return res.status(200).json({
      message: "Login successful",
      accessToken: accessToken,
      user: {
        id: user[0].id,
        full_name: user[0].full_name,
        username: user[0].username,
        email: email,
        phone: user[0].phone,
        roleId: user[0].role_id,
        role: user[0].role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function register(req, res) {
  const t = await dbHeadOffice.transaction();
  try {
    const { full_name, username, password, email, phone } = req.body;

    const emailExistsResult = await dbHeadOffice.query(
      "SELECT id FROM users WHERE email = ? AND deleted_at IS NULL",
      {
        replacements: [email],
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

    const usernameExistsResult = await dbHeadOffice.query(
      "SELECT id FROM users WHERE username = ? AND deleted_at IS NULL",
      {
        replacements: [username],
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

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await dbHeadOffice.query(
      `INSERT INTO users (full_name, username, password, email, phone)
      OUTPUT INSERTED.id
      VALUES (?, ?, ?, ?, ?)`,
      {
        replacements: [full_name, username, hashedPassword, email, phone],
        type: QueryTypes.SELECT,
        transaction: t,
      }
    );

    if (!newUser || newUser.length === 0) {
      throw new Error("User creation failed, no ID returned.");
    }
    const newUserId = newUser[0].id;
    const defaultRoleId = 2;

    await dbHeadOffice.query(
      `INSERT INTO user_roles (user_id, role_id)
       VALUES (?, ?)`,
      {
        replacements: [newUserId, defaultRoleId],
        type: QueryTypes.INSERT,
        transaction: t,
      }
    );

    const role = await dbHeadOffice.query(
      `SELECT name FROM roles WHERE id = ?`,
      {
        replacements: [defaultRoleId],
        type: QueryTypes.SELECT,
        transaction: t,
      }
    );

    const payload = {
      id: newUserId,
      full_name: full_name,
      username: username,
      email: email,
      phone: phone,
      roleId: defaultRoleId,
      role: role[0].name,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION_TIME,
    });

    await t.commit();
    return res.status(201).json({
      message: "User registered successfully",
      token: accessToken,
      user: {
        id: newUserId,
        full_name: full_name,
        username: username,
        email: email,
        phone: phone,
        roleId: defaultRoleId,
        role: role[0].name,
      },
    });
  } catch (err) {
    await t.rollback();
    console.error(err);
    return res.status(500).json({ error: "Lỗi hệ thống", detail: err.message });
  }
}

module.exports = {
  authController: {
    login,
    register,
  },
};
