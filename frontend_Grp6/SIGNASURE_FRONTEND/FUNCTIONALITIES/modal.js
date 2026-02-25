// Modal functionality
document.addEventListener('DOMContentLoaded', function() {
    const modalOverlay = document.getElementById('modalOverlay');
    const navAuth = document.getElementById('nav-auth');

    // ---------- NAVBAR: Show username + logout when logged in ----------
    function updateNavbar() {
        if (!navAuth) return;
        const user = window.SignaSureLogin && window.SignaSureLogin.getCurrentUser
            ? window.SignaSureLogin.getCurrentUser()
            : null;

        if (user && user.username) {
            navAuth.innerHTML = '<span class="nav-username">' + escapeHtml(user.username) + '</span> <a href="#" class="btn-outline" id="nav-logout-btn">Logout</a>';
            const logoutBtn = document.getElementById('nav-logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    if (window.SignaSureLogin && window.SignaSureLogin.logout) {
                        window.SignaSureLogin.logout();
                        updateNavbar();
                    }
                });
            }
        } else {
            navAuth.innerHTML = '<a href="#" class="btn-outline open-sign-in">Sign In</a>';
            // Re-attach click handler for Sign In
            const signInBtn = navAuth.querySelector('.open-sign-in');
            if (signInBtn) {
                signInBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    openSignIn();
                });
            }
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    const signInModal = document.getElementById('signInModal');
    const signUpModal = document.getElementById('signUpModal');
    const closeBtns = document.querySelectorAll('.close-btn');
    const toSignUpLink = document.getElementById('toSignUp');
    const toSignInLink = document.getElementById('toSignIn');
    const openSignInBtns = document.querySelectorAll('.open-sign-in');
    const openSignUpBtns = document.querySelectorAll('.open-sign-up');
    const eyeIcons = document.querySelectorAll('.eye-icon');
    const passwordInputs = document.querySelectorAll('input[type="password"]');

    // Open Sign In Modal
    function openSignIn() {
        modalOverlay.classList.add('active');
        signInModal.classList.remove('hidden');
        signUpModal.classList.add('hidden');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    // Open Sign Up Modal
    function openSignUp() {
        modalOverlay.classList.add('active');
        signUpModal.classList.remove('hidden');
        signInModal.classList.add('hidden');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    // Close Modal
    function closeModal() {
        modalOverlay.classList.remove('active');
        signInModal.classList.add('hidden');
        signUpModal.classList.add('hidden');
        document.body.style.overflow = ''; // Restore scrolling
    }

    // Event Listeners for opening modals
    openSignInBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            openSignIn();
        });
    });

    openSignUpBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            openSignUp();
        });
    });

    // Event Listeners for closing modals
    closeBtns.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    // Close modal when clicking overlay
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    // Switch between Sign In and Sign Up
    if (toSignUpLink) {
        toSignUpLink.addEventListener('click', function(e) {
            e.preventDefault();
            openSignUp();
        });
    }

    if (toSignInLink) {
        toSignInLink.addEventListener('click', function(e) {
            e.preventDefault();
            openSignIn();
        });
    }

    // Toggle password visibility
    eyeIcons.forEach((icon, index) => {
        icon.addEventListener('click', function() {
            const passwordInput = passwordInputs[index];
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.textContent = '🙈';
            } else {
                passwordInput.type = 'password';
                icon.textContent = '👁';
            }
        });
    });

    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
            closeModal();
        }
    });

    // Update navbar on load (show username + logout if logged in)
    updateNavbar();

    // If redirected from protected page, open sign-in modal
    const params = new URLSearchParams(window.location.search);
    if (params.get('signin') === '1') {
        openSignIn();
        // Clean URL without reload
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // ---------- SIMPLE MESSAGING ----------
    function showMessage(message) {
        alert(message);
    }

    // ---------- SIGN UP HANDLER ----------
    const signupBtn = document.getElementById('signup-submit-btn');
    if (signupBtn) {
        signupBtn.addEventListener('click', function () {
            const usernameInput = document.getElementById('signup-username');
            const emailInput = document.getElementById('signup-email');
            const passwordInput = document.getElementById('signup-password');
            const confirmPasswordInput = document.getElementById('signup-confirm-password');

            const username = usernameInput?.value.trim();
            const email = emailInput?.value.trim();
            const password = passwordInput?.value;
            const confirmPassword = confirmPasswordInput?.value;

            if (!username || !email || !password || !confirmPassword) {
                showMessage('Please fill in all fields.');
                return;
            }
            if (password !== confirmPassword) {
                showMessage('Passwords do not match.');
                return;
            }

            if (!window.SignaSureSignup || !window.SignaSureSignup.signup) {
                console.error('SignaSureSignup is not loaded', window.SignaSureSignup);
                showMessage('Signup script not loaded. Make sure BACKEND/signupPage.js is included.');
                return;
            }

            const result = window.SignaSureSignup.signup({ username, email, password });
            showMessage(result.message);

            if (result.success) {
                // Clear fields and switch to sign in
                usernameInput.value = '';
                emailInput.value = '';
                passwordInput.value = '';
                confirmPasswordInput.value = '';
                openSignIn();
            }
        });
    }

    // ---------- LOGIN HANDLER ----------
    const signinBtn = document.getElementById('signin-submit-btn');
    if (signinBtn) {
        signinBtn.addEventListener('click', async function () {
            const emailInput = document.getElementById('signin-email');
            const passwordInput = document.getElementById('signin-password');

            const email = emailInput?.value.trim();
            const password = passwordInput?.value;

            if (!email || !password) {
                showMessage('Please fill in both email and password.');
                return;
            }

            if (!window.SignaSureLogin || !window.SignaSureLogin.login) {
                console.error('SignaSureLogin is not loaded', window.SignaSureLogin);
                showMessage('Login script not loaded. Make sure BACKEND/login.js is included.');
                return;
            }

            try {
                const result = await window.SignaSureLogin.login({ email, password });
                showMessage(result.message);

                if (result.success) {
                    emailInput.value = '';
                    passwordInput.value = '';
                    closeModal();
                    updateNavbar(); // Show username + logout in navbar
                }
            } catch (err) {
                console.error('Login failed:', err);
                showMessage('An unexpected error occurred during login.');
            }
        });
    }

});
