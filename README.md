# Resin

Resin is a local-first Minecraft server control panel with a modern WebUI.

It is designed for people who want one place to:
- create Minecraft servers across multiple versions and loaders
- manage server runtime, console, players, mods, settings, backups, and activity
- keep Java runtime selection automatic instead of manually juggling JVM versions

The current repository URL is:
- [mateo-cogeanu/Resin](https://github.com/mateo-cogeanu/Resin)

## What Resin Supports

### Loaders
- Vanilla
- Fabric
- Quilt
- Forge
- NeoForge

### Server Lifecycle
- create server folders with generated launcher and install scripts
- start and stop managed servers from the WebUI
- send live console commands
- keep rolling console logs in the UI

### Runtime Handling
- auto-detect installed Java runtimes on macOS
- assign a Java runtime per server
- prefer Java 25 for Minecraft `26.1+`
- expose runtime reasoning directly in the UI

### Management Screens
- `Create`
- `Inventory`
- `Overview`
- `Console`
- `Players`
- `Settings`
- `Backups`
- `Activity`
- `Mods`

### Players
- list players who have joined the server
- show online and offline state when runtime data is available
- grant and remove OP
- add and remove whitelist entries
- ban and unban players

### Settings
- edit managed `server.properties` values from the UI
- persist changes back to disk
- reflect important mirrored settings like `motd`, `port`, and `online-mode`

### Backups
- create timestamped snapshot backups of server folders
- store backups outside the live server directory
- expose backup history in the UI

### Activity
- track important events such as:
  - server creation
  - starts and stops
  - settings updates
  - player admin actions
  - mod downloads
  - backup creation

### Mods
- search Modrinth by server loader and Minecraft version
- show mod icons when Modrinth provides them
- select multiple mods and download them in one batch
- track installed mods from the server `mods` folder

## Project Structure

```text
Resin/
├── AGENTS.md
├── backups/
├── package.json
├── public/
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── server.js
└── servers/
```

## Requirements

- Node.js 18+ recommended
- macOS currently has the best Java auto-detection support in this implementation
- internet access for:
  - loader metadata
  - artifact downloads
  - Modrinth search and mod downloads

## Running Resin

From the project root:

```bash
node server.js
```

Or:

```bash
npm start
```

Then open:

```text
http://localhost:3000
```

## Scripts

```bash
npm start
npm run dev
```

## How Server Creation Works

When you create a server, Resin:

1. fetches live metadata for the selected loader
2. creates a folder inside `servers/`
3. writes `server.properties`, `eula.txt`, `start.sh`, `start.cmd`, `install.sh`, `README.txt`, and `resin-server.json`
4. downloads the direct server artifact or the verified installer artifact when available
5. assigns the best matching Java runtime automatically

## Notes About Loader Workflows

- `Vanilla` and `Fabric` are treated as direct-download workflows.
- `Forge`, `NeoForge`, and `Quilt` may still require installer-first preparation before first launch.
- Resin surfaces readiness checks so the UI can tell you when installer prep is still needed.

## Current Limitations

- backup restore is not implemented yet
- Java runtime detection is primarily tailored to macOS
- not every possible `server.properties` field is editable from the UI yet
- the repository folder in this local workspace is not currently initialized as a git repository

## Development Notes

- backend: [server.js](/Users/mateocogeanu/Downloads/Resin/server.js)
- frontend markup: [public/index.html](/Users/mateocogeanu/Downloads/Resin/public/index.html)
- frontend logic: [public/app.js](/Users/mateocogeanu/Downloads/Resin/public/app.js)
- frontend styling: [public/styles.css](/Users/mateocogeanu/Downloads/Resin/public/styles.css)
