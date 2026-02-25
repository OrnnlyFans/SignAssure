// Require login to access Analyze Signature page
(function checkAuth() {
    const user = window.SignaSureLogin && window.SignaSureLogin.getCurrentUser
        ? window.SignaSureLogin.getCurrentUser()
        : null;
    if (!user || !user.username) {
        window.location.replace('./landingPage.html?signin=1');
        return;
    }
})();

function setupUpload(boxId, inputId, previewId) {
    const box = document.getElementById(boxId);
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    const button = box.querySelector("button");

    // Click box opens file
    box.addEventListener("click", () => input.click());
    button.addEventListener("click", (e) => {
        e.stopPropagation();
        input.click();
    });

    // File selected
    input.addEventListener("change", () => {
        const file = input.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.src = e.target.result;
                preview.style.display = "block";
                box.querySelector(".upload-content").style.display = "none";
            };
            reader.readAsDataURL(file);
        }
    });

    // Drag & drop
    box.addEventListener("dragover", (e) => {
        e.preventDefault();
        box.style.borderColor = "black";
    });

    box.addEventListener("dragleave", () => {
        box.style.borderColor = "#ccc";
    });

    box.addEventListener("drop", (e) => {
        e.preventDefault();
        box.style.borderColor = "#ccc";
        const file = e.dataTransfer.files[0];
        input.files = e.dataTransfer.files;

        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = "block";
            box.querySelector(".upload-content").style.display = "none";
        };
        reader.readAsDataURL(file);
    });
}

// Initialize both uploads
setupUpload("originalBox", "originalInput", "originalPreview");
setupUpload("questionedBox", "questionedInput", "questionedPreview");

// Fake analyze action
document.getElementById("analyzeBtn").addEventListener("click", () => {
    alert("Analysis feature will connect to AI backend here.");
});