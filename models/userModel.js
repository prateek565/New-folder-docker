const pool = require("../config/db");

// Create a new user
const createUser = async (username, email, hashedPassword) => {
  const result = await pool.query(
    "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id",
    [username, email, hashedPassword]
  );
  return result.rows[0].id;
};

// Get user by email
const getUserByEmail = async (email) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return result.rows[0];
};

module.exports = { createUser, getUserByEmail };
