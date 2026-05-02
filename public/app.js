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
  selectedServerId: "",
  selectedServer: null,
  detailTimer: null,
  activeMenu: "create",
  modSearchResults: [],
  selectedModProjectIds: [],
  consoleFilter: "all",
  inventoryFilter: "all",
  inventorySearch: "",
  playersSearch: "",
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
const statusText = document.getElementById("statusText");
const submitButton = document.getElementById("submitButton");
const javaRuntimeList = document.getElementById("javaRuntimeList");
const javaPolicy = document.getElementById("javaPolicy");
const createInsightList = document.getElementById("createInsightList");
const serverList = document.getElementById("serverList");
const activeServerDisplay = document.getElementById("activeServerDisplay");
const activeServerMeta = document.getElementById("activeServerMeta");
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
  manage: document.getElementById("menuManage"),
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
  manage: document.getElementById("panelManage"),
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
const overviewStats = document.getElementById("overviewStats");
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
const startServerButton = document.getElementById("startServerButton");
const stopServerButton = document.getElementById("stopServerButton");
const refreshServerButton = document.getElementById("refreshServerButton");
const commandInput = document.getElementById("commandInput");
const sendCommandButton = document.getElementById("sendCommandButton");
const consoleOutput = document.getElementById("consoleOutput");
const consoleAutoscroll = document.getElementById("consoleAutoscroll");

const playersTitle = document.getElementById("playersTitle");
const playersRuntime = document.getElementById("playersRuntime");
const playersEmpty = document.getElementById("playersEmpty");
const playersPanel = document.getElementById("playersPanel");
const playersHint = document.getElementById("playersHint");
const playersList = document.getElementById("playersList");
const playersSearch = document.getElementById("playersSearch");
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

const backupsTitle = document.getElementById("backupsTitle");
const backupsRuntime = document.getElementById("backupsRuntime");
const backupsEmpty = document.getElementById("backupsEmpty");
const backupsPanel = document.getElementById("backupsPanel");
const backupNoteInput = document.getElementById("backupNoteInput");
const createBackupButton = document.getElementById("createBackupButton");
const backupsList = document.getElementById("backupsList");

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
    return `
      <article class="server-row ${activeClass}" data-server-id="${server.id}">
        <div class="server-row-top">
          <strong>${server.name}</strong>
          <span class="server-state">${server.runtimeState || server.status}</span>
        </div>
        <div class="server-row-bottom">
          <span class="server-meta">${loaderName} · ${server.minecraftVersion}</span>
          <span class="server-meta">${javaLabel}</span>
        </div>
        <div class="server-path">${server.path}</div>
      </article>
    `;
  }).join("");

  for (const row of serverList.querySelectorAll(".server-row")) {
    row.addEventListener("click", () => selectServer(row.dataset.serverId));
  }
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
  const filtered = state.consoleFilter === "all"
    ? logs
    : logs.filter((entry) => classifyLog(entry) === state.consoleFilter);
  const shouldStick = consoleAutoscroll.checked && (consoleOutput.scrollHeight - consoleOutput.scrollTop - consoleOutput.clientHeight < 60);
  consoleOutput.textContent = filtered.length
    ? filtered.map((entry) => {
        const stamp = entry.at ? new Date(entry.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--:--:--";
        return `[${stamp}] ${entry.source}> ${entry.line}`;
      }).join("\n")
    : "No console output for this filter yet.";

  if (shouldStick || consoleAutoscroll.checked) {
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
  }
}

