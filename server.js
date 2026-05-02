const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const { createReadStream } = require("node:fs");
const { spawn, spawnSync } = require("node:child_process");
const { pipeline } = require("node:stream/promises");

const PORT = Number(process.env.PORT || 3000);
const ROOT_DIR = __dirname;
const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const SERVERS_DIR = path.join(ROOT_DIR, "servers");
const BACKUPS_DIR = path.join(ROOT_DIR, "backups");
const SERVER_PROCESSES = new Map();
const MAX_LOG_LINES = 500;
const MODRINTH_API = "https://api.modrinth.com/v2";
const PLAYER_NAME_PATTERN = /[A-Za-z0-9_]{3,16}/;
const MANAGED_SERVER_PROPERTY_KEYS = [
  "motd",
  "server-port",
  "online-mode",
  "difficulty",
  "gamemode",
  "max-players",
  "view-distance",
  "simulation-distance",
  "spawn-protection",
  "allow-flight",
  "pvp",
  "white-list",
  "level-name"
];

const LOADER_DEFS = {
  vanilla: {
    id: "vanilla",
    name: "Vanilla",
    badge: "Official",
    tone: "Clean upstream server from Mojang.",
    support: "Direct download",
    secondaryField: null
  },
  fabric: {
    id: "fabric",
    name: "Fabric",
    badge: "Lightweight",
    tone: "Fast modded servers with slim overhead.",
    support: "Direct download",
    secondaryField: {
      key: "loaderVersion",
      label: "Fabric Loader"
    }
  },
  quilt: {
    id: "quilt",
    name: "Quilt",
    badge: "Modded",
    tone: "Loader-first setup with generated installer prep.",
    support: "Installer workflow",
    secondaryField: {
      key: "loaderVersion",
      label: "Quilt Loader"
    }
  },
  forge: {
    id: "forge",
    name: "Forge",
    badge: "Legacy mods",
    tone: "Broad mod compatibility with installer-based setup.",
    support: "Installer workflow",
    secondaryField: {
      key: "loaderVersion",
      label: "Forge Build"
    }
  },
  neoforge: {
    id: "neoforge",
    name: "NeoForge",
    badge: "Next-gen",
    tone: "Modern Forge-line ecosystem with installer prep.",
    support: "Installer workflow",
    secondaryField: {
      key: "loaderVersion",
      label: "NeoForge Build"
    }
  }
};

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

function json(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

function splitLines(buffer) {
  return buffer.split(/\r?\n/).filter(Boolean);
}

function trimLogLines(lines) {
  if (lines.length > MAX_LOG_LINES) {
    lines.splice(0, lines.length - MAX_LOG_LINES);
  }
}

function activityFilePath(serverId) {
  return path.join(SERVERS_DIR, serverId, ".resin-activity.json");
}

function boolFromProperty(value, fallback = false) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  return String(value).trim().toLowerCase() === "true";
}

function normalizePropertyValue(key, value) {
  const text = String(value ?? "").trim();
  if (["server-port", "max-players", "view-distance", "simulation-distance", "spawn-protection"].includes(key)) {
    return String(Math.max(0, Number(text || 0)));
  }
  if (["online-mode", "allow-flight", "pvp", "white-list"].includes(key)) {
    return text === "true" ? "true" : "false";
  }
  return text;
}

function classifyLogLine(entry) {
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

function createEmptyPlayerState() {
  return {
    known: new Map(),
    online: new Set()
  };
}

function ensureRuntimePlayerState(runtime) {
  if (!runtime.players) {
    runtime.players = createEmptyPlayerState();
  }
  return runtime.players;
}

function mergePlayerRecord(target, player) {
  const current = target.get(player.name) || {};
  target.set(player.name, {
    name: player.name,
    uuid: player.uuid || current.uuid || null,
    lastSeenAt: player.lastSeenAt || current.lastSeenAt || null,
    op: player.op ?? current.op ?? false,
    whitelisted: player.whitelisted ?? current.whitelisted ?? false,
    banned: player.banned ?? current.banned ?? false,
    online: player.online ?? current.online ?? false
  });
}

function updateRuntimePlayersFromLog(runtime, line) {
  const players = ensureRuntimePlayerState(runtime);
  const joined = line.match(/\]:\s+([A-Za-z0-9_]{3,16}) joined the game\b/);
  if (joined) {
    const name = joined[1];
    players.online.add(name);
    mergePlayerRecord(players.known, {
      name,
      online: true,
      lastSeenAt: new Date().toISOString()
    });
    return;
  }

  const left = line.match(/\]:\s+([A-Za-z0-9_]{3,16}) left the game\b/);
  if (left) {
    const name = left[1];
    players.online.delete(name);
    mergePlayerRecord(players.known, {
      name,
      online: false,
      lastSeenAt: new Date().toISOString()
    });
    return;
  }

  const opGranted = line.match(/\]:\s+Made\s+([A-Za-z0-9_]{3,16})\s+a server operator\b/i);
  if (opGranted) {
    const name = opGranted[1];
    mergePlayerRecord(players.known, {
      name,
      op: true
    });
  }
}

function appendProcessLog(runtime, chunk, source) {
  runtime.buffer += chunk.toString("utf8");
  const parts = runtime.buffer.split(/\r?\n/);
  runtime.buffer = parts.pop() || "";
  for (const line of parts) {
    if (!line) {
      continue;
    }
    runtime.logs.push({
      at: new Date().toISOString(),
      source,
      line
    });
    updateRuntimePlayersFromLog(runtime, line);
  }
  trimLogLines(runtime.logs);
}

function getRuntimeSummary(serverId) {
  const runtime = SERVER_PROCESSES.get(serverId);
  if (!runtime) {
    return {
      runtimeState: "stopped",
      pid: null,
      startedAt: null,
      lastExitCode: null,
      canAcceptCommands: false,
      logs: []
    };
  }

  return {
    runtimeState: runtime.state,
    pid: runtime.child.pid ?? null,
    startedAt: runtime.startedAt,
    lastExitCode: runtime.lastExitCode,
    canAcceptCommands: runtime.state === "running",
    logs: runtime.logs.slice(-150)
  };
}

function parseVersionParts(version) {
  return String(version || "")
    .match(/\d+/g)
    ?.slice(0, 3)
    .map((value) => Number(value)) || [0, 0, 0];
}

function compareVersionParts(left, right) {
  const size = Math.max(left.length, right.length);
  for (let index = 0; index < size; index += 1) {
    const delta = (left[index] || 0) - (right[index] || 0);
    if (delta !== 0) {
      return delta;
    }
  }
  return 0;
}

