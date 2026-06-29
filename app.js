const STORAGE_KEY = "toptracerGolfLog.shots";
const SETTINGS_KEY = "toptracerGolfLog.settings";

const sampleShots = [
  { id: "sample-1", date: "2026-06-01", club: "Driver", carry: 214, total: 238, ballSpeed: 132, launchAngle: 13.2, side: -8, memo: "sample" },
  { id: "sample-2", date: "2026-06-08", club: "Driver", carry: 221, total: 246, ballSpeed: 136, launchAngle: 12.8, side: 5, memo: "sample" },
  { id: "sample-3", date: "2026-06-15", club: "Driver", carry: 229, total: 254, ballSpeed: 139, launchAngle: 14.1, side: 2, memo: "sample" },
  { id: "sample-4", date: "2026-06-03", club: "7I", carry: 141, total: 148, ballSpeed: 101, launchAngle: 18.5, side: -4, memo: "sample" },
  { id: "sample-5", date: "2026-06-17", club: "7I", carry: 147, total: 153, ballSpeed: 104, launchAngle: 19.1, side: 1, memo: "sample" }
];

const els = {
  tabs: document.querySelectorAll(".tab"),
  panels: document.querySelectorAll(".panel"),
  screenshotInput: document.querySelector("#screenshotInput"),
  previewWrap: document.querySelector("#previewWrap"),
  previewImage: document.querySelector("#previewImage"),
  progress: document.querySelector("#ocrProgress"),
  progressFill: document.querySelector("#progressFill"),
  progressText: document.querySelector("#progressText"),
  ocrTextWrap: document.querySelector("#ocrTextWrap"),
  ocrText: document.querySelector("#ocrText"),
  form: document.querySelector("#shotForm"),
  saveNotice: document.querySelector("#saveNotice"),
  clearFormButton: document.querySelector("#clearFormButton"),
  manualButton: document.querySelector("#manualButton"),
  sampleButton: document.querySelector("#sampleButton"),
  clubFilter: document.querySelector("#clubFilter"),
  clubList: document.querySelector("#clubList"),
  avgTotal: document.querySelector("#avgTotal"),
  maxTotal: document.querySelector("#maxTotal"),
  avgCarry: document.querySelector("#avgCarry"),
  historyList: document.querySelector("#historyList"),
  exportButton: document.querySelector("#exportButton"),
  gasUrl: document.querySelector("#gasUrl"),
  saveSettingsButton: document.querySelector("#saveSettingsButton"),
  installButton: document.querySelector("#installButton")
};

let chart;
let deferredInstallPrompt;

function today() {
  return new Date().toISOString().slice(0, 10);
}

function loadShots() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function saveShots(shots) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shots));
}

function loadSettings() {
  return JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
}

function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function showPanel(id) {
  els.panels.forEach((panel) => panel.classList.toggle("active", panel.id === id));
  els.tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.target === id));
  if (id === "historyPanel") renderHistory();
}

function setFormValues(values = {}) {
  const defaults = { date: today(), club: "", carry: "", total: "", ballSpeed: "", launchAngle: "", side: "", memo: "" };
  Object.entries({ ...defaults, ...values }).forEach(([key, value]) => {
    const input = els.form.elements[key];
    if (input) input.value = value ?? "";
  });
}

function numberValue(value) {
  const normalized = String(value ?? "").replace(/[^\d.-]/g, "");
  return normalized === "" ? "" : Number(normalized);
}

