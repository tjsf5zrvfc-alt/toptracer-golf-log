const STORAGE_VERSION = "1.2";
const REAL_SHOTS_KEY = "toptracerGolfLog.v12.realShots";
const SAMPLE_SHOTS_KEY = "toptracerGolfLog.v12.sampleShots";
const SESSIONS_KEY = "toptracerGolfLog.v12.sessions";
const SAMPLE_SESSIONS_KEY = "toptracerGolfLog.v12.sampleSessions";
const SETTINGS_KEY = "toptracerGolfLog.settings";
const TARGETS_KEY = "toptracerGolfLog.v12.targets";
const CHECKLIST_KEY = "toptracerGolfLog.v12.checklist";
const CURRENT_SESSION_KEY = "toptracerGolfLog.v12.currentSessionId";

const DEFAULT_CLUBS = ["Driver", "5W", "4U", "6I", "7I", "8I", "9I", "PW", "50°", "56°"];
const PRACTICE_THEMES = ["ドライバー", "アイアン", "ウェッジ", "アプローチ", "飛距離アップ", "ミート率向上", "その他"];
const RATINGS = {
  good: "ナイス",
  normal: "普通",
  miss: "ミス"
};

const defaultTargets = {
  Driver: 220,
  "5W": 190,
  "4U": 175,
  "6I": 150,
  "7I": 140,
  "8I": 135,
  "9I": 125,
  PW: 110,
  "50°": 95,
  "56°": 80
};

const defaultChecklist = {
  ドライバー: ["力まない", "左手を絞る", "右肩を引く", "トップで間を作る"],
  アイアン: ["右手は下に落とす", "左手は最短距離", "左肩が開く前に入れ替える"]
};

const sampleSessions = [
  {
    id: "sample-session-driver",
    date: "2026-07-05",
    name: "2026/07/05 打ちっぱなし",
    theme: "ドライバー",
    memo: "ミート率向上。トップで間を作る。",
    nextTask: "右肩を引いたまま切り返す。",
    isSample: true
  },
  {
    id: "sample-session-iron",
    date: "2026-07-18",
    name: "2026/07/18 ラウンド前練習",
    theme: "アイアン",
    memo: "左肩が開く前に入れ替える。",
    nextTask: "8Iの方向性を優先。",
    isSample: true
  }
];

