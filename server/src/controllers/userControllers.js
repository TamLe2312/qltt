import pool from "../config/db.js";
import handlePgError from "../middlewares/handlePgError.js";
import bcrypt from "bcrypt";

const getAllUsers = async (req, res) => {
  try {
    const { limit, page } = req.query;
    const offset = page && limit ? (page - 1) * limit : 0;
    const result = await pool.query(
      "SELECT * FROM users ORDER BY id LIMIT $1 OFFSET $2",
      [limit || 20, offset]
    );
    res.json(result.rows);
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

const createUser = async (req, res) => {
  try {
    const { full_name, status, username, email, phone, password, role } =
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
      [result.rows[0].id, role]
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
    const result = await pool.query("DELETE FROM users WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted" });
  } catch (err) {
    handlePgError(err, res);
  }
};

export const userController = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
