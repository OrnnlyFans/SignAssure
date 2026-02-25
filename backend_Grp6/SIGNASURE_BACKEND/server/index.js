const express = require('express');
const cors = require('cors');
const { login } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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

