# Changelog

## 2026-05-11

### Dashboard Trust Pass
- rebuilt the selected-server overview flow so the empty state now clears derived badges, recommendations, backup previews, and console insights instead of leaking data from the last selected server
- added richer overview hero metadata so the main dashboard highlights readiness state, loader/version, Java choice, and online/offline mode in one compact row
- added guided `Next Best Steps` recommendations to Overview so Resin can tell the operator what to do next when a server still needs installer prep, EULA acceptance, backups, or port cleanup
- added summary cards to the `Health` screen so operators can see total checks, warnings, and blockers before reading the full check list

### Console Quality of Life
- added client-side console search for the currently visible log view without mutating the stored runtime log history
- added a console insight strip that counts visible lines, joins, chat, warnings, and commands for the current filter/search view
- added visible-log copy and download actions so console output can be exported without leaving the WebUI
- added a non-destructive `Clear view` action that clears only the current client-side console surface and lets polling refill it with fresh lines
- reset temporary console view overrides whenever Resin refreshes server detail so filtered/cleared views never get stuck across normal polling

### Backups UX
- expanded backup manifests and list payloads to include world name, MOTD, file count, snapshot size, loader, and Minecraft version metadata
- added recursive snapshot measurement so newly created backups record file count and total byte size alongside the copied folder
- replaced one-click restore rows with a deliberate preview-first backup selection flow in the WebUI
- added a dedicated backup preview card with created time, world, snapshot size, source state, version, and note before restore confirmation
- added a second restore confirmation step so restoring a snapshot stays intentional and clearly scoped

### Activity and Visual Polish
- converted the Activity screen from a plain stacked list into a timeline-style layout with visual markers between entries
- added dedicated layout styling for overview hero badges, health summary cards, console insights, console utility actions, selected backup rows, and activity timeline entries
- kept the new dashboard elements responsive so the expanded panels still collapse cleanly on narrower screens

### Overview Connection UX
- rebuilt the `Overview` connection card into a clearer join surface instead of a plain metadata list
- elevated the server IP into a dedicated highlighted block so the address is readable at a glance
- added a one-click `Copy IP` action with an accessible label and success/error status feedback
- moved loader, Java, world, and last-backup details into supporting connection stats under the main join address
- replaced the hardcoded `127.0.0.1` display with host-discovered LAN address detection from the Resin backend
- made Overview and the top bar prefer a real local-network address when one is available, with localhost kept only as a fallback
- added alternate local address rows so additional host interfaces can still be copied when needed

### Verification
- verified `node --check server.js`
- verified `node --check public/app.js`
- verified Resin boots locally again at `http://localhost:3000`
- verified backup creation now records preview metadata including snapshot size and file count on a disposable Fabric test server
- verified server detail now includes the richer overview, health, and backup data used by the new dashboard surfaces
- deleted the disposable `ui-qa` verification server after testing so inventory returned to a clean state
- verified the restarted backend now returns a LAN address plus fallback addresses in `overview.connection` on a disposable Fabric test server, then deleted that test server

## 2026-05-03

### Core Management Expansion
- added a dedicated `Health` screen and a dedicated `Files` screen to the Resin management workspace
- expanded the selected-server detail model so the frontend now receives health data and backup schedule state together with runtime, settings, backups, players, and mods
- kept the new screens local-first and intentionally avoided adding secure global connection work in this pass

### Health Center
- added a health-center backend model that combines readiness checks, EULA state, Java profile status, local port availability checks, and mod follow-up warnings
- surfaced duplicate mod file warnings and unresolved dependency follow-up notes from prior mod install activity
- added a dedicated `GET /api/servers/:id/health` endpoint for focused health inspection