function detectInstalledJavaRuntimes() {
  const runtimes = [];

  if (process.platform === "darwin") {
    const result = spawnSync("/usr/libexec/java_home", ["-V"], {
      encoding: "utf8"
    });
    const output = `${result.stdout || ""}\n${result.stderr || ""}`;
    for (const line of output.split("\n")) {
      const match = line.match(/^\s*([\d.]+)\s+\([^)]+\)\s+"([^"]+)"\s+-\s+"([^"]+)"\s+(.+)$/);
      if (!match) {
        continue;
      }
      const version = match[1];
      const home = match[4].trim();
      runtimes.push({
        version,
        major: parseVersionParts(version)[0] || 0,
        vendor: match[2],
        name: match[3],
        home,
        javaBin: path.join(home, "bin", "java")
      });
    }
  }

  if (!runtimes.length) {
    const result = spawnSync("java", ["-version"], {
      encoding: "utf8"
    });
    const combined = `${result.stdout || ""}\n${result.stderr || ""}`;
    const versionMatch = combined.match(/version "([^"]+)"/);
    if (versionMatch) {
      runtimes.push({
        version: versionMatch[1],
        major: parseVersionParts(versionMatch[1])[0] || 0,
        vendor: "Unknown",
        name: "System Java",
        home: "",
        javaBin: "java"
      });
    }
  }

  return runtimes.sort((left, right) => right.major - left.major || compareVersionParts(parseVersionParts(right.version), parseVersionParts(left.version)));
}

const INSTALLED_JAVA_RUNTIMES = detectInstalledJavaRuntimes();

function resolveJavaRuntimeForMinecraft(minecraftVersion) {
  const preferredMajor = compareVersionParts(parseVersionParts(minecraftVersion), [26, 1, 0]) >= 0 ? 25 : 21;
  const exact = INSTALLED_JAVA_RUNTIMES.find((runtime) => runtime.major === preferredMajor);
  if (exact) {
    return {
      ...exact,
      preferredMajor,
      reason: `Minecraft ${minecraftVersion} prefers Java ${preferredMajor}.`
    };
  }

  const higher = INSTALLED_JAVA_RUNTIMES.find((runtime) => runtime.major > preferredMajor);
  if (higher) {
    return {
      ...higher,
      preferredMajor,
      reason: `Minecraft ${minecraftVersion} prefers Java ${preferredMajor}, but Resin is falling back to the closest newer installed runtime.`
    };
  }

  const fallback = INSTALLED_JAVA_RUNTIMES[0];
  if (!fallback) {
    throw new Error("No Java runtime was detected on this machine.");
  }

  return {
    ...fallback,
    preferredMajor,
    reason: `Minecraft ${minecraftVersion} prefers Java ${preferredMajor}, but Resin only found Java ${fallback.major}.`
  };
}

function supportsMods(loader) {
  return ["fabric", "quilt", "forge", "neoforge"].includes(loader);
}

function modrinthLoader(loader) {
  return loader === "neoforge" ? "neoforge" : loader;
}

function sanitizeName(value) {
  return String(value || "")
    .replace(/[^\w\s.-]/g, "")
    .trim()
    .slice(0, 64);
}

function slugify(value) {
  return sanitizeName(value)
    .toLowerCase()
    .replace(/[\s_.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || `server-${Date.now()}`;
}

function uniqueBy(list, keyFn) {
  const seen = new Set();
  return list.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function parseXmlValues(xml, tag) {
  const pattern = new RegExp(`<${tag}>([^<]+)</${tag}>`, "g");
  const values = [];
  let match = pattern.exec(xml);
  while (match) {
    values.push(match[1]);
    match = pattern.exec(xml);
  }
  return values;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "ResinServerUI/0.1 (+https://local.resin)"
    }
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${url}: ${response.status}`);
  }

  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "ResinServerUI/0.1 (+https://local.resin)"
    }
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${url}: ${response.status}`);
  }

  return response.text();
}

async function streamToFile(url, targetPath) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "ResinServerUI/0.1 (+https://local.resin)"
    }
  });

  if (!response.ok || !response.body) {
    throw new Error(`Download failed for ${url}: ${response.status}`);
  }

  const fileHandle = await fs.open(targetPath, "w");
  try {
    await pipeline(response.body, fileHandle.createWriteStream());
  } finally {
    await fileHandle.close();
  }
}

async function getLoaderCatalog() {
  return Object.values(LOADER_DEFS);
}

async function getLoaderVersions(loader) {
  switch (loader) {
    case "vanilla": {
      const manifest = await fetchJson("https://piston-meta.mojang.com/mc/game/version_manifest_v2.json");
      const versions = manifest.versions.slice(0, 120).map((entry) => ({
        id: entry.id,
        type: entry.type,
        releaseTime: entry.releaseTime
      }));
      return { minecraftVersions: versions };
    }
    case "fabric": {
      const [games, loaders] = await Promise.all([
        fetchJson("https://meta.fabricmc.net/v2/versions/game"),
        fetchJson("https://meta.fabricmc.net/v2/versions/loader")
      ]);
      return {
        minecraftVersions: games.slice(0, 120).map((entry) => ({
          id: entry.version,
          type: entry.stable ? "release" : "snapshot"
        })),
        defaults: {
          loaderVersion: loaders.find((entry) => entry.stable)?.version || loaders[0]?.version || ""
        }
      };
    }
    case "quilt": {
      const [games, loaders, installers] = await Promise.all([
        fetchJson("https://meta.quiltmc.org/v3/versions/game"),
        fetchJson("https://meta.quiltmc.org/v3/versions/loader"),
        fetchJson("https://meta.quiltmc.org/v3/versions/installer")
      ]);
      return {
        minecraftVersions: games.slice(0, 120).map((entry) => ({
          id: entry.version,
          type: entry.version.includes("rc") || entry.version.includes("beta") || entry.version.includes("pre") ? "preview" : "release"
        })),
        defaults: {
          loaderVersion: loaders[0]?.version || "",
          installerVersion: installers[0]?.version || ""
        }
      };
    }
    case "forge": {
      const promos = await fetchJson("https://files.minecraftforge.net/net/minecraftforge/forge/promotions_slim.json");
      const entries = Object.entries(promos.promos);
      const versions = uniqueBy(
        entries.map(([key]) => key.replace(/-(latest|recommended)$/, "")),
        (item) => item
      ).map((id) => ({ id, type: "release" }));
      return { minecraftVersions: versions.reverse() };
    }
    case "neoforge": {
      const metadata = await fetchText("https://maven.neoforged.net/releases/net/neoforged/neoforge/maven-metadata.xml");
      const versions = parseXmlValues(metadata, "version");
      const gameVersions = uniqueBy(
        versions.map((entry) => entry.replace(/-[^-]+$/, "")),
        (entry) => entry
      ).map((id) => ({
        id,
        type: id.includes("snapshot") || id.includes("beta") ? "preview" : "release"
      }));
      return { minecraftVersions: gameVersions.reverse() };
    }
    default:
      throw new Error(`Unsupported loader: ${loader}`);
  }
}

