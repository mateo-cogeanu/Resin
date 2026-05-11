const state = {
  loaders: [],
  javaRuntimes: [],
  activeLoader: "",
  loaderDefaults: {},
  variantDefaults: {},
  minecraftVersions: [],
  variantKey: "",
  variantOptions: [],
  servers: [],
  templates: [],
  selectedServerId: "",
  selectedServer: null,
  detailTimer: null,
  activeMenu: "inventory",
  modSearchResults: [],
  selectedModProjectIds: [],
  modUpdates: [],
  consoleFilter: "all",
  consoleSearch: "",
  consoleDisplayOverride: null,
  inventoryFilter: "all",
  inventorySearch: "",
  playersSearch: "",
  theme: localStorage.getItem("resinTheme") || "midnight",
  fileBrowserPath: "",
  openFilePath: "",
  selectedBackupId: "",
  commandHistory: JSON.parse(localStorage.getItem("resinCommandHistory") || "[]"),
  commandHistoryIndex: -1
};

const loaderGrid = document.getElementById("loaderGrid");
const loaderTemplate = document.getElementById("loaderTemplate");
const loaderChip = document.getElementById("loaderChip");
const createForm = document.getElementById("createForm");
const minecraftVersion = document.getElementById("minecraftVersion");
const variantField = document.getElementById("variantField");
const variantLabel = document.getElementById("variantLabel");
const variantSelect = document.getElementById("variantSelect");
const templateSelect = document.getElementById("templateSelect");
const templateNameInput = document.getElementById("templateNameInput");
const saveTemplateButton = document.getElementById("saveTemplateButton");
const templateList = document.getElementById("templateList");
const statusText = document.getElementById("statusText");
const submitButton = document.getElementById("submitButton");
const javaRuntimeList = document.getElementById("javaRuntimeList");
const javaPolicy = document.getElementById("javaPolicy");
const createInsightList = document.getElementById("createInsightList");
const createJavaOverride = document.getElementById("createJavaOverride");
const createExtraJvmArgs = document.getElementById("createExtraJvmArgs");
const serverList = document.getElementById("serverList");
const activeServerDisplay = document.getElementById("activeServerDisplay");
const activeServerMeta = document.getElementById("activeServerMeta");
const themeSelect = document.getElementById("themeSelect");
const topbarRuntimeChip = document.getElementById("topbarRuntimeChip");
const topbarAddressChip = document.getElementById("topbarAddressChip");
const topbarHealthChip = document.getElementById("topbarHealthChip");
const sidebarServerCount = document.getElementById("sidebarServerCount");
const sidebarRunningCount = document.getElementById("sidebarRunningCount");
const sidebarModdedCount = document.getElementById("sidebarModdedCount");
const inventorySearch = document.getElementById("inventorySearch");
const inventorySummary = document.getElementById("inventorySummary");

const menuButtons = {
  create: document.getElementById("menuCreate"),
  inventory: document.getElementById("menuInventory"),
  overview: document.getElementById("menuOverview"),
  health: document.getElementById("menuHealth"),
  manage: document.getElementById("menuManage"),
  files: document.getElementById("menuFiles"),
  players: document.getElementById("menuPlayers"),
  settings: document.getElementById("menuSettings"),
  backups: document.getElementById("menuBackups"),
  activity: document.getElementById("menuActivity"),
  mods: document.getElementById("menuMods")
};

const panels = {
  create: document.getElementById("panelCreate"),
  inventory: document.getElementById("panelInventory"),
  overview: document.getElementById("panelOverview"),
  health: document.getElementById("panelHealth"),
  manage: document.getElementById("panelManage"),
  files: document.getElementById("panelFiles"),
  players: document.getElementById("panelPlayers"),
  settings: document.getElementById("panelSettings"),
  backups: document.getElementById("panelBackups"),
  activity: document.getElementById("panelActivity"),
  mods: document.getElementById("panelMods")
};

const overviewTitle = document.getElementById("overviewTitle");
const overviewRuntime = document.getElementById("overviewRuntime");
const overviewEmpty = document.getElementById("overviewEmpty");
const overviewPanel = document.getElementById("overviewPanel");
const overviewSummary = document.getElementById("overviewSummary");
const overviewHeroMeta = document.getElementById("overviewHeroMeta");
const overviewStats = document.getElementById("overviewStats");
const overviewRecommendations = document.getElementById("overviewRecommendations");
const readinessPill = document.getElementById("readinessPill");
const readinessList = document.getElementById("readinessList");
const overviewConnection = document.getElementById("overviewConnection");
const overviewPlayers = document.getElementById("overviewPlayers");
const overviewActivity = document.getElementById("overviewActivity");
const overviewStartButton = document.getElementById("overviewStartButton");
const overviewStopButton = document.getElementById("overviewStopButton");
const overviewConsoleButton = document.getElementById("overviewConsoleButton");
const overviewPlayersButton = document.getElementById("overviewPlayersButton");
const overviewSettingsButton = document.getElementById("overviewSettingsButton");
const healthTitle = document.getElementById("healthTitle");
const healthRuntime = document.getElementById("healthRuntime");
const healthEmpty = document.getElementById("healthEmpty");
const healthPanel = document.getElementById("healthPanel");
const healthSummary = document.getElementById("healthSummary");
const healthOverviewCards = document.getElementById("healthOverviewCards");
const healthChecks = document.getElementById("healthChecks");

const managerTitle = document.getElementById("managerTitle");
const managerRuntime = document.getElementById("managerRuntime");
const managerEmpty = document.getElementById("managerEmpty");
const managerPanel = document.getElementById("managerPanel");
const managerLoader = document.getElementById("managerLoader");
const managerVersion = document.getElementById("managerVersion");
const managerJava = document.getElementById("managerJava");
const managerJavaBadge = document.getElementById("managerJavaBadge");
const managerJavaReason = document.getElementById("managerJavaReason");
const managerPath = document.getElementById("managerPath");
const deleteServerButton = document.getElementById("deleteServerButton");
const startServerButton = document.getElementById("startServerButton");
const stopServerButton = document.getElementById("stopServerButton");
const refreshServerButton = document.getElementById("refreshServerButton");
const commandInput = document.getElementById("commandInput");
const sendCommandButton = document.getElementById("sendCommandButton");
const consoleOutput = document.getElementById("consoleOutput");
const consoleSearchInput = document.getElementById("consoleSearchInput");
const consoleInsightBar = document.getElementById("consoleInsightBar");
const consoleAutoscroll = document.getElementById("consoleAutoscroll");
const copyConsoleButton = document.getElementById("copyConsoleButton");
const downloadConsoleButton = document.getElementById("downloadConsoleButton");
const clearConsoleViewButton = document.getElementById("clearConsoleViewButton");

const playersTitle = document.getElementById("playersTitle");
const playersRuntime = document.getElementById("playersRuntime");
const playersEmpty = document.getElementById("playersEmpty");
const playersPanel = document.getElementById("playersPanel");
const playersHint = document.getElementById("playersHint");
const playersList = document.getElementById("playersList");
const playersSearch = document.getElementById("playersSearch");
const playerReasonInput = document.getElementById("playerReasonInput");
const playersServerName = document.getElementById("playersServerName");
const playersLoader = document.getElementById("playersLoader");
const playersVersion = document.getElementById("playersVersion");

const settingsTitle = document.getElementById("settingsTitle");
const settingsRuntime = document.getElementById("settingsRuntime");
const settingsEmpty = document.getElementById("settingsEmpty");
const settingsPanel = document.getElementById("settingsPanel");
const settingsForm = document.getElementById("settingsForm");
const settingsStatus = document.getElementById("settingsStatus");
const saveSettingsButton = document.getElementById("saveSettingsButton");
const settingsRawEditor = document.getElementById("settingsRawEditor");
const saveRawSettingsButton = document.getElementById("saveRawSettingsButton");
const runtimeMemoryMb = document.getElementById("runtimeMemoryMb");
const runtimeJavaOverride = document.getElementById("runtimeJavaOverride");
const runtimeExtraJvmArgs = document.getElementById("runtimeExtraJvmArgs");
const saveRuntimeButton = document.getElementById("saveRuntimeButton");

const backupsTitle = document.getElementById("backupsTitle");
const backupsRuntime = document.getElementById("backupsRuntime");
const backupsEmpty = document.getElementById("backupsEmpty");
const backupsPanel = document.getElementById("backupsPanel");
const backupNoteInput = document.getElementById("backupNoteInput");
const createBackupButton = document.getElementById("createBackupButton");
const backupsList = document.getElementById("backupsList");
const backupCadence = document.getElementById("backupCadence");
const backupRetention = document.getElementById("backupRetention");
const backupScheduleEnabled = document.getElementById("backupScheduleEnabled");
const saveBackupScheduleButton = document.getElementById("saveBackupScheduleButton");
const backupScheduleSummary = document.getElementById("backupScheduleSummary");
const backupDetail = document.getElementById("backupDetail");
const confirmRestoreButton = document.getElementById("confirmRestoreButton");

const activityTitle = document.getElementById("activityTitle");
const activityRuntime = document.getElementById("activityRuntime");
const activityEmpty = document.getElementById("activityEmpty");
const activityPanel = document.getElementById("activityPanel");
const activityList = document.getElementById("activityList");

const modsTitle = document.getElementById("modsTitle");
const modsRuntime = document.getElementById("modsRuntime");
const modsEmpty = document.getElementById("modsEmpty");
const modsPanel = document.getElementById("modsPanel");
const modsLoader = document.getElementById("modsLoader");
const modsVersion = document.getElementById("modsVersion");
const modsPath = document.getElementById("modsPath");
const installedModsList = document.getElementById("installedModsList");
const modSearchInput = document.getElementById("modSearchInput");
const modSearchButton = document.getElementById("modSearchButton");
const modsSearchHint = document.getElementById("modsSearchHint");
const modResults = document.getElementById("modResults");
const modsSelectionSummary = document.getElementById("modsSelectionSummary");
const modsSelectAllButton = document.getElementById("modsSelectAllButton");
const modsClearSelectionButton = document.getElementById("modsClearSelectionButton");
const modsDownloadSelectedButton = document.getElementById("modsDownloadSelectedButton");
const modUpdateList = document.getElementById("modUpdateList");