function renderOverview(server, loaderName, isRunning) {
  overviewTitle.textContent = `Overview · ${server.name}`;
  overviewRuntime.textContent = isRunning ? "Running" : server.status;
  overviewEmpty.hidden = true;
  overviewPanel.hidden = false;

  overviewSummary.textContent = server.readiness?.installNeeded
    ? "This loader still needs its installer/runtime prep before it is truly ready."
    : "Resin has enough context here to tell you whether the server is runnable and what needs attention.";

  const overview = server.overview || {};
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

  const address = `127.0.0.1:${overview.port || server.port || 25565}`;
  overviewConnection.innerHTML = [
    ["Address", address],
    ["Loader", loaderName],
    ["Java", server.javaRuntime ? `Java ${server.javaRuntime.major}` : "Auto"],
    ["Last backup", overview.lastBackupAt ? formatSince(overview.lastBackupAt) : "None yet"]
  ].map(([label, value]) => `
    <div class="list-row compact-row">
      <strong>${label}</strong>
      <span class="server-meta">${value}</span>
    </div>
  `).join("");

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
        <button type="button" class="secondary-button player-action-button" data-action="${player.op ? "deop" : "op"}" data-player-name="${player.name}">${player.op ? "Remove OP" : "Give OP"}</button>
        <button type="button" class="secondary-button player-action-button" data-action="whitelist" data-enabled="${player.whitelisted ? "false" : "true"}" data-player-name="${player.name}">${player.whitelisted ? "Remove Whitelist" : "Whitelist"}</button>
        <button type="button" class="secondary-button player-action-button" data-action="ban" data-enabled="${player.banned ? "false" : "true"}" data-player-name="${player.name}">${player.banned ? "Unban" : "Ban"}</button>
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
  setSettingsStatus("Settings loaded from server.properties.");
}

function renderBackups(server, isRunning) {
  backupsTitle.textContent = `Backups · ${server.name}`;
  backupsRuntime.textContent = isRunning ? "Live copy" : "Ready";
  backupsEmpty.hidden = true;
  backupsPanel.hidden = false;
  backupsList.innerHTML = (server.backups || []).length
    ? server.backups.map((backup) => `
      <div class="list-row">
        <div>
          <strong>${backup.id}</strong>
          <div class="server-meta">${formatTime(backup.createdAt)}${backup.note ? ` · ${backup.note}` : ""}</div>
          <div class="server-meta">${backup.path}</div>
        </div>
        <div class="backup-actions">
          <span class="runtime-badge">${backup.sourceState}</span>
          <button type="button" class="secondary-button restore-backup-button" data-backup-id="${backup.id}" ${isRunning ? "disabled" : ""}>Restore</button>
        </div>
      </div>
    `).join("")
    : `<div class="empty-state">No backups yet.</div>`;
}

function renderActivity(server, isRunning) {
  activityTitle.textContent = `Activity · ${server.name}`;
  activityRuntime.textContent = isRunning ? "Tracking" : "History";
  activityEmpty.hidden = true;
  activityPanel.hidden = false;
  activityList.innerHTML = (server.activity || []).length
    ? server.activity.map((entry) => `
      <div class="list-row">
        <div>
          <strong>${entry.message}</strong>
          <div class="server-meta">${formatTime(entry.at)}</div>
        </div>
        <span class="runtime-badge">${entry.type}</span>
      </div>
    `).join("")
    : `<div class="empty-state">No activity yet.</div>`;
}