function parseOcrText(text) {
  const clean = text.replace(/[|]/g, " ").replace(/\s+/g, " ").trim();
  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const findNumberAfter = (labels) => {
    for (const label of labels) {
      const pattern = new RegExp(`${label}[^\\d-]*(-?\\d+(?:\\.\\d+)?)`, "i");
      const match = clean.match(pattern);
      if (match) return Number(match[1]);
    }
    return "";
  };

  const dateMatch = clean.match(/(20\d{2})[./-](\d{1,2})[./-](\d{1,2})/) || clean.match(/(\d{1,2})[./-](\d{1,2})[./-](20\d{2})/);
  const date = dateMatch
    ? dateMatch[1].length === 4
      ? `${dateMatch[1]}-${dateMatch[2].padStart(2, "0")}-${dateMatch[3].padStart(2, "0")}`
      : `${dateMatch[3]}-${dateMatch[1].padStart(2, "0")}-${dateMatch[2].padStart(2, "0")}`
    : today();

  const clubCandidates = ["Driver", "Dr", "1W", "3W", "5W", "UT", "Hybrid", "5I", "6I", "7I", "8I", "9I", "PW", "AW", "SW", "LW"];
  const club = clubCandidates.find((candidate) => new RegExp(`\\b${candidate}\\b`, "i").test(clean)) || "";
  const numbers = lines.flatMap((line) => [...line.matchAll(/-?\d+(?:\.\d+)?/g)].map((match) => Number(match[0])));

  return {
    date,
    club,
    carry: findNumberAfter(["carry", "キャリー"]) || numbers[0] || "",
    total: findNumberAfter(["total", "トータル", "distance", "距離"]) || numbers[1] || "",
    ballSpeed: findNumberAfter(["ball speed", "ball", "初速"]) || "",
    launchAngle: findNumberAfter(["launch angle", "launch", "打ち出し", "打出"]) || "",
    side: findNumberAfter(["side", "offline", "左右", "ブレ"]) || ""
  };
}

async function runOcr(file) {
  if (!window.Tesseract) {
    alert("Tesseract.jsを読み込めませんでした。通信環境を確認するか、手入力してください。");
    return;
  }

  els.progress.hidden = false;
  els.progressFill.style.width = "0%";
  els.progressText.textContent = "OCR準備中...";

  const result = await Tesseract.recognize(file, "eng+jpn", {
    logger: (message) => {
      if (message.status) els.progressText.textContent = message.status;
      if (message.progress) els.progressFill.style.width = `${Math.round(message.progress * 100)}%`;
    }
  });

  const text = result.data.text || "";
  els.ocrText.textContent = text;
  els.ocrTextWrap.hidden = false;
  setFormValues(parseOcrText(text));
  showPanel("confirmPanel");
}

function getFormShot() {
  const data = new FormData(els.form);
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    createdAt: new Date().toISOString(),
    date: data.get("date"),
    club: String(data.get("club") || "").trim(),
    carry: numberValue(data.get("carry")),
    total: numberValue(data.get("total")),
    ballSpeed: numberValue(data.get("ballSpeed")),
    launchAngle: numberValue(data.get("launchAngle")),
    side: numberValue(data.get("side")),
    memo: String(data.get("memo") || "").trim()
  };
}

async function postToGas(shot) {
  const { gasUrl } = loadSettings();
  if (!gasUrl) return "local-only";

  await fetch(gasUrl, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(shot)
  });
  return "sent";
}