const filesTitle = document.getElementById("filesTitle");
const filesRuntime = document.getElementById("filesRuntime");
const filesEmpty = document.getElementById("filesEmpty");
const filesPanel = document.getElementById("filesPanel");
const filesPathLabel = document.getElementById("filesPathLabel");
const filesUpButton = document.getElementById("filesUpButton");
const newFolderInput = document.getElementById("newFolderInput");
const createFolderButton = document.getElementById("createFolderButton");
const uploadFileInput = document.getElementById("uploadFileInput");
const fileList = document.getElementById("fileList");
const fileEditorLabel = document.getElementById("fileEditorLabel");
const fileEditor = document.getElementById("fileEditor");
const saveFileButton = document.getElementById("saveFileButton");
const downloadFileLink = document.getElementById("downloadFileLink");

const settingFields = {
  motd: document.getElementById("settingMotd"),
  "level-name": document.getElementById("settingLevelName"),
  "server-port": document.getElementById("settingPort"),
  "max-players": document.getElementById("settingMaxPlayers"),
  difficulty: document.getElementById("settingDifficulty"),
  gamemode: document.getElementById("settingGamemode"),
  "view-distance": document.getElementById("settingViewDistance"),
  "simulation-distance": document.getElementById("settingSimulationDistance"),
  "spawn-protection": document.getElementById("settingSpawnProtection"),
  "online-mode": document.getElementById("settingOnlineMode"),
  "allow-flight": document.getElementById("settingAllowFlight"),
  pvp: document.getElementById("settingPvp"),
  "white-list": document.getElementById("settingWhitelist")
};

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "Request failed.");
  }
  return payload;
}

function setStatus(message, tone = "") {
  statusText.textContent = message;
  statusText.className = `status-text ${tone}`.trim();
}

function renderCreateInsights() {
  const active = state.loaders.find((loader) => loader.id === state.activeLoader);
  const version = minecraftVersion.value;
  const lines = [];
  if (!active) {
    lines.push(["Choose a loader", "Pick the workflow you want Resin to prepare, then choose the matching Minecraft version and runtime path."]);
  } else {
    lines.push([`${active.name} workflow`, active.support]);
    lines.push(["Java target", version ? javaPolicy.textContent : "Pick a Minecraft version to see the target runtime policy."]);
    lines.push(["Expectations", ["forge", "quilt", "neoforge"].includes(active.id) ? "This loader usually needs installer prep before first boot." : "This loader can be prepared as a direct server jar workflow."]);
  }
  createInsightList.innerHTML = lines.map(([title, body]) => `
    <div class="list-row">
      <div>
        <strong>${title}</strong>
        <div class="server-meta">${body}</div>
      </div>
    </div>
  `).join("");
}

function renderSidebarStats() {
  sidebarServerCount.textContent = String(state.servers.length);
  sidebarRunningCount.textContent = String(state.servers.filter((server) => server.runtimeState === "running").length);
  sidebarModdedCount.textContent = String(state.servers.filter((server) => server.supportsMods).length);
}

function setSettingsStatus(message, tone = "") {
  settingsStatus.textContent = message;
  settingsStatus.className = `status-text ${tone}`.trim();
}

function applyTheme(theme) {
  const selectedTheme = ["midnight", "harbor", "ember", "grove"].includes(theme) ? theme : "midnight";
  // Persist the chosen palette on the root element so every screen can react without custom per-panel logic.
  document.documentElement.dataset.theme = selectedTheme;
  themeSelect.value = selectedTheme;
  state.theme = selectedTheme;
  localStorage.setItem("resinTheme", selectedTheme);
}

function setActiveMenu(menu) {
  state.activeMenu = menu;
  for (const [key, button] of Object.entries(menuButtons)) {
    button.classList.toggle("active", key === menu);
  }
  for (const [key, panel] of Object.entries(panels)) {
    panel.classList.toggle("active", key === menu);
  }
}

function fillSelect(element, options, placeholder) {
  element.innerHTML = "";
  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = placeholder;
  element.appendChild(placeholderOption);

  for (const option of options) {
    const node = document.createElement("option");
    node.value = option.id || option.value;
    node.textContent = option.label || option.id;
    element.appendChild(node);
  }
}

function renderJavaRuntimes() {
  if (!state.javaRuntimes.length) {
    javaRuntimeList.innerHTML = `<div class="empty-state">No Java runtimes detected.</div>`;
    return;
  }

  javaRuntimeList.innerHTML = state.javaRuntimes.map((runtime) => `
    <div class="runtime-item">
      <strong>Java ${runtime.major}</strong>
      <span>${runtime.version} · ${runtime.name}</span>
    </div>
  `).join("");

  const options = `<option value="">Auto select</option>${state.javaRuntimes.map((runtime) => `<option value="${runtime.major}">Java ${runtime.major} · ${runtime.version}</option>`).join("")}`;
  createJavaOverride.innerHTML = options;
  runtimeJavaOverride.innerHTML = options;
}

function renderTemplates() {
  templateSelect.innerHTML = `<option value="">Start from scratch</option>${state.templates.map((template) => `<option value="${template.id}">${template.name}</option>`).join("")}`;
  templateList.innerHTML = state.templates.length
    ? state.templates.map((template) => `
      <div class="list-row compact-row">
        <div>
          <strong>${template.name}</strong>
          <div class="server-meta">${template.profile.loader} · ${template.profile.minecraftVersion}</div>
        </div>
        <button type="button" class="secondary-button template-delete-button" data-template-id="${template.id}">Delete</button>
      </div>
    `).join("")
    : `<div class="empty-state">No saved templates yet.</div>`;
}

function updateJavaPolicy() {
  const version = minecraftVersion.value;
  if (!version) {
    javaPolicy.textContent = "Resin will choose a Java runtime automatically for the selected Minecraft version.";
    return;
  }

  const preferredMajor = /^26\./.test(version) || version.startsWith("26.1") ? 25 : 21;
  javaPolicy.textContent = `Minecraft ${version} will target Java ${preferredMajor}. Resin uses the closest matching installed runtime automatically.`;
}

function renderLoaderCards() {
  loaderGrid.innerHTML = "";
  for (const loader of state.loaders) {
    const node = loaderTemplate.content.firstElementChild.cloneNode(true);
    node.dataset.loader = loader.id;
    node.querySelector("strong").textContent = loader.name;
    node.querySelector("em").textContent = loader.badge;
    node.querySelector(".loader-card-body").textContent = loader.tone;
    node.querySelector(".loader-card-foot").textContent = loader.support;
    node.addEventListener("click", () => selectLoader(loader.id));
    loaderGrid.appendChild(node);
  }
}

function updateLoaderSelection() {
  for (const button of loaderGrid.querySelectorAll(".loader-card")) {
    button.classList.toggle("active", button.dataset.loader === state.activeLoader);
  }
  const active = state.loaders.find((loader) => loader.id === state.activeLoader);
  loaderChip.textContent = active ? `${active.name} selected` : "Choose a loader";
}

async function selectLoader(loaderId) {
  state.activeLoader = loaderId;
  updateLoaderSelection();
  renderCreateInsights();
  setStatus("Loading available versions...");
  submitButton.disabled = true;
  minecraftVersion.disabled = true;
  variantField.hidden = true;
  variantSelect.disabled = true;

  try {
    const payload = await api(`/api/loaders/${loaderId}`);
    state.minecraftVersions = payload.minecraftVersions || [];
    state.loaderDefaults = payload.defaults || {};
    fillSelect(minecraftVersion, state.minecraftVersions, "Select a Minecraft version");
    minecraftVersion.disabled = false;
    minecraftVersion.value = state.minecraftVersions[0]?.id || "";
    updateJavaPolicy();
    await loadVariants();
    renderCreateInsights();
    setStatus("Versions loaded. Review the setup and create the folder.");
  } catch (error) {
    setStatus(error.message, "status-error");
  }
}

async function loadVariants() {
  const active = state.loaders.find((loader) => loader.id === state.activeLoader);
  const selectedVersion = minecraftVersion.value;
  if (!active || !selectedVersion) {
    variantField.hidden = true;
    variantSelect.disabled = true;
    submitButton.disabled = true;
    return;
  }

  if (!active.secondaryField) {
    state.variantKey = "";
    state.variantOptions = [];
    variantField.hidden = true;
    variantSelect.disabled = true;
    submitButton.disabled = false;
    return;
  }

  const payload = await api(`/api/loaders/${state.activeLoader}/variants?minecraftVersion=${encodeURIComponent(selectedVersion)}`);
  state.variantKey = payload.key;
  state.variantDefaults = payload.defaults || {};
  state.variantOptions = payload.options || [];
  variantField.hidden = false;
  variantLabel.textContent = payload.label;
  fillSelect(variantSelect, state.variantOptions, `Select ${payload.label.toLowerCase()}`);
  variantSelect.disabled = false;
  variantSelect.value = state.variantDefaults[state.variantKey] || state.variantOptions[0]?.value || "";
  submitButton.disabled = !variantSelect.value;
}

async function applyTemplate(templateId) {
  const template = state.templates.find((entry) => entry.id === templateId);
  if (!template) {
    return;
  }

  const profile = template.profile || {};
  document.getElementById("name").value = "";
  document.getElementById("motd").value = profile.motd || "";
  document.getElementById("memoryMb").value = profile.memoryMb || 4096;
  document.getElementById("port").value = profile.port || 25565;
  document.getElementById("onlineMode").checked = profile.onlineMode !== false;
  createJavaOverride.value = profile.javaOverrideMajor || "";
  createExtraJvmArgs.value = profile.extraJvmArgs || "";

  if (profile.loader) {
    await selectLoader(profile.loader);
  }
  minecraftVersion.value = profile.minecraftVersion || minecraftVersion.value;
  updateJavaPolicy();
  await loadVariants();
  if (state.variantKey && profile[state.variantKey]) {
    variantSelect.value = profile[state.variantKey];
  }
}