async function getLoaderVariants(loader, minecraftVersion) {
  switch (loader) {
    case "fabric": {
      const [loaders, installers] = await Promise.all([
        fetchJson(`https://meta.fabricmc.net/v2/versions/loader/${minecraftVersion}`),
        fetchJson("https://meta.fabricmc.net/v2/versions/installer")
      ]);
      return {
        key: "loaderVersion",
        label: "Fabric Loader",
        options: loaders.slice(0, 40).map((entry) => ({
          value: entry.loader.version,
          label: entry.loader.version
        })),
        defaults: {
          loaderVersion: loaders[0]?.loader?.version || "",
          installerVersion: installers.find((entry) => entry.stable)?.version || installers[0]?.version || ""
        }
      };
    }
    case "quilt": {
      const [loaders, installers] = await Promise.all([
        fetchJson(`https://meta.quiltmc.org/v3/versions/loader/${minecraftVersion}`),
        fetchJson("https://meta.quiltmc.org/v3/versions/installer")
      ]);
      return {
        key: "loaderVersion",
        label: "Quilt Loader",
        options: loaders.slice(0, 40).map((entry) => ({
          value: entry.version,
          label: entry.version
        })),
        defaults: {
          loaderVersion: loaders[0]?.version || "",
          installerVersion: installers[0]?.version || ""
        }
      };
    }
    case "forge": {
      const metadata = await fetchText("https://maven.minecraftforge.net/net/minecraftforge/forge/maven-metadata.xml");
      const versions = parseXmlValues(metadata, "version")
        .filter((entry) => entry.startsWith(`${minecraftVersion}-`))
        .slice(-40)
        .reverse();
      return {
        key: "loaderVersion",
        label: "Forge Build",
        options: versions.map((entry) => ({
          value: entry,
          label: entry
        })),
        defaults: {
          loaderVersion: versions[0] || ""
        }
      };
    }
    case "neoforge": {
      const metadata = await fetchText("https://maven.neoforged.net/releases/net/neoforged/neoforge/maven-metadata.xml");
      const versions = parseXmlValues(metadata, "version")
        .filter((entry) => entry.startsWith(`${minecraftVersion}-`))
        .slice(-40)
        .reverse();
      return {
        key: "loaderVersion",
        label: "NeoForge Build",
        options: versions.map((entry) => ({
          value: entry,
          label: entry
        })),
        defaults: {
          loaderVersion: versions[0] || ""
        }
      };
    }
    default:
      return null;
  }
}

async function getVanillaServerDownload(versionId) {
  const manifest = await fetchJson("https://piston-meta.mojang.com/mc/game/version_manifest_v2.json");
  const version = manifest.versions.find((entry) => entry.id === versionId);
  if (!version) {
    throw new Error(`Minecraft version ${versionId} was not found.`);
  }

  const details = await fetchJson(version.url);
  const serverDownload = details.downloads?.server?.url;
  if (!serverDownload) {
    throw new Error(`Minecraft ${versionId} does not expose a server download.`);
  }

  return serverDownload;
}

async function searchModsForServer(serverId, query) {
  const server = await readServerRecord(serverId);
  if (!supportsMods(server.loader)) {
    return {
      server,
      hits: []
    };
  }

  const facets = [
    ["project_type:mod"],
    ["server_side:required", "server_side:optional"],
    [`categories:${modrinthLoader(server.loader)}`],
    [`versions:${server.minecraftVersion}`]
  ];

  const url = new URL(`${MODRINTH_API}/search`);
  url.searchParams.set("query", String(query || "").trim());
  url.searchParams.set("limit", "20");
  url.searchParams.set("index", "downloads");
  url.searchParams.set("facets", JSON.stringify(facets));
  const payload = await fetchJson(url.toString());

  return {
    server,
    hits: (payload.hits || []).map((hit) => ({
      projectId: hit.project_id,
      slug: hit.slug,
      title: hit.title,
      description: hit.description,
      author: hit.author,
      downloads: hit.downloads,
      iconUrl: hit.icon_url,
      latestVersion: hit.latest_version,
      categories: hit.display_categories || hit.categories || []
    }))
  };
}

async function listInstalledMods(serverId) {
  const server = await readServerRecord(serverId);
  const modsDir = path.join(server.path, "mods");
  try {
    const entries = await fs.readdir(modsDir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".jar"))
      .map((entry) => ({
        filename: entry.name
      }))
      .sort((left, right) => left.filename.localeCompare(right.filename));
  } catch {
    return [];
  }
}

async function readJsonFile(filePath, fallback) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    return JSON.parse(content);
  } catch {
    return fallback;
  }
}

async function writeJsonFile(filePath, payload) {
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2), "utf8");
}

async function readActivity(serverId) {
  return readJsonFile(activityFilePath(serverId), []);
}

async function appendActivity(serverId, type, message, detail = {}) {
  const activity = await readActivity(serverId);
  activity.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    at: new Date().toISOString(),
    type,
    message,
    detail
  });
  if (activity.length > 250) {
    activity.splice(0, activity.length - 250);
  }
  await writeJsonFile(activityFilePath(serverId), activity);
}

async function readServerProperties(server) {
  const filePath = path.join(server.path, "server.properties");
  let content = "";
  try {
    content = await fs.readFile(filePath, "utf8");
  } catch {
    return {};
  }

  const properties = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }
    const separator = line.indexOf("=");
    if (separator === -1) {
      continue;
    }
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1);
    properties[key] = value;
  }
  return properties;
}

async function updateServerProperties(serverId, updates) {
  const server = await readServerRecord(serverId);
  const properties = await readServerProperties(server);
  for (const key of MANAGED_SERVER_PROPERTY_KEYS) {
    if (Object.prototype.hasOwnProperty.call(updates, key)) {
      properties[key] = normalizePropertyValue(key, updates[key]);
    }
  }

  const nextContent = Object.entries(properties)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  await fs.writeFile(path.join(server.path, "server.properties"), `${nextContent}\n`, "utf8");

  const recordPath = path.join(server.path, "resin-server.json");
  const record = await readServerRecord(serverId);
  record.motd = properties.motd || record.motd;
  record.port = Number(properties["server-port"] || record.port || 25565);
  record.onlineMode = boolFromProperty(properties["online-mode"], Boolean(record.onlineMode));
  await fs.writeFile(recordPath, JSON.stringify(record, null, 2), "utf8");

  await appendActivity(serverId, "settings", "Server settings updated.", {
    keys: Object.keys(updates)
  });

  return readServerProperties(await readServerRecord(serverId));
}

async function readKnownPlayers(server) {
  const [usercache, ops, whitelist, banned] = await Promise.all([
    readJsonFile(path.join(server.path, "usercache.json"), []),
    readJsonFile(path.join(server.path, "ops.json"), []),
    readJsonFile(path.join(server.path, "whitelist.json"), []),
    readJsonFile(path.join(server.path, "banned-players.json"), [])
  ]);

  const opNames = new Set(
    ops
      .map((entry) => String(entry?.name || "").trim())
      .filter(Boolean)
  );
  const whitelistNames = new Set(
    whitelist
      .map((entry) => String(entry?.name || "").trim())
      .filter(Boolean)
  );
  const bannedNames = new Set(
    banned
      .map((entry) => String(entry?.name || "").trim())
      .filter(Boolean)
  );

  const players = new Map();
  for (const entry of usercache) {
    const name = String(entry?.name || "").trim();
    if (!PLAYER_NAME_PATTERN.test(name)) {
      continue;
    }
    players.set(name, {
      name,
      uuid: entry.uuid || null,
      lastSeenAt: entry.expiresOn || null,
      op: opNames.has(name),
      whitelisted: whitelistNames.has(name),
      banned: bannedNames.has(name),
      online: false
    });
  }

  for (const entry of ops) {
    const name = String(entry?.name || "").trim();
    if (!PLAYER_NAME_PATTERN.test(name)) {
      continue;
    }
    mergePlayerRecord(players, {
      name,
      uuid: entry.uuid || null,
      op: true,
      whitelisted: whitelistNames.has(name),
      banned: bannedNames.has(name),
      online: false
    });
  }

  return players;
}

