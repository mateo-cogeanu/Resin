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