function renderServers() {
  const query = state.inventorySearch.trim().toLowerCase();
  const filteredServers = state.servers.filter((server) => {
    const searchMatch = !query || [server.name, server.loader, server.minecraftVersion, server.javaRuntime?.major && `java ${server.javaRuntime.major}`]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query);
    if (!searchMatch) {
      return false;
    }
    if (state.inventoryFilter === "running") {
      return server.runtimeState === "running";
    }
    if (state.inventoryFilter === "modded") {
      return Boolean(server.supportsMods);
    }
    if (state.inventoryFilter === "ready") {
      return server.runtimeState === "running" || server.status === "ready";
    }
    return true;
  });

  inventorySummary.textContent = filteredServers.length
    ? `${filteredServers.length} server${filteredServers.length === 1 ? "" : "s"} shown`
    : "No servers match this view.";

  if (!filteredServers.length) {
    serverList.innerHTML = `<div class="empty-state">No servers yet. Create one from the Create screen.</div>`;
    return;
  }

  serverList.innerHTML = filteredServers.map((server) => {
    const loaderName = state.loaders.find((loader) => loader.id === server.loader)?.name || server.loader;
    const activeClass = server.id === state.selectedServerId ? "active" : "";
    const javaLabel = server.javaRuntime?.major ? `Java ${server.javaRuntime.major}` : "Java auto";
    const deleteDisabled = server.runtimeState === "running" ? "disabled" : "";
    return `
      <article class="server-row ${activeClass}" data-server-id="${server.id}">
        <div class="server-row-top">
          <strong>${server.name}</strong>
          <div class="server-row-actions">
            <span class="server-state">${server.runtimeState || server.status}</span>
            <button type="button" class="secondary-button clone-server-button" data-server-id="${server.id}" data-server-name="${server.name}">Clone</button>
            <button type="button" class="secondary-button delete-server-button" data-server-id="${server.id}" data-server-name="${server.name}" ${deleteDisabled}>Delete</button>
          </div>
        </div>
        <div class="server-row-bottom">
          <span class="server-meta">${loaderName} · ${server.minecraftVersion}</span>
          <span class="server-meta">${javaLabel}</span>
        </div>
        <div class="server-path">${server.path}</div>
      </article>
    `;
  }).join("");
}

function formatTime(value) {
  if (!value) {
    return "Never";
  }
  return new Date(value).toLocaleString();
}

function formatSince(value) {
  if (!value) {
    return "Never";
  }
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) {
    return "Just now";
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 48) {
    return `${hours}h ago`;
  }
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function formatBytes(value) {
  const bytes = Number(value || 0);
  if (!bytes) {
    return "0 B";
  }
  const units = ["B", "KB", "MB", "GB", "TB"];
  const power = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const scaled = bytes / (1024 ** power);
  return `${scaled >= 10 || power === 0 ? scaled.toFixed(0) : scaled.toFixed(1)} ${units[power]}`;
}

// Prefer the host-provided LAN address when Resin knows one, and only fall back to localhost as a last resort.
function buildServerAddress(server, overview = {}) {
  return overview.connection?.preferred?.address || `127.0.0.1:${overview.port || server.port || 25565}`;
}

// Keep Overview actionable by surfacing the next trust-building step instead of a generic summary.
function buildOverviewRecommendations(server) {
  const overview = server.overview || {};
  const recommendations = [];

  if (server.readiness?.installNeeded) {
    recommendations.push({
      title: "Finish installer prep",
      detail: "Run the generated installer workflow before treating this server as launch-ready."
    });
  }
  if (server.readiness?.checks?.some((check) => check.key === "eula" && !check.ok)) {
    recommendations.push({
      title: "Accept the EULA",
      detail: "The server still needs an accepted Mojang EULA before a proper first boot."
    });
  }
  if (!overview.backups) {
    recommendations.push({
      title: "Create the first backup",
      detail: "Take a baseline snapshot before major mod, config, or world changes."
    });
  }
  if (server.health?.checks?.some((check) => check.label === "Port availability" && check.level !== "ok")) {
    recommendations.push({
      title: "Resolve the port issue",
      detail: "The configured port is occupied right now, so players may not be able to join."
    });
  }
  if (!recommendations.length) {
    recommendations.push({
      title: "Server looks healthy",
      detail: "You can jump straight into console, players, or mod maintenance from here."
    });
  }

  return recommendations.slice(0, 4);
}

// Summarize only the currently visible console slice so filters and search feel informative at a glance.
function buildConsoleInsightEntries(logs) {
  const counts = {
    lines: logs.length,
    joins: logs.filter((entry) => classifyLog(entry) === "joins").length,
    chat: logs.filter((entry) => classifyLog(entry) === "chat").length,
    errors: logs.filter((entry) => classifyLog(entry) === "errors").length,
    commands: logs.filter((entry) => classifyLog(entry) === "commands").length
  };

  return [
    ["Visible lines", String(counts.lines)],
    ["Joins", String(counts.joins)],
    ["Chat", String(counts.chat)],
    ["Warnings", String(counts.errors)],
    ["Commands", String(counts.commands)]
  ];
}

function classifyLog(entry) {
  const line = String(entry?.line || "");
  const source = String(entry?.source || "");
  if (source === "stdin") {
    return "commands";
  }
  if (/joined the game|left the game/i.test(line)) {
    return "joins";
  }
  if (/\[chat\]|<[^>]+>/.test(line)) {
    return "chat";
  }
  if (/warn|error|exception|failed|crash|can't|cannot/i.test(line) || source === "stderr") {
    return "errors";
  }
  return "general";
}

