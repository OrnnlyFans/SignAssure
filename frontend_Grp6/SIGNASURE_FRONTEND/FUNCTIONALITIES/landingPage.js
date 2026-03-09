document.addEventListener('DOMContentLoaded', () => {
    const getStartedBtn = document.getElementById('getStartedBtn');

    if (!getStartedBtn) return;

    getStartedBtn.addEventListener('click', (event) => {
        event.preventDefault();

        const user = window.SignaSureLogin?.getCurrentUser?.();
        if (user && user.username) {
            // Already signed in, go straight to the analysis page
            window.location.href = './homePage.html';
            return;
        }

        // Not signed in: open the sign-in modal (reuses the existing nav button behavior)
        const openSigninBtn = document.querySelector('.open-sign-in');
        if (openSigninBtn) {
            openSigninBtn.click();
        } else {
            // Fallback: navigate to the landing page with a query param so modal.js will open the sign-in modal
            window.location.href = window.location.pathname + '?signin=1';
        }
    });
});
