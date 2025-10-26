const { QueryTypes } = require("sequelize");
const { dbHeadOffice, getDbByBranchId } = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function login(req, res) {
  const t = await dbHeadOffice.transaction();
  try {
    const { username, password } = req.body;
    const user = await dbHeadOffice.query(
      `SELECT u.id, u.username, r.name AS role, r.id AS role_id, u.password
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE u.username = ?`,
      {
        replacements: [username],
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
      userId: user[0].id,
      username: user[0].username,
      role: user[0].role,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION_TIME,
    });

    return res
      .status(200)
      .json({ message: "Login successful", accessToken: accessToken });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function register(req, res) {
  // Registration logic here
}

async function logout(req, res) {
  // Logout logic here
}
module.exports = {
  authController: {
    login,
    register,
    logout,
  },
};
