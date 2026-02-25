const mysql = require('mysql2/promise');

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

  const [rows] = await pool.query(
    `SELECT id, username, email, password
     FROM users
     WHERE (email = ? OR username = ?)
       AND password = ?
     LIMIT 1`,
    [identifier, identifier, password]
  );

  if (rows.length === 0) {
    return { success: false, message: 'Invalid account information.' };
  }

  const user = rows[0];

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

module.exports = { pool, login };