function renderConsoleOutputFromServer(server) {
  const logs = server?.runtime?.logs || [];
  let filtered = state.consoleFilter === "all"
    ? logs
    : logs.filter((entry) => classifyLog(entry) === state.consoleFilter);
  if (state.consoleSearch.trim()) {
    const query = state.consoleSearch.trim().toLowerCase();
    filtered = filtered.filter((entry) => String(entry.line || "").toLowerCase().includes(query) || String(entry.source || "").toLowerCase().includes(query));
  }
  if (Array.isArray(state.consoleDisplayOverride)) {
    filtered = state.consoleDisplayOverride;
  }
  const shouldStick = consoleAutoscroll.checked && (consoleOutput.scrollHeight - consoleOutput.scrollTop - consoleOutput.clientHeight < 60);
  const renderedLines = filtered.length
    ? filtered.map((entry) => {
        const stamp = entry.at ? new Date(entry.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--:--:--";
        return `[${stamp}] ${entry.source}> ${entry.line}`;
      }).join("\n")
    : "No console output for this filter yet.";
  consoleOutput.textContent = renderedLines;
  consoleInsightBar.innerHTML = buildConsoleInsightEntries(filtered).map(([label, value]) => `
    <div class="metric-pill">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `).join("");

  if (shouldStick || consoleAutoscroll.checked) {
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
  }
}

// Render Overview as a decision surface, not just a data dump, so the operator can tell what matters first.
function renderOverview(server, loaderName, isRunning) {
  overviewTitle.textContent = `Overview · ${server.name}`;
  overviewRuntime.textContent = isRunning ? "Running" : server.status;
  overviewEmpty.hidden = true;
  overviewPanel.hidden = false;

  overviewSummary.textContent = server.readiness?.installNeeded
    ? "This loader still needs its installer/runtime prep before it is truly ready."
    : "Resin has enough context here to tell you whether the server is runnable and what needs attention.";

  const overview = server.overview || {};
  overviewHeroMeta.innerHTML = [
    [server.readiness?.blocked ? "Blocked setup" : overview.ready ? "Ready to run" : "Needs review", server.readiness?.blocked ? "" : overview.ready ? "runtime-badge-green" : "runtime-badge-blue"],
    [`${loaderName} ${server.minecraftVersion}`, "runtime-badge-blue"],
    [server.javaRuntime ? `Java ${server.javaRuntime.major}` : "Java auto", ""],
    [overview.onlineMode ? "Online mode" : "Offline mode", ""]
  ].map(([label, className]) => `<span class="${`runtime-badge ${className}`.trim()}">${label}</span>`).join("");
  overviewStats.innerHTML = [
    ["Runtime", overview.runtimeState || "stopped"],
    ["Ready", overview.ready ? "Yes" : "Needs attention"],
    ["Players online", `${overview.onlinePlayers || 0} / ${overview.maxPlayers || 20}`],
    ["Known players", String(overview.knownPlayers || 0)],
    ["Mods", String(overview.mods || 0)],
    ["Backups", String(overview.backups || 0)],
    ["World", overview.worldName || "world"],
    ["Port", String(overview.port || server.port || 25565)]
  ].map(([label, value]) => `
    <div class="stat-surface">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `).join("");
  overviewRecommendations.innerHTML = buildOverviewRecommendations(server).map((item) => `
    <div class="list-row compact-row">
      <div>
        <strong>${item.title}</strong>
        <div class="server-meta">${item.detail}</div>
      </div>
    </div>
  `).join("");

  readinessPill.textContent = server.readiness?.blocked ? "Blocked" : server.readiness?.ready ? "Ready" : "Needs review";
  readinessPill.className = `runtime-badge ${server.readiness?.blocked ? "" : server.readiness?.ready ? "runtime-badge-green" : "runtime-badge-blue"}`.trim();
  readinessList.innerHTML = (server.readiness?.checks || []).map((check) => `
    <div class="list-row">
      <div>
        <strong>${check.label}</strong>
        <div class="server-meta">${check.message}</div>
      </div>
      <span class="runtime-badge ${check.ok ? "runtime-badge-green" : check.level === "warning" ? "runtime-badge-blue" : ""}">${check.level}</span>
    </div>
  `).join("") || `<div class="empty-state">No readiness data yet.</div>`;

  const address = buildServerAddress(server, overview);
  const connection = overview.connection || {};
  const alternativeAddresses = connection.alternatives || [];
  const primaryLabel = connection.preferred?.host === "127.0.0.1" ? "Local address" : "LAN address";
  // Make the join target the focal point so the operator can share or paste it quickly.
  overviewConnection.innerHTML = `
    <div class="connection-surface">
      <div class="connection-hero">
        <div>
          <span class="connection-label">${primaryLabel}</span>
          <strong class="connection-address">${address}</strong>
          <div class="server-meta">${connection.preferred?.host === "127.0.0.1" ? "Only this machine can use localhost. Resin could not find a LAN IP yet." : "Devices on your local network can use this address in Minecraft."}</div>
        </div>
        <button type="button" class="secondary-button copy-address-button" data-address="${address}" aria-label="Copy server IP ${address}">Copy IP</button>
      </div>
      ${alternativeAddresses.length ? `
        <div class="connection-alt-list">
          ${alternativeAddresses.map((entry) => `
            <div class="list-row compact-row connection-alt-row">
              <div>
                <strong>${entry.address}</strong>
                <div class="server-meta">${entry.label}</div>
              </div>
              <button type="button" class="secondary-button copy-address-button" data-address="${entry.address}" aria-label="Copy alternate server IP ${entry.address}">Copy</button>
            </div>
          `).join("")}
        </div>
      ` : ""}
      <div class="connection-meta-grid">
        ${[
          ["Loader", loaderName],
          ["Java", server.javaRuntime ? `Java ${server.javaRuntime.major}` : "Auto"],
          ["World", overview.worldName || "world"],
          ["Last backup", overview.lastBackupAt ? formatSince(overview.lastBackupAt) : "None yet"]
        ].map(([label, value]) => `
          <div class="stat-surface connection-stat">
            <span>${label}</span>
            <strong>${value}</strong>
          </div>
        `).join("")}
      </div>
    </div>
  `;

  const onlinePlayers = (server.players || []).filter((player) => player.online);
  overviewPlayers.innerHTML = onlinePlayers.length
    ? onlinePlayers.map((player) => `
      <div class="list-row compact-row">
        <strong>${player.name}</strong>
        <span class="runtime-badge runtime-badge-green">Online</span>
      </div>
    `).join("")
    : `<div class="empty-state">Nobody is online right now.</div>`;

  overviewActivity.innerHTML = (server.activity || []).slice(0, 5).map((entry) => `
    <div class="list-row">
      <div>
        <strong>${entry.message}</strong>
        <div class="server-meta">${formatTime(entry.at)}</div>
      </div>
      <span class="runtime-badge">${entry.type}</span>
    </div>
  `).join("") || `<div class="empty-state">No activity yet.</div>`;
}

// Give Health a compact summary before the full checklist so blockers stand out immediately.
function renderHealth(server, isRunning) {
  healthTitle.textContent = `Health · ${server.name}`;
  healthRuntime.textContent = isRunning ? "Live checks" : "Static checks";
  healthEmpty.hidden = true;
  healthPanel.hidden = false;
  healthSummary.textContent = server.health?.summary === "Blocked"
    ? "This server has at least one blocker that should be fixed before normal use."
    : "Health checks combine startup readiness, Java profile, port availability, EULA state, and mod follow-up warnings.";
  const totalChecks = server.health?.checks || [];
  healthOverviewCards.innerHTML = [
    ["Summary", server.health?.summary || "Unknown"],
    ["Checks", String(totalChecks.length)],
    ["Errors", String(totalChecks.filter((check) => check.level === "error").length)],
    ["Warnings", String(totalChecks.filter((check) => check.level === "warning").length)]
  ].map(([label, value]) => `
    <div class="stat-surface">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `).join("");
  healthChecks.innerHTML = (server.health?.checks || []).map((check) => `
    <div class="list-row">
      <div>
        <strong>${check.label}</strong>
        <div class="server-meta">${check.message}</div>
      </div>
      <span class="runtime-badge ${check.level === "ok" ? "runtime-badge-green" : check.level === "warning" ? "runtime-badge-blue" : ""}">${check.level}</span>
    </div>
  `).join("") || `<div class="empty-state">No health checks yet.</div>`;
}

function renderPlayers(server, loaderName, isRunning) {
  playersTitle.textContent = `Players · ${server.name}`;
  playersRuntime.textContent = isRunning ? "Live" : "Known players";
  playersEmpty.hidden = true;
  playersPanel.hidden = false;
  playersServerName.textContent = server.name;
  playersLoader.textContent = loaderName;
  playersVersion.textContent = server.minecraftVersion;
  playersHint.textContent = isRunning
    ? "Live join status is shown while the server is running. OP, whitelist, and ban actions are available here."
    : "Known players come from server records and previous joins. Start the server to see live join status.";

  const query = state.playersSearch.trim().toLowerCase();
  const visiblePlayers = (server.players || []).filter((player) => {
    if (!query) {
      return true;
    }
    return [player.name, player.online ? "online" : "offline", player.op ? "op" : "", player.whitelisted ? "whitelisted" : "", player.banned ? "banned" : ""]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  if (!visiblePlayers.length) {
    playersList.innerHTML = `<div class="empty-state">${query ? "No players match this filter." : "No players have joined this server yet."}</div>`;
    return;
  }

  playersList.innerHTML = visiblePlayers.map((player) => `
    <article class="player-row">
      <div class="player-row-main">
        <div class="player-row-top">
          <strong>${player.name}</strong>
          <div class="player-badges">
            ${player.online ? `<span class="runtime-badge runtime-badge-green">Online</span>` : `<span class="runtime-badge">Offline</span>`}
            ${player.op ? `<span class="runtime-badge runtime-badge-blue">OP</span>` : ""}
            ${player.whitelisted ? `<span class="runtime-badge runtime-badge-blue">Whitelisted</span>` : ""}
            ${player.banned ? `<span class="runtime-badge">Banned</span>` : ""}
          </div>
        </div>
        <div class="player-row-bottom">
          <span class="server-meta">${player.uuid || "UUID not recorded yet"}</span>
          <span class="server-meta">${player.lastSeenAt ? `Last seen ${formatTime(player.lastSeenAt)}` : "Seen on this server"}</span>
        </div>
      </div>
      <div class="player-row-actions">
        ${player.online ? `<button type="button" class="secondary-button player-action-button" data-action="kick" data-player-name="${player.name}">Kick</button>` : ""}
        <button type="button" class="secondary-button player-action-button" data-action="${player.op ? "deop" : "op"}" data-player-name="${player.name}">${player.op ? "Remove OP" : "Give OP"}</button>
        <button type="button" class="secondary-button player-action-button" data-action="whitelist" data-enabled="${player.whitelisted ? "false" : "true"}" data-player-name="${player.name}">${player.whitelisted ? "Remove Whitelist" : "Whitelist"}</button>
        <button type="button" class="secondary-button player-action-button" data-action="${player.banned ? "pardon" : "ban"}" data-enabled="${player.banned ? "false" : "true"}" data-player-name="${player.name}">${player.banned ? "Pardon" : "Ban"}</button>
      </div>
    </article>
  `).join("");
}

function renderSettings(server, isRunning) {
  settingsTitle.textContent = `Settings · ${server.name}`;
  settingsRuntime.textContent = isRunning ? "May need restart" : "Editable";
  settingsEmpty.hidden = true;
  settingsPanel.hidden = false;

  const properties = server.properties || {};
  for (const [key, element] of Object.entries(settingFields)) {
    if (!element) {
      continue;
    }
    const value = properties[key] ?? "";
    if (element.type === "checkbox") {
      element.checked = String(value).toLowerCase() === "true";
    } else {
      element.value = value;
    }
  }
  settingsRawEditor.value = server.propertiesRaw || "";
  runtimeMemoryMb.value = server.memoryMb || 4096;
  runtimeJavaOverride.value = server.javaOverrideMajor || "";
  runtimeExtraJvmArgs.value = server.extraJvmArgs || "";
  setSettingsStatus("Settings loaded from server.properties.");
}

function renderBackups(server, isRunning) {
  backupsTitle.textContent = `Backups · ${server.name}`;
  backupsRuntime.textContent = isRunning ? "Live copy" : "Ready";
  backupsEmpty.hidden = true;
  backupsPanel.hidden = false;
  backupCadence.value = server.backupSchedule?.cadence || "daily";
  backupRetention.value = server.backupSchedule?.retention || 7;
  backupScheduleEnabled.checked = Boolean(server.backupSchedule?.enabled);
  backupScheduleSummary.textContent = server.backupSchedule?.enabled
    ? `Next ${server.backupSchedule.cadence} backup: ${server.backupSchedule.nextRunAt ? formatTime(server.backupSchedule.nextRunAt) : "waiting"} · keep ${server.backupSchedule.retention}`
    : "Scheduled backups are currently disabled.";
  backupsList.innerHTML = (server.backups || []).length
    ? server.backups.map((backup) => `
      <div class="list-row backup-row ${backup.id === state.selectedBackupId ? "selected" : ""}" data-backup-id="${backup.id}">
        <div>
          <strong>${backup.id}</strong>
          <div class="server-meta">${formatTime(backup.createdAt)}${backup.note ? ` · ${backup.note}` : ""}</div>
          <div class="server-meta">${backup.worldName || "world"} · ${formatBytes(backup.sizeBytes)} · ${backup.fileCount || 0} files</div>
        </div>
        <div class="backup-actions">
          <span class="runtime-badge">${backup.sourceState}</span>
          <button type="button" class="secondary-button select-backup-button" data-backup-id="${backup.id}">Preview</button>
        </div>
      </div>
    `).join("")
    : `<div class="empty-state">No backups yet.</div>`;
  const selectedBackup = (server.backups || []).find((backup) => backup.id === state.selectedBackupId) || server.backups?.[0] || null;
  state.selectedBackupId = selectedBackup?.id || "";
  backupDetail.innerHTML = selectedBackup
    ? [
        ["Created", formatTime(selectedBackup.createdAt)],
        ["World", selectedBackup.worldName || "world"],
        ["Snapshot", `${formatBytes(selectedBackup.sizeBytes)} · ${selectedBackup.fileCount || 0} files`],
        ["Source", selectedBackup.sourceState],
        ["Version", `${selectedBackup.loader || server.loader} · ${selectedBackup.minecraftVersion || server.minecraftVersion}`],
        ["Note", selectedBackup.note || "No note recorded"]
      ].map(([label, value]) => `
        <div class="list-row compact-row">
          <strong>${label}</strong>
          <span class="server-meta">${value}</span>
        </div>
      `).join("")
    : `<div class="empty-state">Select a backup to preview its restore scope.</div>`;
  confirmRestoreButton.disabled = !selectedBackup || isRunning;
  confirmRestoreButton.dataset.backupId = selectedBackup?.id || "";
}

// Present activity as an operational timeline so changes read like recent server history.
function renderActivity(server, isRunning) {
  activityTitle.textContent = `Activity · ${server.name}`;
  activityRuntime.textContent = isRunning ? "Tracking" : "History";
  activityEmpty.hidden = true;
  activityPanel.hidden = false;
  activityList.innerHTML = (server.activity || []).length
    ? server.activity.map((entry) => `
      <div class="activity-entry">
        <div class="activity-marker"></div>
        <div class="list-row">
        <div>
          <strong>${entry.message}</strong>
          <div class="server-meta">${formatTime(entry.at)}</div>
        </div>
        <span class="runtime-badge">${entry.type}</span>
      </div>
      </div>
    `).join("")
    : `<div class="empty-state">No activity yet.</div>`;
}

function renderInstalledMods(mods) {
  installedModsList.innerHTML = mods.length
    ? mods.map((mod) => `
      <div class="installed-item">
        <div>
          <strong>${mod.title || mod.filename}</strong>
          <div class="server-meta">${mod.versionNumber || mod.filename}</div>
        </div>
        <div class="row-action-wrap">
          ${mod.isDependency ? `<span class="runtime-badge">dependency</span>` : ""}
          <button type="button" class="secondary-button mod-remove-button" data-filename="${mod.filename}">Remove</button>
        </div>
      </div>
    `).join("")
    : `<div class="empty-state">No downloaded mods yet.</div>`;
}

function renderModResults() {
  const selected = new Set(state.selectedModProjectIds);
  modResults.innerHTML = state.modSearchResults.length
    ? state.modSearchResults.map((mod) => `
      <article class="mod-result">
        <div class="mod-result-top mod-result-top-rich">
          <label class="mod-select">
            <input type="checkbox" class="mod-select-checkbox" data-project-id="${mod.projectId}" ${selected.has(mod.projectId) ? "checked" : ""} />
          </label>
          <div class="mod-result-identity">
            <div class="mod-result-avatar">
              ${mod.iconUrl ? `<img src="${mod.iconUrl}" alt="" loading="lazy" />` : `<span>${mod.title.charAt(0)}</span>`}
            </div>
            <div class="mod-result-copy">
              <strong>${mod.title}</strong>
              <span class="server-meta">${mod.author}</span>
            </div>
          </div>
          ${mod.alreadyInstalled ? `<span class="runtime-badge">Installed</span>` : ""}
        </div>
        <p>${mod.description || "No description provided."}</p>
        <div class="mod-result-bottom">
          <span class="server-meta">${mod.categories.join(", ")}</span>
          <span class="server-meta">${mod.downloads.toLocaleString()} downloads</span>
        </div>
      </article>
    `).join("")
    : `<div class="empty-state">No mod results yet.</div>`;

  for (const checkbox of modResults.querySelectorAll(".mod-select-checkbox")) {
    checkbox.addEventListener("change", () => toggleModSelection(checkbox.dataset.projectId, checkbox.checked));
  }
  renderModSelectionSummary();
}

function renderMods(server, loaderName) {
  modsTitle.textContent = `Mods · ${server.name}`;
  modsRuntime.textContent = server.supportsMods !== false ? "Mod-capable" : "Unsupported";
  if (server.supportsMods === false) {
    modsEmpty.hidden = false;
    modsPanel.hidden = true;
    modsEmpty.textContent = "This loader does not support Resin's mod downloading flow.";
    return;
  }
  modsEmpty.hidden = true;
  modsPanel.hidden = false;
  modsLoader.textContent = loaderName;
  modsVersion.textContent = server.minecraftVersion;
  modsPath.textContent = server.path;
  modsSearchHint.textContent = `Results are filtered to ${loaderName} on Minecraft ${server.minecraftVersion}, and required Modrinth dependencies will be downloaded automatically.`;
  renderInstalledMods(server.mods || []);
  renderModUpdates();
  renderModSelectionSummary();
}

function renderModUpdates() {
  modUpdateList.innerHTML = state.modUpdates.length
    ? state.modUpdates.map((entry) => `
      <div class="list-row compact-row">
        <div>
          <strong>${entry.title}</strong>
          <div class="server-meta">${entry.currentVersion} -> ${entry.latestVersion}</div>
        </div>
        <span class="runtime-badge runtime-badge-blue">Update available</span>
      </div>
    `).join("")
    : `<div class="empty-state">No update warnings right now.</div>`;
}

function renderFiles(server, isRunning) {
  filesTitle.textContent = `Files · ${server.name}`;
  filesRuntime.textContent = isRunning ? "Live filesystem" : "Filesystem";
  filesEmpty.hidden = true;
  filesPanel.hidden = false;
  if (!state.openFilePath) {
    fileEditorLabel.textContent = "Select a text file to edit it here.";
    downloadFileLink.href = "#";
  }
}

function renderFileBrowser(payload) {
  filesPathLabel.textContent = payload.path ? `Browsing /${payload.path}` : "Browsing /";
  filesUpButton.disabled = !payload.path;
  fileList.innerHTML = payload.items.length
    ? payload.items.map((item) => `
      <div class="list-row compact-row">
        <div>
          <strong>${item.name}</strong>
          <div class="server-meta">${item.type} · ${item.size} bytes · ${formatTime(item.modifiedAt)}</div>
        </div>
        <div class="row-action-wrap">
          ${item.type === "directory" ? `<button type="button" class="secondary-button file-open-button" data-path="${item.path}" data-type="directory">Open</button>` : ""}
          ${item.type === "file" && item.textEditable ? `<button type="button" class="secondary-button file-open-button" data-path="${item.path}" data-type="file">Edit</button>` : ""}
          ${item.type === "file" ? `<a class="secondary-button anchor-button" href="/api/servers/${state.selectedServerId}/files?download=1&path=${encodeURIComponent(item.path)}" target="_blank" rel="noopener">Download</a>` : ""}
          <button type="button" class="secondary-button file-rename-button" data-path="${item.path}">Rename</button>
          <button type="button" class="secondary-button file-delete-button" data-path="${item.path}">Delete</button>
        </div>
      </div>
    `).join("")
    : `<div class="empty-state">This folder is empty.</div>`;
}

function renderSelectedServer() {
  const server = state.selectedServer;
  if (!server) {
    activeServerDisplay.textContent = "No server selected";
    activeServerMeta.textContent = "Select one from Inventory to unlock management screens.";
    topbarRuntimeChip.textContent = "No runtime";
    topbarAddressChip.textContent = "No address";
    topbarHealthChip.textContent = "Waiting";
    overviewEmpty.hidden = false;
    overviewPanel.hidden = true;
    overviewTitle.textContent = "Select a server";
    overviewRuntime.textContent = "Idle";
    healthEmpty.hidden = false;
    healthPanel.hidden = true;
    healthTitle.textContent = "Select a server";
    healthRuntime.textContent = "No server";

    managerEmpty.hidden = false;
    managerPanel.hidden = true;
    managerTitle.textContent = "Select a server";
    managerRuntime.textContent = "Idle";
    managerJavaBadge.textContent = "Java";
    deleteServerButton.disabled = true;

    playersEmpty.hidden = false;
    playersPanel.hidden = true;
    playersTitle.textContent = "Select a server";
    playersRuntime.textContent = "No server";

    settingsEmpty.hidden = false;
    settingsPanel.hidden = true;
    settingsTitle.textContent = "Select a server";
    settingsRuntime.textContent = "No server";

    backupsEmpty.hidden = false;
    backupsPanel.hidden = true;
    backupsTitle.textContent = "Select a server";
    backupsRuntime.textContent = "No server";

    activityEmpty.hidden = false;
    activityPanel.hidden = true;
    activityTitle.textContent = "Select a server";
    activityRuntime.textContent = "No server";

    modsEmpty.hidden = false;
    modsPanel.hidden = true;
    modsTitle.textContent = "Select a server";
    modsRuntime.textContent = "No server";
    filesEmpty.hidden = false;
    filesPanel.hidden = true;
    filesTitle.textContent = "Select a server";
    filesRuntime.textContent = "No server";
    // Reset derived UI so the last selected server does not leak into empty states.
    overviewHeroMeta.innerHTML = "";
    overviewRecommendations.innerHTML = "";
    healthOverviewCards.innerHTML = "";
    consoleInsightBar.innerHTML = "";
    backupDetail.innerHTML = `<div class="empty-state">Select a backup to preview its restore scope.</div>`;
    confirmRestoreButton.disabled = true;
    confirmRestoreButton.dataset.backupId = "";
    state.selectedModProjectIds = [];
    state.modUpdates = [];
    state.fileBrowserPath = "";
    state.openFilePath = "";
    state.selectedBackupId = "";
    state.consoleDisplayOverride = null;
    fileEditor.value = "";
    fileEditorLabel.textContent = "Select a text file to edit it here.";
    consoleOutput.textContent = "";
    renderModResults();
    renderModUpdates();
    return;
  }

  const loaderName = state.loaders.find((loader) => loader.id === server.loader)?.name || server.loader;
  const isRunning = server.runtime?.runtimeState === "running";
  const preferredAddress = buildServerAddress(server, server.overview || {});

  activeServerDisplay.textContent = server.name;
  activeServerMeta.textContent = `${loaderName} · ${server.minecraftVersion}${server.javaRuntime ? ` · Java ${server.javaRuntime.major}` : ""}`;
  topbarRuntimeChip.textContent = isRunning ? "Running now" : "Stopped";
  topbarAddressChip.textContent = preferredAddress;
  topbarHealthChip.textContent = server.readiness?.blocked ? "Blocked setup" : server.readiness?.installNeeded ? "Installer needed" : "Ready state";

  renderOverview(server, loaderName, isRunning);
  renderHealth(server, isRunning);

  managerEmpty.hidden = true;
  managerPanel.hidden = false;
  managerTitle.textContent = server.name;
  managerRuntime.textContent = isRunning ? "Running" : server.status;
  managerLoader.textContent = loaderName;
  managerVersion.textContent = `${server.minecraftVersion}${server.loaderVersion ? ` · ${server.loaderVersion}` : ""}`;
  managerJava.textContent = server.javaRuntime ? `Java ${server.javaRuntime.major} · ${server.javaRuntime.version}` : "Auto";
  managerJavaBadge.textContent = server.javaRuntime ? `Java ${server.javaRuntime.major}` : "Java auto";
  managerJavaReason.textContent = server.javaRuntime?.reason || "Resin selected the best available Java runtime.";
  managerPath.textContent = server.path;
  deleteServerButton.disabled = isRunning;
  startServerButton.disabled = isRunning;
  stopServerButton.disabled = !isRunning;
  overviewStartButton.disabled = isRunning;
  overviewStopButton.disabled = !isRunning;
  sendCommandButton.disabled = !isRunning;
  commandInput.disabled = !isRunning;
  renderConsoleOutputFromServer(server);

  renderPlayers(server, loaderName, isRunning);
  renderSettings(server, isRunning);
  renderBackups(server, isRunning);
  renderActivity(server, isRunning);
  renderMods(server, loaderName);
  renderFiles(server, isRunning);
}

function stopDetailPolling() {
  if (state.detailTimer) {
    clearInterval(state.detailTimer);
    state.detailTimer = null;
  }
}

function startDetailPolling() {
  stopDetailPolling();
  if (!state.selectedServerId) {
    return;
  }
  state.detailTimer = setInterval(() => {
    refreshSelectedServer({ silent: true });
  }, 3000);
}

async function refreshServers() {
  const payload = await api("/api/servers");
  state.servers = payload.servers || [];
  renderSidebarStats();
  renderServers();
}

async function refreshTemplates() {
  const payload = await api("/api/templates");
  state.templates = payload.templates || [];
  renderTemplates();
}

async function selectServer(serverId) {
  state.selectedServerId = serverId;
  renderServers();
  await refreshSelectedServer();
  startDetailPolling();
  setActiveMenu("overview");
}

async function refreshSelectedServer(options = {}) {
  if (!state.selectedServerId) {
    return;
  }
  try {
    // Reset temporary console view overrides whenever fresh runtime data arrives.
    state.consoleDisplayOverride = null;
    state.selectedServer = await api(`/api/servers/${state.selectedServerId}`);
    renderSelectedServer();
    if (state.selectedServerId && state.activeMenu === "files") {
      await loadFileBrowser(state.fileBrowserPath || "");
    }
    if (state.selectedServerId && state.activeMenu === "mods") {
      await refreshModUpdates({ silent: true });
    }
    await refreshServers();
    if (!options.silent) {
      setStatus(`Loaded controls for ${state.selectedServer.name}.`);
    }
  } catch (error) {
    if (!options.silent) {
      setStatus(error.message, "status-error");
    }
  }
}

async function refreshModUpdates(options = {}) {
  if (!state.selectedServerId) {
    return;
  }
  try {
    const payload = await api(`/api/servers/${state.selectedServerId}/mod-updates`);
    state.modUpdates = payload.updates || [];
    renderModUpdates();
    if (!options.silent) {
      setStatus("Checked installed mods for updates.", "status-success");
    }
  } catch (error) {
    if (!options.silent) {
      setStatus(error.message, "status-error");
    }
  }
}

async function loadFileBrowser(relativePath = "") {
  if (!state.selectedServerId) {
    return;
  }
  const payload = await api(`/api/servers/${state.selectedServerId}/files?path=${encodeURIComponent(relativePath)}`);
  state.fileBrowserPath = payload.path || "";
  renderFileBrowser(payload);
}

async function openServerFile(relativePath) {
  if (!state.selectedServerId) {
    return;
  }
  const payload = await api(`/api/servers/${state.selectedServerId}/files?open=1&path=${encodeURIComponent(relativePath)}`);
  state.openFilePath = payload.path;
  fileEditor.value = payload.content;
  fileEditorLabel.textContent = `Editing /${payload.path}`;
  downloadFileLink.href = `/api/servers/${state.selectedServerId}/files?download=1&path=${encodeURIComponent(payload.path)}`;
}

async function startSelectedServer() {
  if (!state.selectedServerId) {
    return;
  }
  setStatus("Launching server with Resin's selected Java runtime...");
  try {
    state.selectedServer = await api(`/api/servers/${state.selectedServerId}/start`, {
      method: "POST",
      body: JSON.stringify({})
    });
    renderSelectedServer();
    await refreshServers();
    startDetailPolling();
    setStatus(`${state.selectedServer.name} start request sent.`, "status-success");
  } catch (error) {
    setStatus(error.message, "status-error");
  }
}

async function stopSelectedServer() {
  if (!state.selectedServerId) {
    return;
  }
  try {
    state.selectedServer = await api(`/api/servers/${state.selectedServerId}/stop`, {
      method: "POST",
      body: JSON.stringify({})
    });
    renderSelectedServer();
    setStatus(`Stop requested for ${state.selectedServer.name}.`, "status-success");
  } catch (error) {
    setStatus(error.message, "status-error");
  }
}

function rememberCommand(command) {
  if (!command) {
    return;
  }
  state.commandHistory = [command, ...state.commandHistory.filter((entry) => entry !== command)].slice(0, 30);
  state.commandHistoryIndex = -1;
  localStorage.setItem("resinCommandHistory", JSON.stringify(state.commandHistory));
}

async function sendConsoleCommand(commandOverride = "") {
  if (!state.selectedServerId) {
    return;
  }
  const command = String(commandOverride || commandInput.value || "").trim();
  if (!command) {
    return;
  }
  try {
    state.selectedServer = await api(`/api/servers/${state.selectedServerId}/command`, {
      method: "POST",
      body: JSON.stringify({ command })
    });
    rememberCommand(command);
    commandInput.value = "";
    renderSelectedServer();
  } catch (error) {
    setStatus(error.message, "status-error");
  }
}

async function searchMods() {
  if (!state.selectedServerId) {
    setStatus("Select a server first.", "status-error");
    return;
  }
  try {
    const payload = await api(`/api/servers/${state.selectedServerId}/mods?query=${encodeURIComponent(modSearchInput.value)}`);
    state.modSearchResults = payload.hits || [];
    state.selectedModProjectIds = [];
    modsSearchHint.textContent = `Showing Modrinth results for ${payload.server.loader} on Minecraft ${payload.server.minecraftVersion}. Required dependencies will be resolved automatically.`;
    renderModResults();
  } catch (error) {
    setStatus(error.message, "status-error");
  }
}

function renderModSelectionSummary() {
  const count = state.selectedModProjectIds.length;
  modsSelectionSummary.textContent = count ? `${count} mod${count === 1 ? "" : "s"} selected.` : "No mods selected.";
  modsDownloadSelectedButton.disabled = count === 0;
  modsClearSelectionButton.disabled = count === 0;
  modsSelectAllButton.disabled = state.modSearchResults.length === 0;
}

function toggleModSelection(projectId, checked) {
  const next = new Set(state.selectedModProjectIds);
  if (checked) {
    next.add(projectId);
  } else {
    next.delete(projectId);
  }
  state.selectedModProjectIds = Array.from(next);
  renderModSelectionSummary();
}

async function downloadSelectedMods() {
  if (!state.selectedServerId || !state.selectedModProjectIds.length) {
    return;
  }
  modsDownloadSelectedButton.disabled = true;
  setStatus(`Resolving dependencies and downloading ${state.selectedModProjectIds.length} selected mod${state.selectedModProjectIds.length === 1 ? "" : "s"}...`);
  try {
    const payload = await api(`/api/servers/${state.selectedServerId}/mods`, {
      method: "POST",
      body: JSON.stringify({ projectIds: state.selectedModProjectIds })
    });
    if (state.selectedServer) {
      state.selectedServer.mods = payload.mods;
    }
    const installedProjectIds = new Set([...(payload.installed || []), ...(payload.skipped || [])].map((entry) => entry.projectId).filter(Boolean));
    state.modSearchResults = state.modSearchResults.map((mod) => ({
      ...mod,
      alreadyInstalled: mod.alreadyInstalled || installedProjectIds.has(mod.projectId)
    }));

    state.selectedModProjectIds = [];
    renderInstalledMods(state.selectedServer?.mods || []);
    renderModResults();
    await refreshModUpdates({ silent: true });
    await refreshSelectedServer({ silent: true });
    const dependencyCount = (payload.installed || []).filter((entry) => entry.isDependency).length;
    const unresolvedCount = (payload.unresolved || []).length;
    const summary = [
      `Installed ${(payload.installed || []).length} file${(payload.installed || []).length === 1 ? "" : "s"}`,
      dependencyCount ? `${dependencyCount} dependency file${dependencyCount === 1 ? "" : "s"}` : "",
      (payload.skipped || []).length ? `${payload.skipped.length} already present` : "",
      unresolvedCount ? `${unresolvedCount} need manual review` : ""
    ].filter(Boolean).join(" · ");
    setStatus(summary, unresolvedCount ? "status-error" : "status-success");
  } catch (error) {
    setStatus(error.message, "status-error");
  } finally {
    modsDownloadSelectedButton.disabled = false;
    renderModSelectionSummary();
  }
}

async function removeInstalledMod(filename) {
  if (!state.selectedServerId) {
    return;
  }
  try {
    const payload = await api(`/api/servers/${state.selectedServerId}/mod-remove`, {
      method: "POST",
      body: JSON.stringify({ filename })
    });
    if (state.selectedServer) {
      state.selectedServer.mods = payload.mods;
    }
    renderInstalledMods(payload.mods || []);
    state.modUpdates = state.modUpdates.filter((entry) => entry.filename !== filename);
    renderModUpdates();
    await refreshModUpdates({ silent: true });
    setStatus(`Removed ${filename}.`, "status-success");
  } catch (error) {
    setStatus(error.message, "status-error");
  }
}

async function deleteServer(serverId, serverName = "this server") {
  const target = state.servers.find((server) => server.id === serverId);
  if (!window.confirm(`Delete ${serverName}? This removes the server folder and all Resin backups for it.`)) {
    return;
  }

  try {
    await api(`/api/servers/${serverId}`, {
      method: "DELETE"
    });
    if (state.selectedServerId === serverId) {
      state.selectedServerId = "";
      state.selectedServer = null;
      stopDetailPolling();
      renderSelectedServer();
    }
    await refreshServers();
    setActiveMenu("inventory");
    setStatus(`${target?.name || serverName} was deleted.`, "status-success");
  } catch (error) {
    setStatus(error.message, "status-error");
  }
}

async function runPlayerAction(action, playerName, enabled) {
  if (!state.selectedServerId) {
    return;
  }
  const endpoint = {
    op: "op",
    deop: "deop",
    whitelist: "whitelist",
    ban: "ban",
    pardon: "pardon",
    kick: "kick"
  }[action];
  if (!endpoint) {
    return;
  }
  try {
    const reason = ["ban", "kick"].includes(action) ? playerReasonInput.value.trim() : "";
    const payload = await api(`/api/servers/${state.selectedServerId}/${endpoint}`, {
      method: "POST",
      body: JSON.stringify({
        playerName,
        enabled,
        reason
      })
    });
    if (state.selectedServer && payload.players) {
      state.selectedServer.players = payload.players;
      renderPlayers(state.selectedServer, state.loaders.find((loader) => loader.id === state.selectedServer.loader)?.name || state.selectedServer.loader, state.selectedServer.runtime?.runtimeState === "running");
    }
    await refreshSelectedServer({ silent: true });
    if (["ban", "kick"].includes(action)) {
      playerReasonInput.value = "";
    }
    setStatus(`${action} updated for ${playerName}.`, "status-success");
  } catch (error) {
    setStatus(error.message, "status-error");
  }
}

async function saveSettings(event) {
  event.preventDefault();
  if (!state.selectedServerId) {
    return;
  }
  const properties = {};
  for (const [key, element] of Object.entries(settingFields)) {
    properties[key] = element.type === "checkbox" ? element.checked : element.value;
  }

  saveSettingsButton.disabled = true;
  setSettingsStatus("Saving server.properties...");
  try {
    const payload = await api(`/api/servers/${state.selectedServerId}/settings`, {
      method: "POST",
      body: JSON.stringify({ properties })
    });
    if (state.selectedServer) {
      state.selectedServer.properties = payload.properties;
      state.selectedServer.propertiesRaw = payload.rawContent;
    }
    await refreshSelectedServer({ silent: true });
    setSettingsStatus("Settings saved. Some changes may need a restart.", "status-success");
    setStatus(`Saved settings for ${state.selectedServer?.name || "server"}.`, "status-success");
  } catch (error) {
    setSettingsStatus(error.message, "status-error");
  } finally {
    saveSettingsButton.disabled = false;
  }
}

async function saveRawSettings() {
  if (!state.selectedServerId) {
    return;
  }
  saveRawSettingsButton.disabled = true;
  setSettingsStatus("Saving full server.properties file...");
  try {
    const payload = await api(`/api/servers/${state.selectedServerId}/settings`, {
      method: "POST",
      body: JSON.stringify({
        properties: {
          rawContent: settingsRawEditor.value
        }
      })
    });
    if (state.selectedServer) {
      state.selectedServer.properties = payload.properties;
      state.selectedServer.propertiesRaw = payload.rawContent;
    }
    await refreshSelectedServer({ silent: true });
    setSettingsStatus("Full server.properties file saved.", "status-success");
    setStatus(`Saved advanced settings for ${state.selectedServer?.name || "server"}.`, "status-success");
  } catch (error) {
    setSettingsStatus(error.message, "status-error");
  } finally {
    saveRawSettingsButton.disabled = false;
  }
}

async function createBackup() {
  if (!state.selectedServerId) {
    return;
  }
  createBackupButton.disabled = true;
  setStatus("Creating a backup snapshot...");
  try {
    const payload = await api(`/api/servers/${state.selectedServerId}/backups`, {
      method: "POST",
      body: JSON.stringify({
        note: backupNoteInput.value
      })
    });
    backupNoteInput.value = "";
    if (state.selectedServer) {
      state.selectedServer.backups = payload.backups;
    }
    await refreshSelectedServer({ silent: true });
    setStatus(`Backup ${payload.backupId} created.`, "status-success");
  } catch (error) {
    setStatus(error.message, "status-error");
  } finally {
    createBackupButton.disabled = false;
  }
}

async function restoreBackup(backupId) {
  if (!state.selectedServerId) {
    return;
  }
  setStatus(`Restoring backup ${backupId}...`);
  try {
    state.selectedServer = await api(`/api/servers/${state.selectedServerId}/restore-backup`, {
      method: "POST",
      body: JSON.stringify({ backupId })
    });
    renderSelectedServer();
    await refreshServers();
    setStatus(`Restored backup ${backupId}.`, "status-success");
  } catch (error) {
    setStatus(error.message, "status-error");
  }
}

async function saveBackupSchedule() {
  if (!state.selectedServerId) {
    return;
  }
  try {
    const payload = await api(`/api/servers/${state.selectedServerId}/backup-schedule`, {
      method: "POST",
      body: JSON.stringify({
        enabled: backupScheduleEnabled.checked,
        cadence: backupCadence.value,
        retention: Number(backupRetention.value || 7)
      })
    });
    if (state.selectedServer) {
      state.selectedServer.backupSchedule = payload;
      renderBackups(state.selectedServer, state.selectedServer.runtime?.runtimeState === "running");
    }
    setStatus("Backup schedule saved.", "status-success");
  } catch (error) {
    setStatus(error.message, "status-error");
  }
}

async function saveRuntimeProfile() {
  if (!state.selectedServerId) {
    return;
  }
  try {
    state.selectedServer = await api(`/api/servers/${state.selectedServerId}/runtime`, {
      method: "POST",
      body: JSON.stringify({
        memoryMb: Number(runtimeMemoryMb.value || 4096),
        javaOverrideMajor: runtimeJavaOverride.value || null,
        extraJvmArgs: runtimeExtraJvmArgs.value
      })
    });
    renderSelectedServer();
    await refreshServers();
    setStatus("Runtime profile updated.", "status-success");
  } catch (error) {
    setStatus(error.message, "status-error");
  }
}

async function saveCurrentServerAsTemplate() {
  if (!state.selectedServerId) {
    setStatus("Select a server before saving a template.", "status-error");
    return;
  }
  try {
    await api(`/api/servers/${state.selectedServerId}/templates`, {
      method: "POST",
      body: JSON.stringify({
        name: templateNameInput.value || `${state.selectedServer?.name || "Server"} Template`
      })
    });
    templateNameInput.value = "";
    await refreshTemplates();
    setStatus("Template saved.", "status-success");
  } catch (error) {
    setStatus(error.message, "status-error");
  }
}

async function deleteTemplate(templateId) {
  try {
    await api(`/api/templates?id=${encodeURIComponent(templateId)}`, {
      method: "DELETE"
    });
    await refreshTemplates();
    setStatus("Template deleted.", "status-success");
  } catch (error) {
    setStatus(error.message, "status-error");
  }
}

async function cloneServer(serverId, serverName = "server") {
  const name = window.prompt("Clone name", `${serverName} Copy`);
  if (!name) {
    return;
  }
  const port = window.prompt("Clone port", "25566");
  try {
    const payload = await api(`/api/servers/${serverId}/clone`, {
      method: "POST",
      body: JSON.stringify({
        name,
        port: Number(port || 25566)
      })
    });
    await refreshServers();
    await refreshTemplates();
    await selectServer(payload.id);
    setStatus(`${payload.name} cloned from ${serverName}.`, "status-success");
  } catch (error) {
    setStatus(error.message, "status-error");
  }
}

async function createFolder() {
  if (!state.selectedServerId || !newFolderInput.value.trim()) {
    return;
  }
  try {
    await api(`/api/servers/${state.selectedServerId}/files`, {
      method: "POST",
      body: JSON.stringify({
        action: "mkdir",
        path: [state.fileBrowserPath, newFolderInput.value.trim()].filter(Boolean).join("/")
      })
    });
    newFolderInput.value = "";
    await loadFileBrowser(state.fileBrowserPath);
    setStatus("Folder created.", "status-success");
  } catch (error) {
    setStatus(error.message, "status-error");
  }
}

async function saveOpenFile() {
  if (!state.selectedServerId || !state.openFilePath) {
    return;
  }
  try {
    await api(`/api/servers/${state.selectedServerId}/files`, {
      method: "POST",
      body: JSON.stringify({
        action: "save",
        path: state.openFilePath,
        content: fileEditor.value
      })
    });
    setStatus(`Saved ${state.openFilePath}.`, "status-success");
    await loadFileBrowser(state.fileBrowserPath);
  } catch (error) {
    setStatus(error.message, "status-error");
  }
}

async function uploadFile(file) {
  if (!state.selectedServerId || !file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const base64 = String(reader.result).split(",").pop();
      await api(`/api/servers/${state.selectedServerId}/files`, {
        method: "POST",
        body: JSON.stringify({
          action: "upload",
          directory: state.fileBrowserPath,
          filename: file.name,
          contentBase64: base64
        })
      });
      await loadFileBrowser(state.fileBrowserPath);
      setStatus(`Uploaded ${file.name}.`, "status-success");
    } catch (error) {
      setStatus(error.message, "status-error");
    }
  };
  reader.readAsDataURL(file);
}

async function renameFilePath(relativePath) {
  const nextName = window.prompt("Rename to", relativePath.split("/").pop() || "");
  if (!nextName) {
    return;
  }
  try {
    await api(`/api/servers/${state.selectedServerId}/files`, {
      method: "POST",
      body: JSON.stringify({
        action: "rename",
        path: relativePath,
        nextName
      })
    });
    await loadFileBrowser(state.fileBrowserPath);
    setStatus("Path renamed.", "status-success");
  } catch (error) {
    setStatus(error.message, "status-error");
  }
}

async function deleteFilePath(relativePath) {
  if (!window.confirm(`Delete ${relativePath}?`)) {
    return;
  }
  try {
    await api(`/api/servers/${state.selectedServerId}/files`, {
      method: "POST",
      body: JSON.stringify({
        action: "delete",
        path: relativePath
      })
    });
    if (state.openFilePath === relativePath) {
      state.openFilePath = "";
      fileEditor.value = "";
      fileEditorLabel.textContent = "Select a text file to edit it here.";
    }
    await loadFileBrowser(state.fileBrowserPath);
    setStatus("Path deleted.", "status-success");
  } catch (error) {
    setStatus(error.message, "status-error");
  }
}

minecraftVersion.addEventListener("change", async () => {
  updateJavaPolicy();
  renderCreateInsights();
  if (!state.activeLoader) {
    return;
  }
  setStatus("Refreshing compatible builds...");
  submitButton.disabled = true;
  try {
    await loadVariants();
    setStatus("Compatible versions refreshed.");
  } catch (error) {
    setStatus(error.message, "status-error");
  }
});

variantSelect.addEventListener("change", () => {
  submitButton.disabled = !variantSelect.value;
});

createForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!state.activeLoader) {
    setStatus("Choose a loader first.", "status-error");
    return;
  }

  const formData = new FormData(createForm);
  const payload = {
    name: formData.get("name"),
    loader: state.activeLoader,
    minecraftVersion: formData.get("minecraftVersion"),
    memoryMb: Number(formData.get("memoryMb")),
    motd: formData.get("motd"),
    onlineMode: formData.get("onlineMode") === "on",
    acceptEula: formData.get("acceptEula") === "on",
    port: Number(formData.get("port")),
    javaOverrideMajor: formData.get("javaOverrideMajor") || null,
    extraJvmArgs: formData.get("extraJvmArgs") || ""
  };

  if (state.variantKey && variantSelect.value) {
    payload[state.variantKey] = variantSelect.value;
  }
  if (state.loaderDefaults.installerVersion) {
    payload.installerVersion = state.loaderDefaults.installerVersion;
  }
  if (state.variantDefaults.installerVersion) {
    payload.installerVersion = state.variantDefaults.installerVersion;
  }

  submitButton.disabled = true;
  setStatus("Creating the server folder and downloading the selected artifact...");
  try {
    const created = await api("/api/servers", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    const selectedTemplate = state.templates.find((template) => template.id === templateSelect.value);
    if (selectedTemplate?.profile?.properties) {
      await api(`/api/servers/${created.id}/settings`, {
        method: "POST",
        body: JSON.stringify({
          properties: selectedTemplate.profile.properties
        })
      });
    }
    await refreshServers();
    await selectServer(created.id);
    setStatus(`${created.name} created with automatic Java selection.`, "status-success");
  } catch (error) {
    setStatus(error.message, "status-error");
  } finally {
    submitButton.disabled = false;
  }
});

