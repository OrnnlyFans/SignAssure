// Simple login logic that checks users stored in browser localStorage.
// Must use the same storage key/shape as signupPage.js:
// key: "signaSureUsers"
// value: JSON string of array: [{ username, email, password }, ...]

(function () {
  const STORAGE_KEY = 'signaSureUsers';

  function loadUsers() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error('Failed to read users from localStorage:', err);
      return [];
    }
  }

  /**
   * Login with email + password or username + password.
   * You can pass either:
   *  - { email, password }
   *  - { username, password }
   *
   * @param {{ email?: string, username?: string, password: string }} data
   * @returns {{ success: boolean, message: string, user?: { username: string, email: string } }}
   */
  function login(data) {
    if (!data || !data.password || (!data.email && !data.username)) {
      return { success: false, message: 'Email/username and password are required.' };
    }

    const password = String(data.password);
    const email = data.email ? String(data.email).trim().toLowerCase() : null;
    const username = data.username ? String(data.username).trim().toLowerCase() : null;

    const users = loadUsers();

    const user = users.find((u) => {
      const uEmail = (u.email || '').toLowerCase();
      const uUsername = (u.username || '').toLowerCase();

      const idMatch =
        (email && uEmail === email) ||
        (username && uUsername === username);

      return idMatch && u.password === password;
    });

    if (!user) {
      return { success: false, message: 'Invalid account information.' };
    }

    // Optionally store current logged-in user
    try {
      localStorage.setItem(
        'signaSureCurrentUser',
        JSON.stringify({ username: user.username, email: user.email })
      );
    } catch (err) {
      console.error('Failed to store current user:', err);
    }

    return {
      success: true,
      message: 'Login successful.',
      user: {
        username: user.username,
        email: user.email,
      },
    };
  }

  const CURRENT_USER_KEY = 'signaSureCurrentUser';

  function getCurrentUser() {
    try {
      const raw = localStorage.getItem(CURRENT_USER_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      return null;
    }
  }

  function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    return { success: true };
  }

  // Expose to global scope so you can call it from your pages:
  // example: window.SignaSureLogin.login({ email, password })
  window.SignaSureLogin = {
    login,
    loadUsers,
    getCurrentUser,
    logout,
  };
})();