async function listPlayersForServer(serverId) {
  const server = await readServerRecord(serverId);
  const players = await readKnownPlayers(server);
  const runtime = SERVER_PROCESSES.get(serverId);

  if (runtime?.players) {
    for (const player of runtime.players.known.values()) {
      mergePlayerRecord(players, {
        ...player,
        online: runtime.players.online.has(player.name)
      });
    }
  }

  return Array.from(players.values()).sort((left, right) => {
    if (left.online !== right.online) {
      return left.online ? -1 : 1;
    }
    if (left.op !== right.op) {
      return left.op ? -1 : 1;
    }
    return left.name.localeCompare(right.name);
  });
}

async function mutateNamedListFile(filePath, player, include) {
  const entries = await readJsonFile(filePath, []);
  const filtered = entries.filter((entry) => String(entry?.name || "").trim() !== player.name);
  if (include) {
    filtered.push({
      uuid: player.uuid || "",
      name: player.name
    });
  }
  await writeJsonFile(filePath, filtered);
}

async function opPlayerInServer(serverId, playerName) {
  const server = await readServerRecord(serverId);
  const name = String(playerName || "").trim();
  if (!PLAYER_NAME_PATTERN.test(name)) {
    throw new Error("Choose a valid player name.");
  }

  const runtime = SERVER_PROCESSES.get(serverId);
  const players = await listPlayersForServer(serverId);
  const player = players.find((entry) => entry.name === name);
  if (!player) {
    throw new Error("That player has not joined this server yet.");
  }

  const opsPath = path.join(server.path, "ops.json");
  const ops = await readJsonFile(opsPath, []);
  const hasOp = ops.some((entry) => String(entry?.name || "").trim() === name);

  if (!hasOp && player.uuid) {
    ops.push({
      uuid: player.uuid,
      name,
      level: 4,
      bypassesPlayerLimit: false
    });
    await writeJsonFile(opsPath, ops);
  }

  if (runtime?.state === "running") {
    runtime.logs.push({
      at: new Date().toISOString(),
      source: "stdin",
      line: `op ${name}`
    });
    trimLogLines(runtime.logs);
    runtime.child.stdin.write(`op ${name}\n`);
    mergePlayerRecord(ensureRuntimePlayerState(runtime).known, {
      name,
      uuid: player.uuid,
      op: true,
      online: ensureRuntimePlayerState(runtime).online.has(name)
    });
  } else if (!player.uuid && !hasOp) {
    throw new Error("Start the server or wait for this player to be written to usercache before granting OP.");
  }

  await appendActivity(serverId, "players", `${name} now has operator access.`, {
    playerName: name,
    action: "op"
  });

  return {
    player: {
      ...player,
      op: true
    },
    players: await listPlayersForServer(serverId)
  };
}

async function deopPlayerInServer(serverId, playerName) {
  const server = await readServerRecord(serverId);
  const name = String(playerName || "").trim();
  if (!PLAYER_NAME_PATTERN.test(name)) {
    throw new Error("Choose a valid player name.");
  }

  const opsPath = path.join(server.path, "ops.json");
  const ops = await readJsonFile(opsPath, []);
  const filtered = ops.filter((entry) => String(entry?.name || "").trim() !== name);
  await writeJsonFile(opsPath, filtered);

  const runtime = SERVER_PROCESSES.get(serverId);
  if (runtime?.state === "running") {
    runtime.logs.push({
      at: new Date().toISOString(),
      source: "stdin",
      line: `deop ${name}`
    });
    trimLogLines(runtime.logs);
    runtime.child.stdin.write(`deop ${name}\n`);
    mergePlayerRecord(ensureRuntimePlayerState(runtime).known, {
      name,
      op: false,
      online: ensureRuntimePlayerState(runtime).online.has(name)
    });
  }

  await appendActivity(serverId, "players", `Removed operator access from ${name}.`, {
    playerName: name,
    action: "deop"
  });

  return {
    players: await listPlayersForServer(serverId)
  };
}

async function setPlayerWhitelist(serverId, playerName, enabled) {
  const server = await readServerRecord(serverId);
  const name = String(playerName || "").trim();
  if (!PLAYER_NAME_PATTERN.test(name)) {
    throw new Error("Choose a valid player name.");
  }

  const players = await listPlayersForServer(serverId);
  const player = players.find((entry) => entry.name === name);
  if (!player || !player.uuid) {
    throw new Error("This player needs a recorded UUID before Resin can update the whitelist.");
  }

  await mutateNamedListFile(path.join(server.path, "whitelist.json"), player, enabled);

  const runtime = SERVER_PROCESSES.get(serverId);
  if (runtime?.state === "running") {
    const command = `${enabled ? "whitelist add" : "whitelist remove"} ${name}`;
    runtime.logs.push({
      at: new Date().toISOString(),
      source: "stdin",
      line: command
    });
    trimLogLines(runtime.logs);
    runtime.child.stdin.write(`${command}\n`);
  }

  await appendActivity(serverId, "players", `${enabled ? "Added" : "Removed"} ${name} ${enabled ? "to" : "from"} the whitelist.`, {
    playerName: name,
    action: enabled ? "whitelist-add" : "whitelist-remove"
  });

  return {
    players: await listPlayersForServer(serverId)
  };
}

async function setPlayerBan(serverId, playerName, enabled) {
  const server = await readServerRecord(serverId);
  const name = String(playerName || "").trim();
  if (!PLAYER_NAME_PATTERN.test(name)) {
    throw new Error("Choose a valid player name.");
  }

  const players = await listPlayersForServer(serverId);
  const player = players.find((entry) => entry.name === name);
  if (!player || (!player.uuid && enabled)) {
    throw new Error("This player needs a recorded UUID before Resin can manage bans.");
  }

  const filePath = path.join(server.path, "banned-players.json");
  const entries = await readJsonFile(filePath, []);
  const filtered = entries.filter((entry) => String(entry?.name || "").trim() !== name);
  if (enabled) {
    filtered.push({
      uuid: player.uuid,
      name,
      created: new Date().toISOString(),
      source: "Resin",
      expires: "forever",
      reason: "Banned from Resin"
    });
  }
  await writeJsonFile(filePath, filtered);

  const runtime = SERVER_PROCESSES.get(serverId);
  if (runtime?.state === "running") {
    const command = enabled ? `ban ${name}` : `pardon ${name}`;
    runtime.logs.push({
      at: new Date().toISOString(),
      source: "stdin",
      line: command
    });
    trimLogLines(runtime.logs);
    runtime.child.stdin.write(`${command}\n`);
  }

  await appendActivity(serverId, "players", `${enabled ? "Banned" : "Unbanned"} ${name}.`, {
    playerName: name,
    action: enabled ? "ban" : "unban"
  });

  return {
    players: await listPlayersForServer(serverId)
  };
}

