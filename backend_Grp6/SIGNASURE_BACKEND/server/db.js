const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'signasure',
});

async function login(identifier, password) {
  if (!identifier || !password) {
    return { success: false, message: 'Identifier and password are required.' };
  }

  const normalized = String(identifier).trim();
  const [rows] = await pool.query(
    `SELECT id, username, email, password
     FROM users
     WHERE email = ? OR username = ?
     LIMIT 1`,
    [normalized, normalized]
  );

  if (rows.length === 0) {
    return { success: false, message: 'Invalid account information.' };
  }

  const user = rows[0];

  // Support both bcrypt-hashed passwords (new) and plain-text passwords (legacy).
  let passwordMatch = false;
  if (typeof user.password === 'string' && user.password.startsWith('$2')) {
    passwordMatch = await bcrypt.compare(password, user.password);
  } else {
    passwordMatch = password === user.password;
  }

  if (!passwordMatch) {
    return { success: false, message: 'Invalid account information.' };
  }

  return {
    success: true,
    message: 'Login successful.',
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
  };
}

async function signup(username, email, password) {
  if (!username || !email || !password) {
    return { success: false, message: 'Username, email, and password are required.' };
  }

  const normalizedUsername = String(username).trim();
  const normalizedEmail = String(email).trim().toLowerCase();

  // Ensure username/email are not already taken
  const [existing] = await pool.query(
    `SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1`,
    [normalizedUsername, normalizedEmail]
  );

  if (existing.length > 0) {
    return { success: false, message: 'Username or email already exists.' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const [result] = await pool.query(
    `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
    [normalizedUsername, normalizedEmail, hashedPassword]
  );

  return {
    success: true,
    message: 'Signup successful.',
    user: {
      id: result.insertId,
      username: normalizedUsername,
      email: normalizedEmail,
    },
  };
}

module.exports = { pool, login, signup };

