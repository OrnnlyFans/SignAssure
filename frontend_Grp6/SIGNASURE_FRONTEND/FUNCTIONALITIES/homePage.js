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

// Initialize single upload
setupUpload("signatureBox", "signatureInput", "signaturePreview");

// Call AI backend to analyze signature
document.getElementById("analyzeBtn").addEventListener("click", async () => {
    const input = document.getElementById("signatureInput");
    const resultEl = document.getElementById("analysisResult");

    if (!input.files[0]) {
        alert("Please upload a signature image first.");
        return;
    }

    resultEl.textContent = "Analyzing...";

    const formData = new FormData();
    formData.append("file", input.files[0]);

    try {
        const response = await fetch("http://localhost:8000/predict", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            resultEl.textContent = "Error: could not reach AI server.";
            return;
        }

        const data = await response.json();
        const label = (data.label || "").toString().toUpperCase();
        const score = typeof data.score === "number" ? data.score.toFixed(3) : data.score;

        resultEl.textContent = `Prediction: ${label} (score: ${score})`;
    } catch (err) {
        resultEl.textContent = "Error: " + err.message;
    }
});