async function listBackups(serverId) {
  const serverBackupDir = path.join(BACKUPS_DIR, serverId);
  try {
    const entries = await fs.readdir(serverBackupDir, { withFileTypes: true });
    const backups = [];
    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }
      const backupPath = path.join(serverBackupDir, entry.name);
      const manifest = await readJsonFile(path.join(backupPath, "backup.json"), null);
      const stat = await fs.stat(backupPath);
      backups.push({
        id: entry.name,
        path: backupPath,
        createdAt: manifest?.createdAt || stat.mtime.toISOString(),
        note: manifest?.note || "",
        sourceState: manifest?.sourceState || "unknown"
      });
    }
    return backups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch {
    return [];
  }
}

async function createBackup(serverId, note = "") {
  const server = await readServerRecord(serverId);
  const runtime = SERVER_PROCESSES.get(serverId);
  const sourceState = runtime?.state === "running" ? "running" : "stopped";
  if (runtime?.state === "running") {
    runtime.logs.push({
      at: new Date().toISOString(),
      source: "stdin",
      line: "save-all flush"
    });
    trimLogLines(runtime.logs);
    runtime.child.stdin.write("save-all flush\n");
  }

  const serverBackupDir = path.join(BACKUPS_DIR, serverId);
  await fs.mkdir(serverBackupDir, { recursive: true });
  const backupId = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(serverBackupDir, backupId);
  await fs.mkdir(backupPath, { recursive: true });

  const entries = await fs.readdir(server.path, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === ".DS_Store") {
      continue;
    }
    const source = path.join(server.path, entry.name);
    const target = path.join(backupPath, entry.name);
    if (entry.isDirectory()) {
      await fs.cp(source, target, { recursive: true });
    } else if (entry.isFile()) {
      await fs.copyFile(source, target);
    }
  }

  await writeJsonFile(path.join(backupPath, "backup.json"), {
    id: backupId,
    createdAt: new Date().toISOString(),
    note: String(note || "").trim(),
    sourceState
  });

  await appendActivity(serverId, "backup", "Created a server backup.", {
    backupId,
    sourceState
  });

  return {
    backupId,
    backups: await listBackups(serverId)
  };
}

async function evaluateServerReadiness(server) {
  const checks = [];
  const eulaPath = path.join(server.path, "eula.txt");
  const propertiesPath = path.join(server.path, "server.properties");
  const hasEula = await fs.readFile(eulaPath, "utf8").then((content) => /eula=true/i.test(content)).catch(() => false);
  checks.push({
    key: "eula",
    label: "EULA accepted",
    ok: hasEula,
    level: hasEula ? "ok" : "warning",
    message: hasEula ? "Mojang EULA is already accepted." : "Accept the EULA before first start."
  });

  const hasProperties = await fs.stat(propertiesPath).then((stat) => stat.isFile()).catch(() => false);
  checks.push({
    key: "properties",
    label: "Server settings file",
    ok: hasProperties,
    level: hasProperties ? "ok" : "error",
    message: hasProperties ? "server.properties is present." : "server.properties is missing."
  });

  const readyFiles = [];
  if (server.loader === "vanilla" || server.loader === "fabric") {
    readyFiles.push("server.jar");
  }
  if (server.loader === "quilt") {
    readyFiles.push("quilt-server-launch.jar");
  }
  if (server.loader === "forge" && server.loaderVersion) {
    readyFiles.push(path.join("libraries", "net", "minecraftforge", "forge", server.loaderVersion, "unix_args.txt"));
  }
  if (server.loader === "neoforge" && server.loaderVersion) {
    readyFiles.push(path.join("libraries", "net", "neoforged", "neoforge", server.loaderVersion, "unix_args.txt"));
  }

  const runtimeReady = readyFiles.length
    ? await Promise.all(readyFiles.map((file) => fs.stat(path.join(server.path, file)).then(() => true).catch(() => false))).then((results) => results.some(Boolean))
    : false;

  const installNeeded = ["forge", "neoforge", "quilt"].includes(server.loader) && !runtimeReady;
  checks.push({
    key: "runtime",
    label: installNeeded ? "Installer status" : "Runtime files",
    ok: runtimeReady,
    level: runtimeReady ? "ok" : installNeeded ? "warning" : "error",
    message: runtimeReady
      ? "Runtime files are in place."
      : installNeeded
        ? "Run install.sh before starting this loader."
        : "The expected launch files are missing."
  });

  const ready = checks.every((check) => check.ok || check.level === "warning");
  const blocked = checks.some((check) => check.level === "error");
  return {
    ready,
    blocked,
    installNeeded,
    checks
  };
}

async function buildServerOverview(serverId, server, players, mods, backups, activity, readiness, properties) {
  const runtime = getRuntimeSummary(serverId);
  const onlinePlayers = players.filter((player) => player.online);
  const lastBackup = backups[0] || null;
  return {
    runtimeState: runtime.runtimeState,
    onlinePlayers: onlinePlayers.length,
    knownPlayers: players.length,
    ops: players.filter((player) => player.op).length,
    whitelisted: players.filter((player) => player.whitelisted).length,
    banned: players.filter((player) => player.banned).length,
    mods: mods.length,
    backups: backups.length,
    lastBackupAt: lastBackup?.createdAt || null,
    lastActivityAt: activity[0]?.at || null,
    ready: readiness.ready,
    blocked: readiness.blocked,
    worldName: properties["level-name"] || "world",
    motd: properties.motd || server.motd || server.name,
    maxPlayers: Number(properties["max-players"] || 20),
    port: Number(properties["server-port"] || server.port || 25565),
    onlineMode: boolFromProperty(properties["online-mode"], Boolean(server.onlineMode))
  };
}

async function installModForServer(serverId, projectId) {
  const server = await readServerRecord(serverId);
  if (!supportsMods(server.loader)) {
    throw new Error("This server loader does not support downloadable mods in Resin.");
  }

  const loader = modrinthLoader(server.loader);
  const baseUrl = new URL(`${MODRINTH_API}/project/${projectId}/version`);
  baseUrl.searchParams.set("loaders", JSON.stringify([loader]));
  baseUrl.searchParams.set("game_versions", JSON.stringify([server.minecraftVersion]));
  baseUrl.searchParams.set("featured", "true");
  baseUrl.searchParams.set("include_changelog", "false");

  let versions = await fetchJson(baseUrl.toString());
  if (!versions.length) {
    baseUrl.searchParams.delete("featured");
    versions = await fetchJson(baseUrl.toString());
  }

  const version = versions[0];
  const primaryFile = version?.files?.find((file) => file.primary) || version?.files?.[0];
  if (!primaryFile?.url || !primaryFile?.filename) {
    throw new Error("No compatible downloadable mod file was found.");
  }

  const modsDir = path.join(server.path, "mods");
  await fs.mkdir(modsDir, { recursive: true });
  await streamToFile(primaryFile.url, path.join(modsDir, primaryFile.filename));
  await appendActivity(serverId, "mods", `Installed mod ${primaryFile.filename}.`, {
    projectId,
    versionId: version.id
  });

  return {
    installed: {
      projectId,
      versionId: version.id,
      versionNumber: version.version_number,
      filename: primaryFile.filename
    },
    mods: await listInstalledMods(serverId)
  };
}