for (const [key, button] of Object.entries(menuButtons)) {
  button.addEventListener("click", async () => {
    setActiveMenu(key);
    if (key === "files" && state.selectedServerId) {
      await loadFileBrowser(state.fileBrowserPath || "");
    }
    if (key === "mods" && state.selectedServerId) {
      await refreshModUpdates({ silent: true });
    }
  });
}

themeSelect.addEventListener("change", () => applyTheme(themeSelect.value));
templateSelect.addEventListener("change", () => {
  if (templateSelect.value) {
    applyTemplate(templateSelect.value);
  }
});
startServerButton.addEventListener("click", startSelectedServer);
stopServerButton.addEventListener("click", stopSelectedServer);
deleteServerButton.addEventListener("click", () => {
  if (state.selectedServer) {
    deleteServer(state.selectedServer.id, state.selectedServer.name);
  }
});
overviewStartButton.addEventListener("click", startSelectedServer);
overviewStopButton.addEventListener("click", stopSelectedServer);
overviewConsoleButton.addEventListener("click", () => setActiveMenu("manage"));
overviewPlayersButton.addEventListener("click", () => setActiveMenu("players"));
overviewSettingsButton.addEventListener("click", () => setActiveMenu("settings"));
refreshServerButton.addEventListener("click", () => refreshSelectedServer());
sendCommandButton.addEventListener("click", () => sendConsoleCommand());
modSearchButton.addEventListener("click", searchMods);
settingsForm.addEventListener("submit", saveSettings);
createBackupButton.addEventListener("click", createBackup);
saveRawSettingsButton.addEventListener("click", saveRawSettings);
saveRuntimeButton.addEventListener("click", saveRuntimeProfile);
saveBackupScheduleButton.addEventListener("click", saveBackupSchedule);
saveTemplateButton.addEventListener("click", saveCurrentServerAsTemplate);
filesUpButton.addEventListener("click", () => loadFileBrowser(state.fileBrowserPath.split("/").slice(0, -1).join("/")));
createFolderButton.addEventListener("click", createFolder);
saveFileButton.addEventListener("click", saveOpenFile);
uploadFileInput.addEventListener("change", () => uploadFile(uploadFileInput.files?.[0]));

