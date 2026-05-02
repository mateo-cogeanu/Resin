# Changelog

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