function getStartCommand(serverDir) {
  if (process.platform === "win32") {
    return {
      command: "cmd.exe",
      args: ["/c", "start.cmd"],
      cwd: serverDir
    };
  }

  return {
    command: path.join(serverDir, "start.sh"),
    args: [],
    cwd: serverDir
  };
}

async function readServerRecord(serverId) {
  const serverDir = path.join(SERVERS_DIR, serverId);
  const content = await fs.readFile(path.join(serverDir, "resin-server.json"), "utf8");
  const parsed = JSON.parse(content);
  if (!parsed.javaRuntime) {
    parsed.javaRuntime = resolveJavaRuntimeForMinecraft(parsed.minecraftVersion);
  }
  return {
    ...parsed,
    path: serverDir
  };
}

async function readServerDetail(serverId) {
  const server = await readServerRecord(serverId);
  let readme = "";
  try {
    readme = await fs.readFile(path.join(server.path, "README.txt"), "utf8");
  } catch {
    readme = "";
  }

  const runtime = getRuntimeSummary(serverId);
  const [players, mods, activity, backups, properties, readiness] = await Promise.all([
    listPlayersForServer(serverId),
    listInstalledMods(serverId),
    readActivity(serverId).then((entries) => entries.sort((a, b) => new Date(b.at) - new Date(a.at))),
    listBackups(serverId),
    readServerProperties(server),
    evaluateServerReadiness(server)
  ]);
  return {
    ...server,
    status: runtime.runtimeState === "running" ? "running" : server.status,
    supportsMods: supportsMods(server.loader),
    runtime,
    readiness,
    properties,
    activity,
    backups,
    players,
    mods,
    overview: await buildServerOverview(serverId, server, players, mods, backups, activity, readiness, properties),
    readme
  };
}

async function startManagedServer(serverId) {
  const current = SERVER_PROCESSES.get(serverId);
  if (current?.state === "running") {
    throw new Error("This server is already running.");
  }

  const server = await readServerRecord(serverId);
  await Promise.all([
    fs.writeFile(path.join(server.path, "start.sh"), renderStartSh(server), { encoding: "utf8", mode: 0o755 }),
    fs.writeFile(path.join(server.path, "start.cmd"), renderStartCmd(server), "utf8"),
    fs.writeFile(path.join(server.path, "resin-server.json"), JSON.stringify(server, null, 2), "utf8")
  ]);
  const { command, args, cwd } = getStartCommand(server.path);

  const child = spawn(command, args, {
    cwd,
    stdio: ["pipe", "pipe", "pipe"],
    env: {
      ...process.env,
      JAVA_BIN: server.javaRuntime?.javaBin || process.env.JAVA_BIN || "java"
    }
  });

  const runtime = {
    child,
    state: "running",
    startedAt: new Date().toISOString(),
    lastExitCode: null,
    logs: [
      {
        at: new Date().toISOString(),
        source: "system",
        line: `Starting ${server.name}...`
      },
      {
        at: new Date().toISOString(),
        source: "system",
        line: `Using Java ${server.javaRuntime?.version || "system default"}`
      }
    ],
    buffer: "",
    players: createEmptyPlayerState()
  };

  SERVER_PROCESSES.set(serverId, runtime);
  await appendActivity(serverId, "runtime", `Started ${server.name}.`, {
    java: server.javaRuntime?.version || "system"
  });

  child.stdout.on("data", (chunk) => appendProcessLog(runtime, chunk, "stdout"));
  child.stderr.on("data", (chunk) => appendProcessLog(runtime, chunk, "stderr"));
  child.on("error", (error) => {
    runtime.logs.push({
      at: new Date().toISOString(),
      source: "system",
      line: error.message
    });
    trimLogLines(runtime.logs);
  });
  child.on("exit", (code, signal) => {
      if (runtime.buffer.trim()) {
      updateRuntimePlayersFromLog(runtime, runtime.buffer.trim());
      runtime.logs.push({
        at: new Date().toISOString(),
        source: "stdout",
        line: runtime.buffer.trim()
      });
      runtime.buffer = "";
    }
    runtime.state = "stopped";
    runtime.lastExitCode = code ?? signal ?? null;
    runtime.logs.push({
      at: new Date().toISOString(),
      source: "system",
      line: `Server exited (${signal || code || 0}).`
    });
    trimLogLines(runtime.logs);
  });

  return readServerDetail(serverId);
}

async function stopManagedServer(serverId) {
  const runtime = SERVER_PROCESSES.get(serverId);
  if (!runtime || runtime.state !== "running") {
    throw new Error("This server is not currently running.");
  }

  runtime.logs.push({
    at: new Date().toISOString(),
    source: "system",
    line: "Stop requested from Resin."
  });
  trimLogLines(runtime.logs);
  runtime.child.stdin.write("stop\n");

  setTimeout(() => {
    if (runtime.state === "running") {
      runtime.child.kill("SIGTERM");
    }
  }, 10000).unref();
  await appendActivity(serverId, "runtime", "Stop requested from Resin.", {});

  return readServerDetail(serverId);
}

async function sendServerCommand(serverId, commandText) {
  const runtime = SERVER_PROCESSES.get(serverId);
  if (!runtime || runtime.state !== "running") {
    throw new Error("Start the server before sending commands.");
  }

  const command = String(commandText || "").trim();
  if (!command) {
    throw new Error("Command text is required.");
  }

  runtime.logs.push({
    at: new Date().toISOString(),
    source: "stdin",
    line: command
  });
  trimLogLines(runtime.logs);
  runtime.child.stdin.write(`${command}\n`);
  if (/^(op|deop|whitelist|ban|pardon|say|save-all|save-off|save-on|stop)\b/i.test(command)) {
    await appendActivity(serverId, "commands", `Ran command: ${command}`, {
      command
    });
  }
  return readServerDetail(serverId);
}

function renderProperties({ name, motd, onlineMode, port }) {
  return [
    `motd=${motd || name}`,
    `server-port=${port}`,
    "enable-command-block=false",
    "enable-rcon=false",
    `online-mode=${onlineMode ? "true" : "false"}`,
    "spawn-protection=0",
    "view-distance=10",
    "simulation-distance=10",
    "difficulty=easy",
    "max-players=20"
  ].join("\n");
}

function renderStartSh(server) {
  const mem = `${server.memoryMb}M`;
  const forgeArgs = server.loader === "forge" && server.loaderVersion ? `libraries/net/minecraftforge/forge/${server.loaderVersion}/unix_args.txt` : "";
  const neoArgs = server.loader === "neoforge" && server.loaderVersion ? `libraries/net/neoforged/neoforge/${server.loaderVersion}/unix_args.txt` : "";
  const javaBin = server.javaRuntime?.javaBin || "java";
  return `#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
JAVA_BIN="\${JAVA_BIN:-${javaBin}}"

if [ -f "server.jar" ]; then
  exec "$JAVA_BIN" -Xms${mem} -Xmx${mem} -jar server.jar nogui
fi

${forgeArgs ? `if [ -f "${forgeArgs}" ]; then
  exec "$JAVA_BIN" -Xms${mem} -Xmx${mem} @${forgeArgs} nogui
fi
` : ""}

${neoArgs ? `if [ -f "${neoArgs}" ]; then
  exec "$JAVA_BIN" -Xms${mem} -Xmx${mem} @${neoArgs} nogui
fi
` : ""}

if [ -f "quilt-server-launch.jar" ]; then
  exec "$JAVA_BIN" -Xms${mem} -Xmx${mem} -jar quilt-server-launch.jar nogui
fi

printf "Server runtime is not ready yet. Run the generated installer first.\\n"
exit 1
`;
}

