// Signup helper that sends signup requests to the backend API.
// The server stores users in MySQL (via /api/signup).

(function () {
  const API_BASE = 'http://localhost:5000';

  /**
   * Sign up a new user via the backend.
   * @param {{ username: string, email: string, password: string }} data
   * @returns {Promise<{ success: boolean, message: string, user?: { username: string, email: string } }>}
   */
  async function signup(data) {
    if (!data || !data.username || !data.email || !data.password) {
      return { success: false, message: 'Username, email, and password are required.' };
    }

    const payload = {
      username: String(data.username).trim(),
      email: String(data.email).trim().toLowerCase(),
      password: String(data.password),
    };

    if (!payload.username || !payload.email || !payload.password) {
      return { success: false, message: 'All fields must be non-empty.' };
    }

    try {
      const response = await fetch(`${API_BASE}/api/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        return {
          success: false,
          message: (result && result.message) || 'Failed to create account.',
        };
      }

      return {
        success: true,
        message: result.message || 'Signup successful.',
        user: {
          username: result.user?.username,
          email: result.user?.email,
        },
      };
    } catch (err) {
      console.error('Signup request failed:', err);
      return { success: false, message: 'Unable to reach signup server.' };
    }
  }

  // Expose to global scope so you can call it from your pages:
  // example: await window.SignaSureSignup.signup({ username, email, password })
  window.SignaSureSignup = {
    signup,
  };
})();

