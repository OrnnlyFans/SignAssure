// Simple signup logic that stores users in browser localStorage.
// Data shape in localStorage:
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

  function saveUsers(users) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
      return true;
    } catch (err) {
      console.error('Failed to save users to localStorage:', err);
      return false;
    }
  }

  /**
   * Sign up a new user and store them in localStorage.
   * @param {{ username: string, email: string, password: string }} data
   * @returns {{ success: boolean, message: string }}
   */
  function signup(data) {
    if (!data || !data.username || !data.email || !data.password) {
      return { success: false, message: 'Username, email, and password are required.' };
    }

    const username = String(data.username).trim();
    const email = String(data.email).trim().toLowerCase();
    const password = String(data.password);

    if (!username || !email || !password) {
      return { success: false, message: 'All fields must be non-empty.' };
    }

    const users = loadUsers();

    // Check if username or email already exists
    const exists = users.some(
      (u) =>
        u.username.toLowerCase() === username.toLowerCase() ||
        u.email.toLowerCase() === email
    );

    if (exists) {
      return { success: false, message: 'Username or email already exists.' };
    }

    users.push({ username, email, password });

    if (!saveUsers(users)) {
      return { success: false, message: 'Failed to save user. Please try again.' };
    }

    return { success: true, message: 'Signup successful.' };
  }

  // Optional helper: clear all registered users (for debugging)
  function clearAllUsers() {
    localStorage.removeItem(STORAGE_KEY);
  }

  // Expose to global scope so you can call it from your pages:
  // example: window.SignaSureSignup.signup({ username, email, password })
  window.SignaSureSignup = {
    signup,
    loadUsers,
    clearAllUsers,
  };
})();