### File Manager and Config Editing
- added server file browser helpers for listing folders, opening supported text files, saving edits, creating folders, renaming paths, deleting paths, uploading files, and downloading files
- added path normalization and root-bound path validation so file actions stay inside the selected server directory
- exposed file APIs through `/api/servers/:id/files` with query-based open/download behavior and action-based POST mutations
- added a WebUI file browser and text editor with upload, download, rename, delete, and create-folder controls

### Runtime Profiles
- expanded server metadata to store `installerVersion`, `extraJvmArgs`, and optional `javaOverrideMajor`
- updated server creation so new servers can be provisioned with an explicit Java override and extra JVM arguments
- regenerated launch scripts and README metadata when runtime profile values change
- added a runtime-profile update flow for memory, Java override, and JVM args through `POST /api/servers/:id/runtime`

### Backup Scheduling
- added persisted backup schedule files per server with enabled state, cadence, retention, and next-run time
- implemented schedule helpers for hourly, daily, and weekly cadences
- added a background scheduler loop that creates scheduled backups, prunes old snapshots, and records failures as activity
- added backup schedule save/read endpoints and matching UI controls in the Backups screen

### Templates and Cloning
- added a `templates/` store for reusable server templates
- added template save/list/delete flows so the current selected server can become a reusable Create preset
- added template application in the Create screen, including post-create property hydration for saved server settings
- added server cloning through `POST /api/servers/:id/clone`
- cloned server setup now reuses the source configuration, runtime profile, properties, and downloaded mod set while intentionally skipping live world data

### Players
- added kick support for online players
- added pardon support as a first-class player action instead of only hiding it behind the generic ban toggle
- expanded ban handling to accept an optional reason and forward that reason to the running server command when available
- added a shared reason input in the Players screen for kick and ban operations

### Mods
- added installed-mod removal through `POST /api/servers/:id/mod-remove`
- added on-demand update checks for installed Modrinth-backed mods through `GET /api/servers/:id/mod-updates`
- moved mod update checks out of the general refresh loop so Resin does not hammer Modrinth during normal polling
- added a dedicated updates/warnings card in the Mods screen and remove buttons in the installed-mod list

### Create and Navigation UX
- added template selection, Java override, and extra JVM args to the Create flow
- added a template management side card so reusable server profiles can be saved and deleted from the UI
- added clone actions to Inventory cards

### Documentation
- updated `README.md` to document the new Health and Files screens
- updated `README.md` to document runtime profile editing, scheduled backups, cloning, templates, file management, and richer player/mod workflows
- refreshed the limitations section in `README.md` to include the intentionally text-focused file editor scope

### Verification
- verified `node --check server.js`
- verified `node --check public/app.js`
- verified health-center output on a fresh Fabric server
- verified file listing, text-file open, template save/list, runtime profile save, and backup schedule save APIs
- verified dependency-aware mod install plus on-demand mod update checks on the fresh Fabric test server
- verified server clone creation, then cleaned up the disposable clone after validation

### Mods
- replaced the single-project mod download flow with a dependency-aware batch installer for Modrinth-backed servers
- added recursive required-dependency resolution using Modrinth project and version metadata so selected mods can pull in their required libraries automatically
- cached project and version lookups during dependency planning so one batch install can reuse shared dependency results
- added a persistent `.resin-mods.json` manifest so downloaded jars can be displayed with titles, versions, and dependency markers instead of only raw filenames
- taught mod search results to flag already-installed projects and updated the installed-mod list UI to show dependency status
- updated the frontend batch download flow to submit the full selection in one request and report installed, skipped, dependency, and manual-review counts back to the operator

### Server Management
- added a real server deletion workflow through `DELETE /api/servers/:id`
- made server deletion remove both the live server folder and the matching Resin backup directory in one operation
- exposed delete actions in both Inventory and the Console danger zone, with running-server protection so deletion stays intentional