function renderStartCmd(server) {
  const mem = `${server.memoryMb}M`;
  const javaBin = server.javaRuntime?.javaBin || "java";
  return `@echo off
cd /d "%~dp0"
set "JAVA_BIN=${javaBin}"

if exist server.jar (
  "%JAVA_BIN%" -Xms${mem} -Xmx${mem} -jar server.jar nogui
  goto :eof
)

if exist quilt-server-launch.jar (
  "%JAVA_BIN%" -Xms${mem} -Xmx${mem} -jar quilt-server-launch.jar nogui
  goto :eof
)

echo Server runtime is not ready yet. Run the generated installer first.
exit /b 1
`;
}

function renderInstallScript(server, downloadUrl) {
  const javaBin = server.javaRuntime?.javaBin || "java";
  if (!downloadUrl) {
    return `#!/usr/bin/env bash
set -euo pipefail
printf "No direct installer command is available for this server yet. Review README.txt for next steps.\\n"
`;
  }

  if (server.loader === "forge") {
    return `#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
JAVA_BIN="\${JAVA_BIN:-${javaBin}}"
[ -f "${server.installerFile}" ] || curl -L "${downloadUrl}" -o "${server.installerFile}"
"$JAVA_BIN" -jar "${server.installerFile}" --installServer .
printf "Forge server installed. Use ./start.sh next.\\n"
`;
  }

  if (server.loader === "neoforge") {
    return `#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
JAVA_BIN="\${JAVA_BIN:-${javaBin}}"
[ -f "${server.installerFile}" ] || curl -L "${downloadUrl}" -o "${server.installerFile}"
"$JAVA_BIN" -jar "${server.installerFile}" --install-server . --server-jar
printf "NeoForge server installed. Use ./start.sh next.\\n"
`;
  }

  if (server.loader === "quilt") {
    return `#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
JAVA_BIN="\${JAVA_BIN:-${javaBin}}"
[ -f "${server.installerFile}" ] || curl -L "${downloadUrl}" -o "${server.installerFile}"
"$JAVA_BIN" -jar "${server.installerFile}" install server "${server.minecraftVersion}" "${server.loaderVersion}" --install-dir=. --create-scripts --download-server
printf "Quilt server installed. Review generated scripts, then use ./start.sh or the upstream launch scripts.\\n"
`;
  }

  return `#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
[ -f "${server.installerFile}" ] || curl -L "${downloadUrl}" -o "${server.installerFile}"
printf "${server.installerFile} is ready. Use ./start.sh next.\\n"
`;
}

function renderReadme(server, summary) {
  return [
    "Resin Minecraft Server",
    "======================",
    "",
    `Name: ${server.name}`,
    `Loader: ${LOADER_DEFS[server.loader].name}`,
    `Minecraft: ${server.minecraftVersion}`,
    `Variant: ${server.build || server.loaderVersion || "default"}`,
    `Java: ${server.javaRuntime?.version || "system default"} (${server.javaRuntime?.javaBin || "java"})`,
    `Created: ${server.createdAt}`,
    "",
    summary,
    "",
    "Files in this folder:",
    "- start.sh / start.cmd: generated launchers",
    "- install.sh: fetches the selected server artifact or installer",
    "- resin-server.json: creation metadata",
    "- server.properties: starter properties",
    "",
    "Notes:",
    "- Direct-download loaders are runnable once Java is installed and EULA is accepted.",
    "- Forge, NeoForge, and Quilt use installer-first workflows upstream, and install.sh now runs the verified vendor installer command for you."
  ].join("\n");
}

async function createServer(payload) {
  const loader = payload.loader;
  if (!LOADER_DEFS[loader]) {
    throw new Error("Choose a supported loader.");
  }

  const name = sanitizeName(payload.name);
  if (!name) {
    throw new Error("Server name is required.");
  }

  const minecraftVersion = String(payload.minecraftVersion || "").trim();
  if (!minecraftVersion) {
    throw new Error("Minecraft version is required.");
  }

  const server = {
    id: slugify(name),
    name,
    loader,
    minecraftVersion,
    loaderVersion: String(payload.loaderVersion || "").trim(),
    build: String(payload.build || "").trim(),
    memoryMb: Math.max(1024, Number(payload.memoryMb || 4096)),
    motd: sanitizeName(payload.motd || name) || name,
    onlineMode: Boolean(payload.onlineMode),
    port: Math.max(1024, Number(payload.port || 25565)),
    javaRuntime: resolveJavaRuntimeForMinecraft(minecraftVersion),
    createdAt: new Date().toISOString()
  };

  let serverDir = path.join(SERVERS_DIR, server.id);
  try {
    await fs.access(serverDir);
    server.id = `${server.id}-${Date.now()}`;
    serverDir = path.join(SERVERS_DIR, server.id);
  } catch {
    // The default slug is free to use.
  }
  await fs.mkdir(serverDir, { recursive: true });
  await fs.mkdir(path.join(serverDir, "mods"), { recursive: true });

  let artifactUrl = "";
  let installerFile = "server.jar";
  let status = "prepared";
  let summary = "Folder scaffolded successfully.";

  if (loader === "vanilla") {
    artifactUrl = await getVanillaServerDownload(server.minecraftVersion);
    status = "ready";
    summary = "Official Mojang server jar selected and downloaded.";
  } else if (loader === "fabric") {
    const installerVersion = String(payload.installerVersion || "").trim();
    if (!server.loaderVersion || !installerVersion) {
      throw new Error("Fabric requires both a loader version and installer version.");
    }
    artifactUrl = `https://meta.fabricmc.net/v2/versions/loader/${server.minecraftVersion}/${server.loaderVersion}/${installerVersion}/server/jar`;
    status = "ready";
    summary = "Fabric server launcher selected from Fabric Meta.";
  } else if (loader === "forge") {
    if (!server.loaderVersion) {
      throw new Error("Forge build is required.");
    }
    installerFile = `forge-${server.loaderVersion}-installer.jar`;
    artifactUrl = `https://maven.minecraftforge.net/net/minecraftforge/forge/${server.loaderVersion}/${installerFile}`;
    summary = "Forge installer prepared. Run install.sh, then start.sh.";
  } else if (loader === "neoforge") {
    if (!server.loaderVersion) {
      throw new Error("NeoForge build is required.");
    }
    installerFile = `neoforge-${server.loaderVersion}-installer.jar`;
    artifactUrl = `https://maven.neoforged.net/releases/net/neoforged/neoforge/${server.loaderVersion}/${installerFile}`;
    summary = "NeoForge installer prepared. Run install.sh, then start.sh.";
  } else if (loader === "quilt") {
    const installerVersion = String(payload.installerVersion || "").trim();
    if (!installerVersion || !server.loaderVersion) {
      throw new Error("Quilt requires both a loader version and installer version.");
    }
    installerFile = `quilt-installer-${installerVersion}.jar`;
    artifactUrl = `https://maven.quiltmc.org/repository/release/org/quiltmc/quilt-installer/${installerVersion}/${installerFile}`;
    summary = "Quilt installer prepared. Run install.sh, then use the installer jar for your selected loader.";
  }

  server.installerFile = installerFile;
  server.artifactUrl = artifactUrl;
  server.status = status;

  if (artifactUrl) {
    await streamToFile(path.basename(installerFile) === "server.jar" ? artifactUrl : artifactUrl, path.join(serverDir, installerFile));
  }

  await Promise.all([
    fs.writeFile(path.join(serverDir, "eula.txt"), `eula=${payload.acceptEula ? "true" : "false"}\n`, "utf8"),
    fs.writeFile(path.join(serverDir, "server.properties"), renderProperties(server), "utf8"),
    fs.writeFile(path.join(serverDir, "start.sh"), renderStartSh(server), { encoding: "utf8", mode: 0o755 }),
    fs.writeFile(path.join(serverDir, "start.cmd"), renderStartCmd(server), "utf8"),
    fs.writeFile(path.join(serverDir, "install.sh"), renderInstallScript(server, artifactUrl), { encoding: "utf8", mode: 0o755 }),
    fs.writeFile(path.join(serverDir, "README.txt"), renderReadme(server, summary), "utf8"),
    fs.writeFile(path.join(serverDir, "resin-server.json"), JSON.stringify(server, null, 2), "utf8")
  ]);
  await appendActivity(server.id, "create", `Created ${server.name}.`, {
    loader: server.loader,
    minecraftVersion: server.minecraftVersion
  });

  return {
    ...server,
    path: serverDir,
    summary
  };
}