const sampleShots = [
  { id: "sample-1", sessionId: "sample-session-driver", date: "2026-07-05", club: "Driver", carry: 214, total: 238, ballSpeed: 132, launchAngle: 13.2, side: -8, rating: "normal", memo: "やや右" },
  { id: "sample-2", sessionId: "sample-session-driver", date: "2026-07-05", club: "Driver", carry: 221, total: 246, ballSpeed: 136, launchAngle: 12.8, side: 5, rating: "good", memo: "芯" },
  { id: "sample-3", sessionId: "sample-session-driver", date: "2026-07-05", club: "Driver", carry: 229, total: 254, ballSpeed: 139, launchAngle: 14.1, side: 2, rating: "good", memo: "ベスト" },
  { id: "sample-4", sessionId: "sample-session-driver", date: "2026-07-05", club: "Driver", carry: 202, total: 225, ballSpeed: 126, launchAngle: 11.8, side: -16, rating: "miss", memo: "ひっかけ" },
  { id: "sample-5", sessionId: "sample-session-iron", date: "2026-07-18", club: "8I", carry: 132, total: 138, ballSpeed: 96, launchAngle: 20.5, side: -4, rating: "normal", memo: "" },
  { id: "sample-6", sessionId: "sample-session-iron", date: "2026-07-18", club: "8I", carry: 137, total: 143, ballSpeed: 99, launchAngle: 19.8, side: 1, rating: "good", memo: "" },
  { id: "sample-7", sessionId: "sample-session-iron", date: "2026-07-18", club: "PW", carry: 106, total: 110, ballSpeed: 84, launchAngle: 24.2, side: 3, rating: "normal", memo: "" }
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
  manualEntryButton: document.querySelector("#manualEntryButton"),
  clubSelect: document.querySelector("#clubSelect"),
  sampleButton: document.querySelector("#sampleButton"),
  deleteSamplesButton: document.querySelector("#deleteSamplesButton"),
  dataModeFilter: document.querySelector("#dataModeFilter"),
  sessionFilter: document.querySelector("#sessionFilter"),
  clubFilter: document.querySelector("#clubFilter"),
  avgTotal: document.querySelector("#avgTotal"),
  maxTotal: document.querySelector("#maxTotal"),
  minTotal: document.querySelector("#minTotal"),
  historyList: document.querySelector("#historyList"),
  exportButton: document.querySelector("#exportButton"),
  gasUrl: document.querySelector("#gasUrl"),
  saveSettingsButton: document.querySelector("#saveSettingsButton"),
  saveTargetsButton: document.querySelector("#saveTargetsButton"),
  targetGrid: document.querySelector("#targetGrid"),
  targetHint: document.querySelector("#targetHint"),
  installButton: document.querySelector("#installButton"),
  currentSessionName: document.querySelector("#currentSessionName"),
  currentSessionMemo: document.querySelector("#currentSessionMemo"),
  newSessionButton: document.querySelector("#newSessionButton"),
  sessionEditor: document.querySelector("#sessionEditor"),
  sessionNameInput: document.querySelector("#sessionNameInput"),
  sessionDateInput: document.querySelector("#sessionDateInput"),
  sessionThemeInput: document.querySelector("#sessionThemeInput"),
  sessionMemoInput: document.querySelector("#sessionMemoInput"),
  sessionNextTaskInput: document.querySelector("#sessionNextTaskInput"),
  saveSessionButton: document.querySelector("#saveSessionButton"),
  checklistTheme: document.querySelector("#checklistTheme"),
  checklistList: document.querySelector("#checklistList"),
  checklistText: document.querySelector("#checklistText"),
  saveChecklistButton: document.querySelector("#saveChecklistButton"),
  summaryPanel: document.querySelector("#summaryPanel"),
  finishSessionButton: document.querySelector("#finishSessionButton"),
  summaryContent: document.querySelector("#summaryContent")
};

let chart;
let deferredInstallPrompt;

function today() {
  return new Date().toISOString().slice(0, 10);
}

