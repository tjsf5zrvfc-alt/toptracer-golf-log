const STORAGE_VERSION = "1.2";
const REAL_SHOTS_KEY = "toptracerGolfLog.v12.realShots";
const SAMPLE_SHOTS_KEY = "toptracerGolfLog.v12.sampleShots";
const SESSIONS_KEY = "toptracerGolfLog.v12.sessions";
const SAMPLE_SESSIONS_KEY = "toptracerGolfLog.v12.sampleSessions";
const SETTINGS_KEY = "toptracerGolfLog.settings";
const TARGETS_KEY = "toptracerGolfLog.v12.targets";
const CHECKLIST_KEY = "toptracerGolfLog.v12.checklist";
const CURRENT_SESSION_KEY = "toptracerGolfLog.v12.currentSessionId";
const SMART_GOLF_API_URL = "https://portal.sma-gol.app/api/swing/latest_list";

const DEFAULT_CLUBS = ["Driver", "5W", "4U", "6I", "7I", "8I", "9I", "PW", "50°", "56°"];
const SMART_GOLF_DEFAULT_CLUB_MAP = {
  1: "Driver",
  2: "3W",
  3: "5W",
  4: "7W",
  5: "4U",
  6: "5U",
  7: "6I",
  8: "7I",
  9: "8I",
  10: "9I",
  11: "PW",
  12: "AW",
  13: "SW"
};
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
  { id: "sample-1", sessionId: "sample-session-driver", date: "2026-07-05", club: "Driver", carry: 214, total: 238, ballSpeed: 132, launchAngle: 13.2, offline: -8, rating: "normal", memo: "やや右", dataSource: "toptracer" },
  { id: "sample-2", sessionId: "sample-session-driver", date: "2026-07-05", club: "Driver", carry: 221, total: 246, ballSpeed: 136, launchAngle: 12.8, offline: 5, rating: "good", memo: "芯", dataSource: "toptracer" },
  { id: "sample-3", sessionId: "sample-session-driver", date: "2026-07-05", club: "Driver", carry: 229, total: 254, ballSpeed: 139, launchAngle: 14.1, offline: 2, rating: "good", memo: "ベスト", dataSource: "toptracer" },
  { id: "sample-4", sessionId: "sample-session-driver", date: "2026-07-05", club: "Driver", carry: 202, total: 225, ballSpeed: 126, launchAngle: 11.8, offline: -16, rating: "miss", memo: "ひっかけ", dataSource: "toptracer" },
  { id: "sample-5", sessionId: "sample-session-iron", date: "2026-07-18", club: "8I", carry: 132, total: 138, ballSpeed: 96, launchAngle: 20.5, offline: -4, rating: "normal", memo: "", dataSource: "toptracer" },
  { id: "sample-6", sessionId: "sample-session-iron", date: "2026-07-18", club: "8I", carry: 137, total: 143, ballSpeed: 99, launchAngle: 19.8, offline: 1, rating: "good", memo: "", dataSource: "toptracer" },
  { id: "sample-7", sessionId: "sample-session-iron", date: "2026-07-18", club: "PW", carry: 106, total: 110, ballSpeed: 84, launchAngle: 24.2, offline: 3, rating: "normal", memo: "", dataSource: "toptracer" }
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
  sourceFilter: document.querySelector("#sourceFilter"),
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
  saveSmartGolfButton: document.querySelector("#saveSmartGolfButton"),
  targetGrid: document.querySelector("#targetGrid"),
  targetHint: document.querySelector("#targetHint"),
  smartGolfToken: document.querySelector("#smartGolfToken"),
  smartGolfClubMap: document.querySelector("#smartGolfClubMap"),
  smartSyncButton: document.querySelector("#smartSyncButton"),
  smartSyncStatus: document.querySelector("#smartSyncStatus"),
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
let currentFormSource = "manual";

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

function loadSmartGolfClubMap() {
  return { ...SMART_GOLF_DEFAULT_CLUB_MAP, ...(loadSettings().smartGolfClubMap || {}) };
}

function smartGolfClubMapToText(map = loadSmartGolfClubMap()) {
  return Object.entries(map)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
}

