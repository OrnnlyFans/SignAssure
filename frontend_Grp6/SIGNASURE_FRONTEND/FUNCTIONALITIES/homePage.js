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

const downloadBtn = document.getElementById('downloadReportBtn');
const resultCard = document.getElementById('resultCard');
const percentEl = document.getElementById('resultPercent');
const headlineEl = document.getElementById('resultHeadline');
const detailEl = document.getElementById('resultDetail');
const ringEl = document.querySelector('.ring');

function setProgress(percent) {
    const clamped = Math.max(0, Math.min(100, percent));
    percentEl.textContent = `${clamped.toFixed(1)}%`;

    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (clamped / 100) * circumference;
    if (ringEl) {
        ringEl.style.strokeDashoffset = offset;
        ringEl.style.stroke = clamped > 65 ? '#ffb300' : '#4caf50';
    }
}

function getMessage(percent) {
    if (percent >= 70) {
        return {
            title: 'Careful, it might be forgery!',
            detail: `You’ve uploaded a signature with a ${percent.toFixed(1)}% chance of being forged.`,
        };
    }
    if (percent >= 40) {
        return {
            title: 'Suspicious signature detected',
            detail: `The model finds a ${percent.toFixed(1)}% likelihood of forgery. Proceed with caution.`,
        };
    }
    return {
        title: 'Likely genuine signature',
        detail: `The signature is ${percent.toFixed(1)}% likely to be genuine based on our model.`,
    };
}

function buildReportText(percent, label, score) {
    const status = label === 'FORGED' ? 'Likely Forged' : label === 'GENUINE' ? 'Likely Genuine' : label;
    return [
        'Signature Analysis Report',
        '========================',
        `Result: ${status}`,
        `Forgery Likelihood: ${percent.toFixed(1)}%`,
        `Model Score: ${score}`,
        '',
        'Interpretation:',
        `- ${headlineEl.textContent}`,
        '',
        'Note: This is an automated analysis; treat it as a reference, not a final decision.',
    ].join('\n');
}

function downloadPdfReport(reportText) {
    const reportHtml = `
        <html>
          <head>
            <title>Signature Analysis Report</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 24px; }
              h1 { font-size: 24px; margin-bottom: 16px; }
              pre { white-space: pre-wrap; font-size: 14px; }
            </style>
          </head>
          <body>
            <h1>Signature Analysis Report</h1>
            <pre>${reportText}</pre>
          </body>
        </html>
      `;

    const win = window.open('', '_blank');
    if (!win) {
        alert('Unable to open report window. Please allow pop-ups.');
        return;
    }

    win.document.write(reportHtml);
    win.document.close();
    win.focus();
    win.print();
}

function setDownloadEnabled(enabled, reportText) {
    if (!downloadBtn) return;
    downloadBtn.disabled = !enabled;
    downloadBtn.onclick = enabled ? () => downloadPdfReport(reportText) : null;
}

function resetResults() {
    setProgress(0);
    headlineEl.textContent = 'Upload a signature to see the chance of forgery.';
    detailEl.textContent = 'The analysis result will appear here once the model has finished running.';
    setDownloadEnabled(false);
}

// Initialize defaults
resetResults();

// Call AI backend to analyze signature
document.getElementById('analyzeBtn').addEventListener('click', async () => {
    const input = document.getElementById('signatureInput');

    if (!input.files[0]) {
        alert('Please upload a signature image first.');
        return;
    }

    resultCard?.classList.remove('result-card-hidden');
    headlineEl.textContent = 'Analyzing…';
    detailEl.textContent = 'Please wait while we evaluate the signature.';
    setProgress(0);
    setDownloadEnabled(false);

    const formData = new FormData();
    formData.append('file', input.files[0]);

    try {
        const response = await fetch('http://localhost:8000/predict', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            headlineEl.textContent = 'Analysis failed';
            detailEl.textContent = 'Could not reach the AI server. Please try again later.';
            return;
        }

        const data = await response.json();
        const label = (data.label || '').toString().toUpperCase();
        const score = typeof data.score === 'number' ? data.score : Number(data.score) || 0;
        const percent = Math.min(100, Math.max(0, score * 100));

        setProgress(percent);
        const message = getMessage(percent);
        headlineEl.textContent = message.title;
        detailEl.textContent = message.detail;

        const reportText = buildReportText(percent, label, score);
        setDownloadEnabled(true, reportText);
    } catch (err) {
        headlineEl.textContent = 'Analysis error';
        detailEl.textContent = 'An unexpected error occurred: ' + err.message;
    }
});