### UI and Navigation
- changed the default landing screen from `Create` to `Inventory`
- reordered the workspace navigation so `Inventory` comes before `Create Server`
- added a persisted theme picker with four built-in palettes: `Midnight`, `Harbor`, `Ember`, and `Grove`
- adjusted shared UI styling so the theme system affects the main app shell, top bar, inventory actions, and danger controls consistently
- reconstructed the `Overview` screen into a dedicated stacked dashboard layout instead of reusing the tighter side-rail shell from other screens
- split overview content into a full-width status card, a dedicated readiness card, and a responsive secondary grid for connection, players, and activity
- tightened overview card wrapping rules so long readiness messages and metadata stay inside their cards instead of pushing content off-screen

### Documentation
- updated `README.md` to document stopped-server deletion from the WebUI
- updated `README.md` to document automatic Modrinth dependency resolution during mod installs
- replaced the old mod-download limitation in `README.md` with the current upstream limitation around external or unresolved dependency references
- recorded the new UI theme capability and inventory-first workflow in the changelog for future contributors
- verified the dependency-aware install flow against a temporary Fabric server using a real mod with required dependencies, then deleted that temporary server through the new API
- verified that required dependency resolution can still surface honest unresolved upstream cases when Modrinth has no compatible dependency version for the selected server

## 2026-05-02

### Documentation
- added a new root `README.md`
- documented Resin as a local-first Minecraft server control panel
- documented supported loaders: Vanilla, Fabric, Quilt, Forge, and NeoForge
- documented the current management areas: Create, Inventory, Overview, Console, Players, Settings, Backups, Activity, and Mods
- documented automatic Java runtime selection, including the Java 25 preference for Minecraft `26.1+`
- documented player administration support, managed settings support, backup behavior, activity tracking, and Modrinth-based mod workflow
- documented the runtime and project structure at the repository root
- documented the local run commands and npm scripts
- documented the current loader workflow differences and project limitations

### Repository Status Notes
- added an initial changelog file because the project did not have one yet
- recorded that the local workspace currently is not initialized as a git repository, so no commit or push step was possible from this directory

### Repository Setup
- initialized repository hygiene for version control by adding a root `.gitignore`
- ignored local server runtime folders in `servers/` so generated worlds, jars, and mutable server state do not become default tracked content
- ignored local backup snapshots in `backups/` so backup copies remain local operational data rather than repository history
- ignored `.DS_Store`, `node_modules/`, editor clutter, and loose `.log` files to keep the repository cleaner once git is initialized

### GitHub Activation
- initialized the local directory as a real git repository on branch `main`
- configured the GitHub remote at `https://github.com/mateo-cogeanu/Resin.git`
- created the first local repository commit for the current Resin project state
- prepared the repository for normal commit-and-push workflow going forward under the standing instructions in `AGENTS.md`

### Runtime Detection
- expanded Java runtime discovery beyond the macOS `java_home` workflow
- added parsing for `java -version` output so Resin can build runtime metadata from fallback probes
- taught Resin to inspect `JAVA_HOME` on non-macOS hosts before falling back to the system `java` command
- kept runtime results deduplicated and ordered so automatic Java selection still prefers the best available match

### Settings and Backups
- added raw `server.properties` reading so the full file can be surfaced in the WebUI
- expanded the settings update flow so Resin can save either guided form fields or the complete raw `server.properties` file
- fixed the settings API response shape so the frontend receives `properties` and `rawContent` at the top level after a save
- added backup restore support through a new `/api/servers/:id/restore-backup` endpoint
- implemented full-folder snapshot restore behavior for stopped servers, including backup existence checks and restore activity entries
- exposed the raw settings editor and backup restore controls in the frontend

### Documentation Refresh
- updated `README.md` to document raw `server.properties` editing and backup restore support
- updated runtime handling notes in `README.md` to describe the macOS path plus non-macOS fallback behavior
- removed stale limitations from `README.md` that no longer matched the product
- replaced the old limitations section with current constraints around non-macOS Java discovery, restore behavior, installer-style loaders, and mod dependency resolution