function parseSmartGolfClubMap(text) {
  return String(text || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce((map, line) => {
      const [key, ...valueParts] = line.split("=");
      const value = valueParts.join("=").trim();
      if (key && value) map[key.trim()] = value;
      return map;
    }, {});
}

function allClubs() {
  return [...new Set([...DEFAULT_CLUBS, ...Object.values(loadSmartGolfClubMap())])];
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

function formatNumber(value, suffix = "") {
  return Number.isFinite(value) ? `${Math.round(value * 10) / 10}${suffix}` : "-";
}

function average(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : NaN;
}

function normalizeDate(value) {
  if (!value) return today();
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  const text = String(value);
  const match = text.match(/(20\d{2})[./-](\d{1,2})[./-](\d{1,2})/);
  return match ? `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}` : today();
}

function normalizeShotBase(values, dataSource) {
  const session = currentSession();
  const targets = loadTargets();
  const club = values.club || "Driver";
  return {
    id: uid("shot"),
    createdAt: new Date().toISOString(),
    sessionId: session.id,
    sessionDate: session.date,
    sessionName: session.name,
    sessionTheme: session.theme,
    sessionMemo: session.memo,
    nextTask: session.nextTask,
    dataSource,
    date: values.date || session.date,
    shotDateTime: values.shotDateTime || values.date || session.date,
    club,
    targetCarry: numberValue(targets[club]),
    carry: numberValue(values.carry),
    total: numberValue(values.total),
    run: numberValue(values.run),
    clubSpeed: numberValue(values.clubSpeed),
    ballSpeed: numberValue(values.ballSpeed),
    smashFactor: numberValue(values.smashFactor),
    launchAngle: numberValue(values.launchAngle),
    sideAngle: numberValue(values.sideAngle),
    backSpin: numberValue(values.backSpin),
    sideSpin: numberValue(values.sideSpin),
    clubPath: numberValue(values.clubPath),
    faceAngle: numberValue(values.faceAngle),
    apex: numberValue(values.apex),
    landingAngle: numberValue(values.landingAngle),
    impactAngle: numberValue(values.impactAngle),
    offline: numberValue(values.offline ?? values.side),
    rating: values.rating || "normal",
    memo: values.memo || "",
    raw: values.raw || null,
    isSample: false,
    storageVersion: STORAGE_VERSION
  };
}

class Importer {
  constructor(dataSource) {
    this.dataSource = dataSource;
  }

  normalize(values) {
    return normalizeShotBase(values, this.dataSource);
  }
}

class ManualImporter extends Importer {
  constructor() {
    super("manual");
  }

  fromForm(form) {
    const data = new FormData(form);
    return this.normalize({
      date: data.get("date") || currentSession().date,
      shotDateTime: data.get("date") || currentSession().date,
      club: String(data.get("club") || "Driver"),
      carry: data.get("carry"),
      total: data.get("total"),
      run: data.get("run"),
      clubSpeed: data.get("clubSpeed"),
      ballSpeed: data.get("ballSpeed"),
      smashFactor: data.get("smashFactor"),
      launchAngle: data.get("launchAngle"),
      sideAngle: data.get("sideAngle"),
      backSpin: data.get("backSpin"),
      sideSpin: data.get("sideSpin"),
      offline: data.get("offline"),
      rating: String(data.get("rating") || "normal"),
      memo: String(data.get("memo") || "").trim()
    });
  }
}

class TopTracerImporter extends Importer {
  constructor() {
    super("toptracer");
  }
}

class SmartGolfImporter extends Importer {
  constructor(clubMap) {
    super("smartgolf");
    this.clubMap = clubMap;
  }

  normalize(raw) {
    const club = this.clubMap[String(raw.clubType)] || this.clubMap[raw.clubType] || String(raw.clubType || "Driver");
    return super.normalize({
      date: normalizeDate(raw.swingDate),
      shotDateTime: raw.swingDate || normalizeDate(raw.swingDate),
      club,
      carry: raw.carryDist,
      total: raw.totalDist,
      run: raw.runDist,
      clubSpeed: raw.clubSpeed,
      ballSpeed: raw.ballSpeed,
      smashFactor: raw.smashFactor,
      launchAngle: raw.launchAngle,
      sideAngle: raw.sideAngle,
      backSpin: raw.backSpin,
      sideSpin: raw.sideSpin,
      clubPath: raw.clubPath,
      faceAngle: raw.faceAngle,
      apex: raw.apex,
      landingAngle: raw.landingAngle,
      impactAngle: raw.impactAngleAtMoi,
      offline: raw.offPin,
      rating: raw.shot_judge ? String(raw.shot_judge).toLowerCase() : "normal",
      memo: [raw.gameType, raw.course_name, raw.shot_count ? `shot ${raw.shot_count}` : ""].filter(Boolean).join(" / "),
      raw
    });
  }
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
  return allClubs().map((club) => `<option value="${escapeHtml(club)}"${club === selected ? " selected" : ""}>${escapeHtml(club)}</option>`).join("");
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
  const defaults = { date: currentSession().date || today(), club: "Driver", carry: "", total: "", run: "", clubSpeed: "", ballSpeed: "", smashFactor: "", launchAngle: "", sideAngle: "", backSpin: "", sideSpin: "", offline: "", memo: "", rating: "normal" };
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
    offline: findNumberAfter(["side", "offline", "左右", "ブレ"]) || "",
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
  currentFormSource = "toptracer";
  setFormValues(parseOcrText(text), "ocr");
  showPanel("confirmPanel");
}

function getFormShot(dataSource = "manual") {
  const importer = dataSource === "toptracer" ? new TopTracerImporter() : new ManualImporter();
  const shot = importer instanceof ManualImporter ? importer.fromForm(els.form) : importer.normalize(new ManualImporter().fromForm(els.form));
  shot.dataSource = dataSource;
  return shot;
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

function isDuplicateShot(existing, incoming) {
  return existing.some((shot) => {
    const sameDate = String(shot.shotDateTime || shot.date || "") === String(incoming.shotDateTime || incoming.date || "");
    const sameCarry = Number(shot.carry) === Number(incoming.carry);
    const sameBallSpeed = Number(shot.ballSpeed) === Number(incoming.ballSpeed);
    return sameDate && sameCarry && sameBallSpeed;
  });
}

async function syncSmartGolf() {
  const settings = loadSettings();
  const token = String(settings.smartGolfToken || "").trim();
  if (!token) {
    els.smartSyncStatus.textContent = "SMART GOLFのBearer Tokenを設定してください。";
    showPanel("settingsPanel");
    return;
  }

  els.smartSyncStatus.textContent = "SMART GOLFから同期中...";
  try {
    const response = await fetch(SMART_GOLF_API_URL, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.status === 401) throw new Error("TOKEN_EXPIRED");
    if (response.status === 403) throw new Error("LOGIN_REQUIRED");
    if (!response.ok) throw new Error("SYNC_FAILED");

    const json = await response.json();
    if (!Array.isArray(json)) throw new Error("SYNC_FAILED");

    const importer = new SmartGolfImporter(loadSmartGolfClubMap());
    const existing = loadShots("real");
    const imported = json.map((item) => importer.normalize(item));
    const unique = imported.filter((shot) => !isDuplicateShot(existing, shot));
    saveShots([...existing, ...unique], "real");
    els.dataModeFilter.value = "real";
    els.sourceFilter.value = "smartgolf";
    els.smartSyncStatus.textContent = `SMART GOLF同期完了: ${unique.length}件追加 / ${imported.length - unique.length}件重複`;
    renderHistory();
    showPanel("historyPanel");
  } catch (error) {
    console.error(error);
    if (error.message === "TOKEN_EXPIRED") {
      els.smartSyncStatus.textContent = "Bearer Tokenが期限切れです。";
    } else if (error.message === "LOGIN_REQUIRED") {
      els.smartSyncStatus.textContent = "SMART GOLFへログインしてください。";
    } else {
      els.smartSyncStatus.textContent = "同期できませんでした。";
    }
  }
}

function activeMode() {
  return els.dataModeFilter.value === "sample" ? "sample" : "real";
}

function filteredShots() {
  const mode = activeMode();
  const source = els.sourceFilter.value;
  const sessionId = els.sessionFilter.value;
  const club = els.clubFilter.value;
  return loadShots(mode)
    .filter((shot) => !source || (shot.dataSource || "toptracer") === source)
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
  const clubs = allClubs();
  els.clubFilter.innerHTML = `<option value="">すべてのクラブ</option>${clubs.map((club) => `<option value="${escapeHtml(club)}">${escapeHtml(club)}</option>`).join("")}`;
  els.clubFilter.value = clubs.includes(selectedClub) ? selectedClub : "";
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
  return allClubs().map((club) => {
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
            <h3>${escapeHtml(shot.date)} / ${escapeHtml(shot.club)} / ${escapeHtml(RATINGS[shot.rating] || shot.rating || "普通")}</h3>
            <p>${escapeHtml(session?.name || shot.sessionName || "セッション未設定")}</p>
            <p>${escapeHtml((shot.dataSource || "toptracer").toUpperCase())} / Carry ${escapeHtml(shot.carry || "-")} yd / Total ${escapeHtml(shot.total || "-")} yd / Ball ${escapeHtml(shot.ballSpeed || "-")} mph / Offline ${escapeHtml(shot.offline ?? "-")} yd</p>
            <p>HS ${escapeHtml(shot.clubSpeed || "-")} / Smash ${escapeHtml(shot.smashFactor || "-")} / Spin ${escapeHtml(shot.backSpin || "-")}</p>
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
  els.targetGrid.innerHTML = allClubs().map((club) => `
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
  const rows = [["dataSource", "sessionDate", "sessionName", "sessionTheme", "sessionMemo", "nextTask", "date", "shotDateTime", "club", "targetCarry", "carry", "total", "run", "clubSpeed", "ballSpeed", "smashFactor", "launchAngle", "sideAngle", "backSpin", "sideSpin", "clubPath", "faceAngle", "landingAngle", "apex", "offline", "impactAngle", "rating", "memo"], ...filteredShots().map((shot) => [shot.dataSource, shot.sessionDate, shot.sessionName, shot.sessionTheme, shot.sessionMemo, shot.nextTask, shot.date, shot.shotDateTime, shot.club, shot.targetCarry, shot.carry, shot.total, shot.run, shot.clubSpeed, shot.ballSpeed, shot.smashFactor, shot.launchAngle, shot.sideAngle, shot.backSpin, shot.sideSpin, shot.clubPath, shot.faceAngle, shot.landingAngle, shot.apex, shot.offline, shot.impactAngle, shot.rating, shot.memo])];
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
  const carries = shots.map((shot) => Number(shot.carry)).filter(Number.isFinite);
  const speeds = shots.map((shot) => Number(shot.ballSpeed)).filter(Number.isFinite);
  const clubSpeeds = shots.map((shot) => Number(shot.clubSpeed)).filter(Number.isFinite);
  const smashFactors = shots.map((shot) => Number(shot.smashFactor)).filter(Number.isFinite);
  const spins = shots.map((shot) => Number(shot.backSpin)).filter(Number.isFinite);
  const sides = shots.map((shot) => Math.abs(Number(shot.offline ?? shot.side))).filter(Number.isFinite);
  const carryAvg = average(carries);
  const sideAvg = average(sides);
  const improvement = Number.isFinite(sideAvg) && sideAvg > 15
    ? "左右ブレが大きめです。フェース向きとスタンスを優先して確認しましょう。"
    : Number.isFinite(average(smashFactors)) && average(smashFactors) < 1.35
      ? "ミート率を上げる余地があります。力感を落として芯で打つ練習が良さそうです。"
      : "距離と方向のバランスは良好です。良かったスイングの再現性を高めましょう。";
  const oneWord = Number.isFinite(carryAvg)
    ? `今日は平均${Math.round(carryAvg)}yd。次は同じリズムでばらつきを減らしましょう。`
    : "今日はデータが少なめです。次回はクラブごとに3球以上残すと傾向が見えます。";
  return `
    <h3>${escapeHtml(session.name)}</h3>
    <p>${escapeHtml(session.memo || "今日のメモなし")}</p>
    <div class="summary-grid">
      <div><span>平均キャリー</span><strong>${formatYards(carryAvg)}</strong></div>
      <div><span>平均初速</span><strong>${formatNumber(average(speeds), " mph")}</strong></div>
      <div><span>平均HS</span><strong>${formatNumber(average(clubSpeeds), " mph")}</strong></div>
      <div><span>平均ミート率</span><strong>${formatNumber(average(smashFactors))}</strong></div>
      <div><span>平均スピン</span><strong>${formatNumber(average(spins))}</strong></div>
      <div><span>ベストショット</span><strong>${best ? `${escapeHtml(best.club)} ${formatYards(Number(best.carry))}` : "-"}</strong></div>
      <div><span>最高飛距離</span><strong>${formatYards(best ? Number(best.carry) : NaN)}</strong></div>
      <div><span>最高初速</span><strong>${speeds.length ? `${Math.round(Math.max(...speeds))} mph` : "-"}</strong></div>
      <div><span>平均左右ブレ</span><strong>${formatYards(average(sides))}</strong></div>
      <div><span>次回の課題</span><strong>${escapeHtml(session.nextTask || "-")}</strong></div>
    </div>
    <div class="summary-note"><h3>改善点</h3><p>${escapeHtml(improvement)}</p></div>
    <div class="summary-note"><h3>今日の一言</h3><p>${escapeHtml(oneWord)}</p></div>
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
    dataSource: shot.dataSource || "toptracer",
    offline: shot.offline ?? shot.side,
    shotDateTime: shot.shotDateTime || shot.date,
    rating: shot.rating || "normal",
    isSample: false,
    storageVersion: STORAGE_VERSION
  }));
  if (migrated.length) saveShots(migrated, "real");
}

document.querySelectorAll("[data-target]").forEach((button) => button.addEventListener("click", () => showPanel(button.dataset.target)));
[els.manualButton, els.manualEntryButton].forEach((button) => button?.addEventListener("click", () => {
  currentFormSource = "manual";
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
    currentFormSource = "manual";
    setFormValues({}, "manual");
    showPanel("confirmPanel");
  });
});

els.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const shot = getFormShot(currentFormSource);
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
  currentFormSource = "manual";
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
els.sourceFilter.addEventListener("change", renderHistory);
els.sessionFilter.addEventListener("change", renderHistory);
els.clubFilter.addEventListener("change", renderHistory);
els.exportButton.addEventListener("click", downloadCsv);

els.saveSettingsButton.addEventListener("click", () => {
  saveSettings({ ...loadSettings(), gasUrl: els.gasUrl.value.trim() });
  els.saveSettingsButton.textContent = "保存済み";
  setTimeout(() => { els.saveSettingsButton.textContent = "設定を保存"; }, 1200);
});

els.saveSmartGolfButton.addEventListener("click", () => {
  saveSettings({
    ...loadSettings(),
    smartGolfToken: els.smartGolfToken.value.trim(),
    smartGolfClubMap: parseSmartGolfClubMap(els.smartGolfClubMap.value)
  });
  renderClubSelects();
  renderTargets();
  renderHistory();
  els.saveSmartGolfButton.textContent = "保存済み";
  setTimeout(() => { els.saveSmartGolfButton.textContent = "SMART GOLF設定保存"; }, 1200);
});

els.smartSyncButton.addEventListener("click", syncSmartGolf);

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
els.smartGolfToken.value = settings.smartGolfToken || "";
els.smartGolfClubMap.value = smartGolfClubMapToText(settings.smartGolfClubMap || SMART_GOLF_DEFAULT_CLUB_MAP);
els.sessionThemeInput.innerHTML = PRACTICE_THEMES.map((theme) => `<option value="${escapeHtml(theme)}">${escapeHtml(theme)}</option>`).join("");
els.checklistTheme.innerHTML = ["ドライバー", "アイアン"].map((theme) => `<option value="${escapeHtml(theme)}">${escapeHtml(theme)}</option>`).join("");
renderClubSelects();
initializeLegacyData();
renderSession();
renderTargets();
renderFilters();
setFormValues({}, "manual");