inventorySearch.addEventListener("input", () => {
  state.inventorySearch = inventorySearch.value;
  renderServers();
});

serverList.addEventListener("click", (event) => {
  const cloneButton = event.target.closest(".clone-server-button");
  if (cloneButton) {
    event.stopPropagation();
    cloneServer(cloneButton.dataset.serverId, cloneButton.dataset.serverName);
    return;
  }
  const deleteButton = event.target.closest(".delete-server-button");
  if (deleteButton) {
    event.stopPropagation();
    deleteServer(deleteButton.dataset.serverId, deleteButton.dataset.serverName);
    return;
  }

  const row = event.target.closest(".server-row");
  if (row) {
    selectServer(row.dataset.serverId);
  }
});

templateList.addEventListener("click", (event) => {
  const button = event.target.closest(".template-delete-button");
  if (button) {
    deleteTemplate(button.dataset.templateId);
  }
});

playersSearch.addEventListener("input", () => {
  state.playersSearch = playersSearch.value;
  if (state.selectedServer) {
    renderPlayers(
      state.selectedServer,
      state.loaders.find((loader) => loader.id === state.selectedServer.loader)?.name || state.selectedServer.loader,
      state.selectedServer.runtime?.runtimeState === "running"
    );
  }
});

commandInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    sendConsoleCommand();
    return;
  }

  if (event.key === "ArrowUp" && state.commandHistory.length) {
    event.preventDefault();
    state.commandHistoryIndex = Math.min(state.commandHistoryIndex + 1, state.commandHistory.length - 1);
    commandInput.value = state.commandHistory[state.commandHistoryIndex] || "";
  }

  if (event.key === "ArrowDown" && state.commandHistory.length) {
    event.preventDefault();
    state.commandHistoryIndex -= 1;
    commandInput.value = state.commandHistoryIndex >= 0 ? state.commandHistory[state.commandHistoryIndex] : "";
  }
});