async function listServers() {
  await fs.mkdir(SERVERS_DIR, { recursive: true });
  const entries = await fs.readdir(SERVERS_DIR, { withFileTypes: true });
  const servers = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const filePath = path.join(SERVERS_DIR, entry.name, "resin-server.json");
    try {
      const content = await fs.readFile(filePath, "utf8");
      const parsed = JSON.parse(content);
      const runtime = getRuntimeSummary(parsed.id);
      servers.push({
        id: parsed.id,
        name: parsed.name,
        loader: parsed.loader,
        minecraftVersion: parsed.minecraftVersion,
        build: parsed.build,
        loaderVersion: parsed.loaderVersion,
        javaRuntime: parsed.javaRuntime,
        createdAt: parsed.createdAt,
        status: runtime.runtimeState === "running" ? "running" : parsed.status,
        runtimeState: runtime.runtimeState,
        supportsMods: supportsMods(parsed.loader),
        path: path.join(SERVERS_DIR, entry.name)
      });
    } catch {
      continue;
    }
  }

  return servers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function serveStatic(req, res) {
  const requestPath = req.url === "/" ? "/index.html" : req.url;
  const filePath = path.normalize(path.join(PUBLIC_DIR, requestPath));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) {
      throw new Error("Not a file");
    }

    const ext = path.extname(filePath);
    res.writeHead(200, {
      "Content-Type": CONTENT_TYPES[ext] || "application/octet-stream"
    });
    createReadStream(filePath).pipe(res);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === "GET" && requestUrl.pathname === "/api/loaders") {
      return json(res, 200, { loaders: await getLoaderCatalog() });
    }

    if (req.method === "GET" && requestUrl.pathname === "/api/java-runtimes") {
      return json(res, 200, {
        runtimes: INSTALLED_JAVA_RUNTIMES
      });
    }

    if (req.method === "GET" && requestUrl.pathname.startsWith("/api/loaders/")) {
      const parts = requestUrl.pathname.split("/").filter(Boolean);
      const loader = parts[2];

      if (!LOADER_DEFS[loader]) {
        return json(res, 404, { error: "Loader not found." });
      }

      if (parts[3] === "variants") {
        const minecraftVersion = requestUrl.searchParams.get("minecraftVersion");
        if (!minecraftVersion) {
          return json(res, 400, { error: "minecraftVersion is required." });
        }
        return json(res, 200, await getLoaderVariants(loader, minecraftVersion));
      }

      return json(res, 200, await getLoaderVersions(loader));
    }

    if (req.method === "GET" && requestUrl.pathname === "/api/servers") {
      return json(res, 200, { servers: await listServers() });
    }

    if (req.method === "POST" && requestUrl.pathname === "/api/servers") {
      const payload = await readBody(req);
      const created = await createServer(payload);
      return json(res, 201, created);
    }

    const serverMatch = requestUrl.pathname.match(/^\/api\/servers\/([^/]+)(?:\/([^/]+))?$/);
    if (serverMatch) {
      const [, serverId, action] = serverMatch;

      if (req.method === "GET" && !action) {
        return json(res, 200, await readServerDetail(serverId));
      }

      if (req.method === "POST" && action === "start") {
        return json(res, 200, await startManagedServer(serverId));
      }

      if (req.method === "POST" && action === "stop") {
        return json(res, 200, await stopManagedServer(serverId));
      }

      if (req.method === "POST" && action === "command") {
        const payload = await readBody(req);
        return json(res, 200, await sendServerCommand(serverId, payload.command));
      }

      if (req.method === "GET" && action === "players") {
        return json(res, 200, {
          players: await listPlayersForServer(serverId)
        });
      }

      if (req.method === "POST" && action === "op") {
        const payload = await readBody(req);
        return json(res, 200, await opPlayerInServer(serverId, payload.playerName));
      }

      if (req.method === "POST" && action === "deop") {
        const payload = await readBody(req);
        return json(res, 200, await deopPlayerInServer(serverId, payload.playerName));
      }

      if (req.method === "POST" && action === "whitelist") {
        const payload = await readBody(req);
        return json(res, 200, await setPlayerWhitelist(serverId, payload.playerName, Boolean(payload.enabled)));
      }

      if (req.method === "POST" && action === "ban") {
        const payload = await readBody(req);
        return json(res, 200, await setPlayerBan(serverId, payload.playerName, Boolean(payload.enabled)));
      }

      if (req.method === "POST" && action === "settings") {
        const payload = await readBody(req);
        return json(res, 200, {
          properties: await updateServerProperties(serverId, payload.properties || {})
        });
      }

      if (req.method === "POST" && action === "backups") {
        const payload = await readBody(req);
        return json(res, 200, await createBackup(serverId, payload.note));
      }

      if (req.method === "GET" && action === "mods") {
        const query = requestUrl.searchParams.get("query");
        if (query !== null) {
          return json(res, 200, await searchModsForServer(serverId, query));
        }
        return json(res, 200, {
          mods: await listInstalledMods(serverId)
        });
      }

      if (req.method === "POST" && action === "mods") {
        const payload = await readBody(req);
        return json(res, 200, await installModForServer(serverId, payload.projectId));
      }
    }

    return serveStatic(req, res);
  } catch (error) {
    return json(res, 500, {
      error: error instanceof Error ? error.message : "Unexpected server error."
    });
  }
});

async function bootstrap() {
  await fs.mkdir(SERVERS_DIR, { recursive: true });
  await fs.mkdir(BACKUPS_DIR, { recursive: true });
  server.listen(PORT, () => {
    console.log(`Resin UI running on http://localhost:${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