function uid(prefix) {
  const value = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${value}`;
}

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadShots(mode = "real") {
  return readJson(mode === "sample" ? SAMPLE_SHOTS_KEY : REAL_SHOTS_KEY, []);
}

function saveShots(shots, mode = "real") {
  writeJson(mode === "sample" ? SAMPLE_SHOTS_KEY : REAL_SHOTS_KEY, shots);
}

function loadSessions(mode = "real") {
  return readJson(mode === "sample" ? SAMPLE_SESSIONS_KEY : SESSIONS_KEY, []);
}

function saveSessions(sessions, mode = "real") {
  writeJson(mode === "sample" ? SAMPLE_SESSIONS_KEY : SESSIONS_KEY, sessions);
}

function loadSettings() {
  return readJson(SETTINGS_KEY, {});
}

function saveSettings(settings) {
  writeJson(SETTINGS_KEY, settings);
}

function loadTargets() {
  return { ...defaultTargets, ...readJson(TARGETS_KEY, {}) };
}

function saveTargets(targets) {
  writeJson(TARGETS_KEY, targets);
}

function loadChecklist() {
  return { ...defaultChecklist, ...readJson(CHECKLIST_KEY, {}) };
}

function saveChecklist(value) {
  writeJson(CHECKLIST_KEY, value);
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

function numberValue(value) {
  const normalized = String(value ?? "").replace(/[^\d.-]/g, "");
  return normalized === "" ? "" : Number(normalized);
}

function formatYards(value) {
  return Number.isFinite(value) ? `${Math.round(value)} yd` : "-";
}

function average(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : NaN;
}

function showPanel(id) {
  els.panels.forEach((panel) => panel.classList.toggle("active", panel.id === id));
  els.tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.target === id));
  if (id === "historyPanel") renderHistory();
  if (id === "settingsPanel") {
    renderTargets();
    renderChecklist();
  }
}

function clubOptions(selected = "") {
  return DEFAULT_CLUBS.map((club) => `<option value="${escapeHtml(club)}"${club === selected ? " selected" : ""}>${escapeHtml(club)}</option>`).join("");
}

function renderClubSelects() {
  els.clubSelect.innerHTML = clubOptions(els.clubSelect.value || "Driver");
}

function currentSession() {
  let sessions = loadSessions("real");
  let currentId = localStorage.getItem(CURRENT_SESSION_KEY);
  let session = sessions.find((item) => item.id === currentId);
  if (!session) {
    session = {
      id: uid("session"),
      date: today(),
      name: `${today().replaceAll("-", "/")} 練習`,
      theme: "ドライバー",
      memo: "",
      nextTask: "",
      isSample: false
    };
    sessions = [session, ...sessions];
    saveSessions(sessions, "real");
    localStorage.setItem(CURRENT_SESSION_KEY, session.id);
  }
  return session;
}

function renderSession() {
  const session = currentSession();
  els.currentSessionName.textContent = session.name;
  els.currentSessionMemo.textContent = [session.date, session.theme, session.memo || "メモなし"].filter(Boolean).join(" / ");
  els.sessionDateInput.value = session.date || today();
  els.sessionNameInput.value = session.name || "";
  els.sessionThemeInput.value = session.theme || "ドライバー";
  els.sessionMemoInput.value = session.memo || "";
  els.sessionNextTaskInput.value = session.nextTask || "";
  renderChecklist();
}

function saveCurrentSessionFromForm() {
  const session = currentSession();
  const sessions = loadSessions("real").map((item) => item.id === session.id ? {
    ...item,
    date: els.sessionDateInput.value || today(),
    name: els.sessionNameInput.value.trim() || `${today().replaceAll("-", "/")} 練習`,
    theme: els.sessionThemeInput.value,
    memo: els.sessionMemoInput.value.trim(),
    nextTask: els.sessionNextTaskInput.value.trim(),
    isSample: false
  } : item);
  saveSessions(sessions, "real");
  els.sessionEditor.hidden = true;
  renderSession();
  renderHistory();
}

function setFormValues(values = {}, mode = "ocr") {
  const defaults = { date: currentSession().date || today(), club: "Driver", carry: "", total: "", ballSpeed: "", launchAngle: "", side: "", memo: "", rating: "normal" };
  Object.entries({ ...defaults, ...values }).forEach(([key, value]) => {
    const input = els.form.elements[key];
    if (input) input.value = value ?? "";
  });
  const rating = values.rating || "normal";
  document.querySelectorAll("[data-rating]").forEach((button) => {
    button.classList.toggle("active", button.dataset.rating === rating);
  });
  updateTargetHint();
  document.querySelector("#formModeText").textContent = mode === "manual"
    ? "手入力モードです。分かる項目だけ入れて保存できます。"
    : "OCR結果を確認して、違うところを直してください。";
}

function updateTargetHint() {
  const targets = loadTargets();
  const club = els.form.elements.club.value;
  const target = Number(targets[club]);
  els.targetHint.textContent = Number.isFinite(target) ? `目標キャリー: ${target} yd` : "目標キャリー: 未設定";
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
    : currentSession().date || today();

  const club = DEFAULT_CLUBS.find((candidate) => clean.toLowerCase().includes(candidate.toLowerCase())) || "Driver";
  const numbers = lines.flatMap((line) => [...line.matchAll(/-?\d+(?:\.\d+)?/g)].map((match) => Number(match[0])));

  return {
    date,
    club,
    carry: findNumberAfter(["carry", "キャリー"]) || numbers[0] || "",
    total: findNumberAfter(["total", "トータル", "distance", "距離"]) || numbers[1] || "",
    ballSpeed: findNumberAfter(["ball speed", "ball", "初速"]) || "",
    launchAngle: findNumberAfter(["launch angle", "launch", "打ち出し", "打出"]) || "",
    side: findNumberAfter(["side", "offline", "左右", "ブレ"]) || "",
    rating: "normal"
  };
}

async function runOcr(file) {
  if (!window.Tesseract) {
    alert("Tesseract.jsを読み込めませんでした。手入力で保存できます。");
    setFormValues({}, "manual");
    showPanel("confirmPanel");
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
  setFormValues(parseOcrText(text), "ocr");
  showPanel("confirmPanel");
}

function getFormShot() {
  const data = new FormData(els.form);
  const session = currentSession();
  const targets = loadTargets();
  const club = String(data.get("club") || "Driver");
  return {
    id: uid("shot"),
    createdAt: new Date().toISOString(),
    sessionId: session.id,
    sessionDate: session.date,
    sessionName: session.name,
    sessionTheme: session.theme,
    sessionMemo: session.memo,
    nextTask: session.nextTask,
    date: data.get("date") || session.date,
    club,
    targetCarry: numberValue(targets[club]),
    carry: numberValue(data.get("carry")),
    total: numberValue(data.get("total")),
    ballSpeed: numberValue(data.get("ballSpeed")),
    launchAngle: numberValue(data.get("launchAngle")),
    side: numberValue(data.get("side")),
    rating: String(data.get("rating") || "normal"),
    memo: String(data.get("memo") || "").trim(),
    isSample: false,
    storageVersion: STORAGE_VERSION
  };
}

async function postToGas(shot) {
  const { gasUrl } = loadSettings();
  if (!gasUrl || shot.isSample) return "local-only";

  await fetch(gasUrl, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(shot)
  });
  return "sent";
}

function activeMode() {
  return els.dataModeFilter.value === "sample" ? "sample" : "real";
}

function filteredShots() {
  const mode = activeMode();
  const sessionId = els.sessionFilter.value;
  const club = els.clubFilter.value;
  return loadShots(mode)
    .filter((shot) => !sessionId || shot.sessionId === sessionId)
    .filter((shot) => !club || shot.club === club)
    .sort((a, b) => `${a.date}-${a.createdAt || ""}`.localeCompare(`${b.date}-${b.createdAt || ""}`));
}

function renderFilters() {
  const mode = activeMode();
  const sessions = loadSessions(mode);
  const selectedSession = els.sessionFilter.value;
  const selectedClub = els.clubFilter.value;
  els.sessionFilter.innerHTML = `<option value="">すべてのセッション</option>${sessions.map((session) => `<option value="${escapeHtml(session.id)}">${escapeHtml(session.name)}</option>`).join("")}`;
  els.sessionFilter.value = sessions.some((session) => session.id === selectedSession) ? selectedSession : "";
  els.clubFilter.innerHTML = `<option value="">すべてのクラブ</option>${DEFAULT_CLUBS.map((club) => `<option value="${escapeHtml(club)}">${escapeHtml(club)}</option>`).join("")}`;
  els.clubFilter.value = DEFAULT_CLUBS.includes(selectedClub) ? selectedClub : "";
}

function renderStats(shots) {
  const carries = shots.map((shot) => Number(shot.carry)).filter(Number.isFinite);
  const recent10 = carries.slice(-10);
  els.avgTotal.textContent = formatYards(average(recent10));
  els.maxTotal.textContent = formatYards(carries.length ? Math.max(...carries) : NaN);
  els.minTotal.textContent = formatYards(carries.length ? Math.min(...carries) : NaN);
}

function groupedClubStats(shots) {
  const targets = loadTargets();
  return DEFAULT_CLUBS.map((club) => {
    const clubShots = shots.filter((shot) => shot.club === club);
    const carries = clubShots.map((shot) => Number(shot.carry)).filter(Number.isFinite);
    const avg = average(carries);
    const target = Number(targets[club]);
    return {
      club,
      count: carries.length,
      average: avg,
      max: carries.length ? Math.max(...carries) : NaN,
      min: carries.length ? Math.min(...carries) : NaN,
      tenAverage: average(carries.slice(-10)),
      target,
      diff: Number.isFinite(avg) && Number.isFinite(target) ? avg - target : NaN,
      rate: Number.isFinite(avg) && Number.isFinite(target) && target > 0 ? avg / target * 100 : NaN
    };
  }).filter((item) => item.count > 0);
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
        { label: "キャリー", data: shots.map((shot) => shot.carry || null), borderColor: "#0b6b58", backgroundColor: "rgba(11, 107, 88, 0.14)", tension: 0.25 },
        { label: "目標", data: shots.map((shot) => shot.targetCarry || loadTargets()[shot.club] || null), borderColor: "#d99b2b", borderDash: [6, 5], tension: 0.1 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { title: { display: true, text: "yd" }, ticks: { color: getComputedStyle(document.documentElement).getPropertyValue("--muted") } },
        x: { ticks: { color: getComputedStyle(document.documentElement).getPropertyValue("--muted") } }
      },
      plugins: { legend: { position: "bottom" } }
    }
  });
}

function sessionById(id, mode = activeMode()) {
  return loadSessions(mode).find((session) => session.id === id);
}

function renderHistoryList(shots) {
  const clubStats = groupedClubStats(shots);
  const statsHtml = clubStats.length ? `
    <div class="club-stats">
      ${clubStats.map((item) => `
        <article>
          <h3>${escapeHtml(item.club)}</h3>
          <p>平均 ${formatYards(item.average)} / 最高 ${formatYards(item.max)} / 最低 ${formatYards(item.min)}</p>
          <p>10球平均 ${formatYards(item.tenAverage)} / 目標差 ${formatYards(item.diff)} / 達成率 ${Number.isFinite(item.rate) ? `${Math.round(item.rate)}%` : "-"}</p>
        </article>
      `).join("")}
    </div>
  ` : "";

  const shotHtml = shots.length
    ? shots.map((shot) => {
      const session = sessionById(shot.sessionId);
      return `
        <article class="history-item">
          <div>
            <h3>${escapeHtml(shot.date)} / ${escapeHtml(shot.club)} / ${escapeHtml(RATINGS[shot.rating] || "普通")}</h3>
            <p>${escapeHtml(session?.name || shot.sessionName || "セッション未設定")}</p>
            <p>Carry ${escapeHtml(shot.carry || "-")} yd / Total ${escapeHtml(shot.total || "-")} yd / Ball ${escapeHtml(shot.ballSpeed || "-")} mph / Side ${escapeHtml(shot.side || "-")} yd</p>
            ${shot.memo ? `<p>${escapeHtml(shot.memo)}</p>` : ""}
          </div>
          <button type="button" data-delete="${escapeHtml(shot.id)}">削除</button>
        </article>
      `;
    }).join("")
    : `<p class="notice">${activeMode() === "sample" ? "サンプルデータがありません。" : "本番データがまだありません。記録タブからセッションを作って保存できます。"}</p>`;

  els.historyList.innerHTML = statsHtml + shotHtml;
}

function renderHistory() {
  renderFilters();
  const selected = filteredShots();
  renderStats(selected);
  renderChart(selected);
  renderHistoryList(selected);
}

function renderTargets() {
  const targets = loadTargets();
  els.targetGrid.innerHTML = DEFAULT_CLUBS.map((club) => `
    <label>${escapeHtml(club)}<input data-target-club="${escapeHtml(club)}" type="number" inputmode="decimal" min="0" step="1" value="${escapeHtml(targets[club] || "")}"></label>
  `).join("");
}

function renderChecklist() {
  const checklist = loadChecklist();
  const theme = els.checklistTheme?.value || currentSession().theme || "ドライバー";
  if (els.checklistTheme) els.checklistTheme.value = checklist[theme] ? theme : "ドライバー";
  const items = checklist[els.checklistTheme?.value || "ドライバー"] || [];
  if (els.checklistList) {
    els.checklistList.innerHTML = items.map((item, index) => `
      <label class="check-item"><input type="checkbox" data-check="${index}"><span>${escapeHtml(item)}</span></label>
    `).join("");
  }
  if (els.checklistText) els.checklistText.value = items.join("\n");
}

function downloadCsv() {
  const rows = [["sessionDate", "sessionName", "sessionTheme", "sessionMemo", "nextTask", "date", "club", "targetCarry", "carry", "total", "ballSpeed", "launchAngle", "side", "rating", "memo"], ...filteredShots().map((shot) => [shot.sessionDate, shot.sessionName, shot.sessionTheme, shot.sessionMemo, shot.nextTask, shot.date, shot.club, shot.targetCarry, shot.carry, shot.total, shot.ballSpeed, shot.launchAngle, shot.side, shot.rating, shot.memo])];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = activeMode() === "sample" ? "toptracer-sample-log.csv" : "toptracer-golf-log.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function addSamples() {
  saveSessions(sampleSessions, "sample");
  saveShots(sampleShots.map((shot) => ({ ...shot, isSample: true, targetCarry: loadTargets()[shot.club], storageVersion: STORAGE_VERSION })), "sample");
  els.dataModeFilter.value = "sample";
  renderHistory();
}

function deleteSamples() {
  saveSessions([], "sample");
  saveShots([], "sample");
  els.dataModeFilter.value = "real";
  renderHistory();
}

function summaryForCurrentSession() {
  const session = currentSession();
  const shots = loadShots("real").filter((shot) => shot.sessionId === session.id);
  const byClub = groupedClubStats(shots);
  const best = shots.slice().sort((a, b) => Number(b.carry || 0) - Number(a.carry || 0))[0];
  const speeds = shots.map((shot) => Number(shot.ballSpeed)).filter(Number.isFinite);
  const sides = shots.map((shot) => Math.abs(Number(shot.side))).filter(Number.isFinite);
  return `
    <h3>${escapeHtml(session.name)}</h3>
    <p>${escapeHtml(session.memo || "今日のメモなし")}</p>
    <div class="summary-grid">
      <div><span>ベストショット</span><strong>${best ? `${escapeHtml(best.club)} ${formatYards(Number(best.carry))}` : "-"}</strong></div>
      <div><span>最高初速</span><strong>${speeds.length ? `${Math.round(Math.max(...speeds))} mph` : "-"}</strong></div>
      <div><span>平均左右ブレ</span><strong>${formatYards(average(sides))}</strong></div>
      <div><span>次回の課題</span><strong>${escapeHtml(session.nextTask || "-")}</strong></div>
    </div>
    <div class="club-stats">${byClub.map((item) => `<article><h3>${escapeHtml(item.club)}</h3><p>平均 ${formatYards(item.average)} / 10球平均 ${formatYards(item.tenAverage)}</p></article>`).join("")}</div>
  `;
}

function initializeLegacyData() {
  if (localStorage.getItem(REAL_SHOTS_KEY)) return;
  const legacy = readJson("toptracerGolfLog.shots", []);
  if (!legacy.length) return;
  const session = currentSession();
  const migrated = legacy.filter((shot) => !String(shot.id || "").startsWith("sample-")).map((shot) => ({
    ...shot,
    sessionId: session.id,
    sessionDate: session.date,
    sessionName: session.name,
    sessionTheme: session.theme,
    sessionMemo: session.memo,
    rating: shot.rating || "normal",
    isSample: false,
    storageVersion: STORAGE_VERSION
  }));
  if (migrated.length) saveShots(migrated, "real");
}

document.querySelectorAll("[data-target]").forEach((button) => button.addEventListener("click", () => showPanel(button.dataset.target)));
[els.manualButton, els.manualEntryButton].forEach((button) => button?.addEventListener("click", () => {
  setFormValues({}, "manual");
  showPanel("confirmPanel");
}));

els.newSessionButton.addEventListener("click", () => {
  els.sessionEditor.hidden = !els.sessionEditor.hidden;
});

els.saveSessionButton.addEventListener("click", saveCurrentSessionFromForm);

els.finishSessionButton.addEventListener("click", () => {
  els.summaryContent.innerHTML = summaryForCurrentSession();
  showPanel("summaryPanel");
});

els.clearFormButton.addEventListener("click", () => setFormValues({}, "manual"));
els.clubSelect.addEventListener("change", updateTargetHint);

els.form.addEventListener("click", (event) => {
  const rating = event.target?.dataset?.rating;
  if (!rating) return;
  els.form.elements.rating.value = rating;
  document.querySelectorAll("[data-rating]").forEach((button) => button.classList.toggle("active", button.dataset.rating === rating));
});

els.screenshotInput.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  els.previewImage.src = URL.createObjectURL(file);
  els.previewWrap.hidden = false;
  runOcr(file).catch((error) => {
    console.error(error);
    els.progressText.textContent = "OCRに失敗しました。手入力で保存できます。";
    setFormValues({}, "manual");
    showPanel("confirmPanel");
  });
});

els.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const shot = getFormShot();
  const shots = loadShots("real");
  shots.push(shot);
  saveShots(shots, "real");
  els.saveNotice.textContent = "端末に保存しました。Googleスプレッドシートへ送信中...";
  try {
    const result = await postToGas(shot);
    els.saveNotice.textContent = result === "sent" ? "保存しました。Apps Scriptへ送信しました。" : "保存しました。Apps Script URL未設定のため端末内のみです。";
  } catch (error) {
    console.error(error);
    els.saveNotice.textContent = "端末には保存しました。Apps Script送信は失敗したため、設定URLを確認してください。";
  }
  setFormValues({ club: shot.club }, "manual");
  showPanel("historyPanel");
});

els.sampleButton.addEventListener("click", addSamples);
els.deleteSamplesButton.addEventListener("click", deleteSamples);

els.historyList.addEventListener("click", (event) => {
  const id = event.target?.dataset?.delete;
  if (!id) return;
  const mode = activeMode();
  saveShots(loadShots(mode).filter((shot) => shot.id !== id), mode);
  renderHistory();
});

els.dataModeFilter.addEventListener("change", renderHistory);
els.sessionFilter.addEventListener("change", renderHistory);
els.clubFilter.addEventListener("change", renderHistory);
els.exportButton.addEventListener("click", downloadCsv);

els.saveSettingsButton.addEventListener("click", () => {
  saveSettings({ gasUrl: els.gasUrl.value.trim() });
  els.saveSettingsButton.textContent = "保存済み";
  setTimeout(() => { els.saveSettingsButton.textContent = "設定を保存"; }, 1200);
});

els.saveTargetsButton.addEventListener("click", () => {
  const targets = {};
  document.querySelectorAll("[data-target-club]").forEach((input) => {
    targets[input.dataset.targetClub] = numberValue(input.value);
  });
  saveTargets(targets);
  updateTargetHint();
  renderHistory();
});

els.checklistTheme.addEventListener("change", renderChecklist);
els.saveChecklistButton.addEventListener("click", () => {
  const checklist = loadChecklist();
  checklist[els.checklistTheme.value] = els.checklistText.value.split("\n").map((line) => line.trim()).filter(Boolean);
  saveChecklist(checklist);
  renderChecklist();
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

document.querySelector("#versionLabel")?.remove();
const settings = loadSettings();
els.gasUrl.value = settings.gasUrl || "";
els.sessionThemeInput.innerHTML = PRACTICE_THEMES.map((theme) => `<option value="${escapeHtml(theme)}">${escapeHtml(theme)}</option>`).join("");
els.checklistTheme.innerHTML = ["ドライバー", "アイアン"].map((theme) => `<option value="${escapeHtml(theme)}">${escapeHtml(theme)}</option>`).join("");
renderClubSelects();
initializeLegacyData();
renderSession();
renderTargets();
renderFilters();
setFormValues({}, "manual");
