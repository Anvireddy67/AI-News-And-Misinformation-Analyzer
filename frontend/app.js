const API_BASE = "/api";

const form = document.getElementById("analysisForm");
const headlineInput = document.getElementById("headline");
const contentInput = document.getElementById("content");
const result = document.getElementById("result");
const history = document.getElementById("history");
const message = document.getElementById("formMessage");
const analyzeBtn = document.getElementById("analyzeBtn");
const refreshBtn = document.getElementById("refreshBtn");
const searchInput = document.getElementById("searchInput");

let historyData = [];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function labelClass(label) {
  if (label === "Likely False") return "label-likely-false";
  if (label === "Likely True") return "label-likely-true";
  return "label-needs-review";
}

function showResult(item) {
  if (!item) {
    result.innerHTML = '<div class="empty-state">No result available.</div>';
    return;
  }

  result.innerHTML = `
    <div class="result-card">
      <span class="result-label ${labelClass(item.verdict)}">${escapeHtml(item.verdict)}</span>
      <h3>${escapeHtml(item.headline)}</h3>
      <div class="score">${Number(item.confidence_score).toFixed(0)}%</div>
      <p><strong>Confidence score</strong></p>
      <p class="reason">${escapeHtml(item.explanation)}</p>
      <p class="meta">Analyzed: ${new Date(item.created_at).toLocaleString()}</p>
    </div>
  `;
}

function renderHistory(items = historyData) {
  if (!items.length) {
    history.innerHTML = '<div class="empty-state">No analyses found.</div>';
    return;
  }

  history.innerHTML = items.map(item => `
    <div class="history-item">
      <span class="result-label ${labelClass(item.verdict)}">${escapeHtml(item.verdict)}</span>
      <h3>${escapeHtml(item.headline)}</h3>
      <div class="meta">${Number(item.confidence_score).toFixed(0)}% confidence · ${new Date(item.created_at).toLocaleString()}</div>
      <p>${escapeHtml(item.explanation)}</p>
    </div>
  `).join("");
}

async function loadHistory() {
  history.innerHTML = '<div class="empty-state">Loading history...</div>';
  try {
    const response = await fetch(`${API_BASE}/analyses?limit=50`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to load history.");
    historyData = data.data;
    renderHistory();
  } catch (error) {
    history.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "";
  analyzeBtn.disabled = true;
  analyzeBtn.textContent = "Analyzing...";

  try {
    const response = await fetch(`${API_BASE}/analyses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        headline: headlineInput.value.trim(),
        content: contentInput.value.trim()
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Analysis failed.");

    showResult(data.data);
    message.textContent = "Analysis completed successfully.";
    message.className = "message success";
    form.reset();
    await loadHistory();
  } catch (error) {
    message.textContent = error.message;
    message.className = "message";
  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = "Analyze News";
  }
});

refreshBtn.addEventListener("click", loadHistory);

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = historyData.filter(item =>
    item.headline.toLowerCase().includes(query) ||
    item.content.toLowerCase().includes(query) ||
    item.verdict.toLowerCase().includes(query)
  );
  renderHistory(filtered);
});

loadHistory();