function uniqueClubs(shots) {
  return [...new Set(shots.map((shot) => shot.club).filter(Boolean))].sort();
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function renderClubOptions(shots) {
  const selectedClub = els.clubFilter.value;
  const clubs = uniqueClubs(shots);
  els.clubFilter.innerHTML = `<option value="">すべてのクラブ</option>${clubs.map((club) => `<option value="${escapeHtml(club)}">${escapeHtml(club)}</option>`).join("")}`;
  els.clubFilter.value = clubs.includes(selectedClub) ? selectedClub : "";
  els.clubList.innerHTML = clubs.map((club) => `<option value="${escapeHtml(club)}"></option>`).join("");
}

function formatYards(value) {
  return Number.isFinite(value) ? `${Math.round(value)} yd` : "-";
}

function filteredShots() {
  const club = els.clubFilter.value;
  return loadShots()
    .filter((shot) => !club || shot.club === club)
    .sort((a, b) => a.date.localeCompare(b.date));
}

function renderStats(shots) {
  const totals = shots.map((shot) => Number(shot.total)).filter(Number.isFinite);
  const carries = shots.map((shot) => Number(shot.carry)).filter(Number.isFinite);
  const average = (values) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : NaN;
  els.avgTotal.textContent = formatYards(average(totals));
  els.maxTotal.textContent = formatYards(totals.length ? Math.max(...totals) : NaN);
  els.avgCarry.textContent = formatYards(average(carries));
}

function renderChart(shots) {
  const context = document.querySelector("#growthChart");
  if (!window.Chart || !context) return;
  if (chart) chart.destroy();
  chart = new Chart(context, {
    type: "line",
    data: {
      labels: shots.map((shot) => shot.date),
      datasets: [
        { label: "トータル", data: shots.map((shot) => shot.total || null), borderColor: "#0b6b58", backgroundColor: "rgba(11, 107, 88, 0.14)", tension: 0.25 },
        { label: "キャリー", data: shots.map((shot) => shot.carry || null), borderColor: "#d99b2b", backgroundColor: "rgba(217, 155, 43, 0.12)", tension: 0.25 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { title: { display: true, text: "yd" } } },
      plugins: { legend: { position: "bottom" } }
    }
  });
}

function renderHistoryList(shots) {
  els.historyList.innerHTML = shots.length
    ? shots.map((shot) => `
      <article class="history-item">
        <div>
          <h3>${escapeHtml(shot.date)} / ${escapeHtml(shot.club || "未設定")}</h3>
          <p>Carry ${escapeHtml(shot.carry || "-")} yd / Total ${escapeHtml(shot.total || "-")} yd / Ball ${escapeHtml(shot.ballSpeed || "-")} mph / Launch ${escapeHtml(shot.launchAngle || "-")}° / Side ${escapeHtml(shot.side || "-")} yd</p>
          ${shot.memo ? `<p>${escapeHtml(shot.memo)}</p>` : ""}
        </div>
        <button type="button" data-delete="${escapeHtml(shot.id)}">削除</button>
      </article>
    `).join("")
    : `<p class="notice">まだデータがありません。スクショ読み取り、手入力、またはサンプル追加で始められます。</p>`;
}

function renderHistory() {
  const shots = loadShots();
  renderClubOptions(shots);
  const selected = filteredShots();
  renderStats(selected);
  renderChart(selected);
  renderHistoryList(selected);
}

function downloadCsv() {
  const rows = [["date", "club", "carry", "total", "ballSpeed", "launchAngle", "side", "memo"], ...filteredShots().map((shot) => [shot.date, shot.club, shot.carry, shot.total, shot.ballSpeed, shot.launchAngle, shot.side, shot.memo])];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "toptracer-golf-log.csv";
  link.click();
  URL.revokeObjectURL(url);
}

els.tabs.forEach((tab) => tab.addEventListener("click", () => showPanel(tab.dataset.target)));
els.manualButton.addEventListener("click", () => {
  setFormValues();
  showPanel("confirmPanel");
});
els.clearFormButton.addEventListener("click", () => setFormValues());

els.screenshotInput.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  els.previewImage.src = URL.createObjectURL(file);
  els.previewWrap.hidden = false;
  runOcr(file).catch((error) => {
    console.error(error);
    els.progressText.textContent = "OCRに失敗しました。手入力で保存できます。";
    showPanel("confirmPanel");
  });
});

els.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const shot = getFormShot();
  const shots = loadShots();
  shots.push(shot);
  saveShots(shots);
  renderClubOptions(shots);
  els.saveNotice.textContent = "端末に保存しました。Googleスプレッドシートへ送信中...";
  try {
    const result = await postToGas(shot);
    els.saveNotice.textContent = result === "sent" ? "保存しました。Apps Scriptへ送信しました。" : "保存しました。Apps Script URL未設定のため端末内のみです。";
  } catch (error) {
    console.error(error);
    els.saveNotice.textContent = "端末には保存しました。Apps Script送信は失敗したため、設定URLを確認してください。";
  }
  showPanel("historyPanel");
});

els.sampleButton.addEventListener("click", () => {
  const existing = loadShots();
  const withoutOldSamples = existing.filter((shot) => !String(shot.id).startsWith("sample-"));
  saveShots([...withoutOldSamples, ...sampleShots]);
  renderHistory();
});

els.historyList.addEventListener("click", (event) => {
  const id = event.target?.dataset?.delete;
  if (!id) return;
  saveShots(loadShots().filter((shot) => shot.id !== id));
  renderHistory();
});

els.clubFilter.addEventListener("change", renderHistory);
els.exportButton.addEventListener("click", downloadCsv);

els.saveSettingsButton.addEventListener("click", () => {
  saveSettings({ gasUrl: els.gasUrl.value.trim() });
  els.saveSettingsButton.textContent = "保存済み";
  setTimeout(() => { els.saveSettingsButton.textContent = "設定を保存"; }, 1200);
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  els.installButton.hidden = false;
});

els.installButton.addEventListener("click", async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  els.installButton.hidden = true;
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(console.error));
}

const settings = loadSettings();
els.gasUrl.value = settings.gasUrl || "";
setFormValues();
renderClubOptions(loadShots());