consoleSearchInput.addEventListener("input", () => {
  // Search only trims the visible console view and never mutates the server-side log history.
  state.consoleSearch = consoleSearchInput.value;
  state.consoleDisplayOverride = null;
  renderConsoleOutputFromServer(state.selectedServer);
});

modSearchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    searchMods();
  }
});

copyConsoleButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(consoleOutput.textContent || "");
    setStatus("Copied the visible console output.", "status-success");
  } catch (error) {
    setStatus("Clipboard access was blocked in this browser.", "status-error");
  }
});

downloadConsoleButton.addEventListener("click", () => {
  const lines = consoleOutput.textContent || "";
  const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const name = state.selectedServer?.name || "server";
  link.href = url;
  link.download = `${name.replace(/[^a-z0-9-_]+/gi, "-").toLowerCase() || "server"}-console.log`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setStatus("Downloaded the visible console output.", "status-success");
});

clearConsoleViewButton.addEventListener("click", () => {
  // Clear only the current client-side view so polling can repopulate it with fresh lines.
  state.consoleDisplayOverride = [];
  renderConsoleOutputFromServer(state.selectedServer);
  setStatus("Cleared the current console view.", "status-success");
});

for (const button of document.querySelectorAll(".console-filter-button")) {
  button.addEventListener("click", () => {
    state.consoleFilter = button.dataset.filter;
    for (const peer of document.querySelectorAll(".console-filter-button")) {
      peer.classList.toggle("active", peer === button);
    }
    renderConsoleOutputFromServer(state.selectedServer);
  });
}

