# Changelog

## 2026-05-03

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