function renderInstalledMods(mods) {
  installedModsList.innerHTML = mods.length
    ? mods.map((mod) => `
      <div class="installed-item">
        <strong>${mod.filename}</strong>
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
  renderInstalledMods(server.mods || []);
  renderModSelectionSummary();
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

    managerEmpty.hidden = false;
    managerPanel.hidden = true;
    managerTitle.textContent = "Select a server";
    managerRuntime.textContent = "Idle";
    managerJavaBadge.textContent = "Java";

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
    state.selectedModProjectIds = [];
    renderModResults();
    return;
  }

  const loaderName = state.loaders.find((loader) => loader.id === server.loader)?.name || server.loader;
  const isRunning = server.runtime?.runtimeState === "running";

  activeServerDisplay.textContent = server.name;
  activeServerMeta.textContent = `${loaderName} · ${server.minecraftVersion}${server.javaRuntime ? ` · Java ${server.javaRuntime.major}` : ""}`;
  topbarRuntimeChip.textContent = isRunning ? "Running now" : "Stopped";
  topbarAddressChip.textContent = `127.0.0.1:${server.overview?.port || server.port || 25565}`;
  topbarHealthChip.textContent = server.readiness?.blocked ? "Blocked setup" : server.readiness?.installNeeded ? "Installer needed" : "Ready state";

  renderOverview(server, loaderName, isRunning);

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
    state.selectedServer = await api(`/api/servers/${state.selectedServerId}`);
    renderSelectedServer();
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
    modsSearchHint.textContent = `Showing Modrinth results for ${payload.server.loader} on Minecraft ${payload.server.minecraftVersion}.`;
    renderModResults();
  } catch (error) {
    setStatus(error.message, "status-error");
  }
}

async function installMod(projectId) {
  if (!state.selectedServerId) {
    return;
  }
  try {
    const payload = await api(`/api/servers/${state.selectedServerId}/mods`, {
      method: "POST",
      body: JSON.stringify({ projectId })
    });
    if (state.selectedServer) {
      state.selectedServer.mods = payload.mods;
      renderInstalledMods(payload.mods);
    }
    setStatus(`Installed ${payload.installed.filename}.`, "status-success");
    await refreshSelectedServer({ silent: true });
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
  setStatus(`Downloading ${state.selectedModProjectIds.length} selected mod${state.selectedModProjectIds.length === 1 ? "" : "s"}...`);
  let installedCount = 0;
  try {
    for (const projectId of state.selectedModProjectIds) {
      const payload = await api(`/api/servers/${state.selectedServerId}/mods`, {
        method: "POST",
        body: JSON.stringify({ projectId })
      });
      installedCount += 1;
      if (state.selectedServer) {
        state.selectedServer.mods = payload.mods;
      }
    }
    state.selectedModProjectIds = [];
    renderInstalledMods(state.selectedServer?.mods || []);
    renderModResults();
    await refreshSelectedServer({ silent: true });
    setStatus(`Downloaded ${installedCount} mod${installedCount === 1 ? "" : "s"}.`, "status-success");
  } catch (error) {
    setStatus(error.message, "status-error");
  } finally {
    modsDownloadSelectedButton.disabled = false;
    renderModSelectionSummary();
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
    ban: "ban"
  }[action];
  if (!endpoint) {
    return;
  }
  try {
    const payload = await api(`/api/servers/${state.selectedServerId}/${endpoint}`, {
      method: "POST",
      body: JSON.stringify({
        playerName,
        enabled
      })
    });
    if (state.selectedServer && payload.players) {
      state.selectedServer.players = payload.players;
      renderPlayers(state.selectedServer, state.loaders.find((loader) => loader.id === state.selectedServer.loader)?.name || state.selectedServer.loader, state.selectedServer.runtime?.runtimeState === "running");
    }
    await refreshSelectedServer({ silent: true });
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
    port: Number(formData.get("port"))
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
  button.addEventListener("click", () => setActiveMenu(key));
}

startServerButton.addEventListener("click", startSelectedServer);
stopServerButton.addEventListener("click", stopSelectedServer);
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

inventorySearch.addEventListener("input", () => {
  state.inventorySearch = inventorySearch.value;
  renderServers();
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

modSearchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    searchMods();
  }
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
  const button = event.target.closest(".restore-backup-button");
  if (!button) {
    return;
  }
  restoreBackup(button.dataset.backupId);
});

window.addEventListener("beforeunload", stopDetailPolling);

async function init() {
  try {
    const [loadersPayload, javaPayload] = await Promise.all([
      api("/api/loaders"),
      api("/api/java-runtimes")
    ]);
    state.loaders = loadersPayload.loaders || [];
    state.javaRuntimes = javaPayload.runtimes || [];
    renderLoaderCards();
    renderJavaRuntimes();
    renderCreateInsights();
    renderSelectedServer();
    renderModResults();
    renderModSelectionSummary();
    setActiveMenu("create");
    await refreshServers();
  } catch (error) {
    setStatus(error.message, "status-error");
  }
}

init();