for (const button of document.querySelectorAll(".inventory-filter-button")) {
  button.addEventListener("click", () => {
    state.inventoryFilter = button.dataset.filter;
    for (const peer of document.querySelectorAll(".inventory-filter-button")) {
      peer.classList.toggle("active", peer === button);
    }
    renderServers();
  });
}

for (const button of document.querySelectorAll(".quick-command-button")) {
  button.addEventListener("click", () => sendConsoleCommand(button.dataset.command));
}

for (const button of document.querySelectorAll(".mod-suggestion-button")) {
  button.addEventListener("click", () => {
    modSearchInput.value = button.dataset.query;
    searchMods();
  });
}
modsSelectAllButton.addEventListener("click", () => {
  state.selectedModProjectIds = state.modSearchResults.map((mod) => mod.projectId);
  renderModResults();
});
modsClearSelectionButton.addEventListener("click", () => {
  state.selectedModProjectIds = [];
  renderModResults();
});
modsDownloadSelectedButton.addEventListener("click", downloadSelectedMods);

playersList.addEventListener("click", (event) => {
  const button = event.target.closest(".player-action-button");
  if (!button) {
    return;
  }
  runPlayerAction(button.dataset.action, button.dataset.playerName, button.dataset.enabled === "true");
});

backupsList.addEventListener("click", (event) => {
  const button = event.target.closest(".select-backup-button");
  const row = event.target.closest(".backup-row");
  const backupId = button?.dataset.backupId || row?.dataset.backupId || "";
  if (!backupId) {
    return;
  }
  // Backup selection is a preview step so restore stays deliberate and reversible.
  state.selectedBackupId = backupId;
  if (state.selectedServer) {
    renderBackups(state.selectedServer, state.selectedServer.runtime?.runtimeState === "running");
  }
});

confirmRestoreButton.addEventListener("click", () => {
  const backupId = confirmRestoreButton.dataset.backupId;
  if (!backupId) {
    return;
  }
  if (!window.confirm(`Restore ${backupId}? This replaces the current server files with that backup snapshot.`)) {
    return;
  }
  restoreBackup(backupId);
});

fileList.addEventListener("click", (event) => {
  const openButton = event.target.closest(".file-open-button");
  if (openButton) {
    if (openButton.dataset.type === "directory") {
      loadFileBrowser(openButton.dataset.path);
    } else {
      openServerFile(openButton.dataset.path);
    }
    return;
  }
  const renameButton = event.target.closest(".file-rename-button");
  if (renameButton) {
    renameFilePath(renameButton.dataset.path);
    return;
  }
  const deleteButton = event.target.closest(".file-delete-button");
  if (deleteButton) {
    deleteFilePath(deleteButton.dataset.path);
  }
});

overviewConnection.addEventListener("click", async (event) => {
  const button = event.target.closest(".copy-address-button");
  if (!button) {
    return;
  }
  try {
    await navigator.clipboard.writeText(button.dataset.address || "");
    setStatus("Copied the server IP.", "status-success");
  } catch {
    setStatus("Clipboard access was blocked in this browser.", "status-error");
  }
});

installedModsList.addEventListener("click", (event) => {
  const button = event.target.closest(".mod-remove-button");
  if (button) {
    removeInstalledMod(button.dataset.filename);
  }
});

window.addEventListener("beforeunload", stopDetailPolling);

async function init() {
  try {
    const [loadersPayload, javaPayload] = await Promise.all([
      api("/api/loaders"),
      api("/api/java-runtimes")
    ]);
    applyTheme(state.theme);
    state.loaders = loadersPayload.loaders || [];
    state.javaRuntimes = javaPayload.runtimes || [];
    renderLoaderCards();
    renderJavaRuntimes();
    renderCreateInsights();
    renderSelectedServer();
    renderModResults();
    renderModSelectionSummary();
    setActiveMenu("inventory");
    await refreshTemplates();
    await refreshServers();
  } catch (error) {
    setStatus(error.message, "status-error");
  }
}

init();
