const express = require('express');
const cors = require('cors');
const { login, signup } = require('./db');

const app = express();
// Default to 5000 to avoid clashing with typical frontend dev servers (3000).
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post('/api/signup', async (req, res) => {
  const { username, email, password } = req.body || {};

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: 'Username, email, and password are required.' });
  }

  try {
    const result = await signup(username, email, password);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (err) {
    console.error('Error during signup:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { identifier, password } = req.body || {};

  if (!identifier || !password) {
    return res
      .status(400)
      .json({ success: false, message: 'Identifier and password are required.' });
  }

  try {
    const result = await login(identifier, password);

    if (!result.success) {
      return res.status(401).json(result);
    }

    return res.json(result);
  } catch (err) {
    console.error('Error during login:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

