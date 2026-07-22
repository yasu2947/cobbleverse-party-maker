# AGENTS.md — Pokémon Random Party Maker

> Auto-loaded at the project root.  
> Goals: **token efficiency**, consistent workflow, modular sources (**max 300 lines** per file; HTML may be single-file).

---

## 0. Token-First

1. **Never** read the entire codebase at once.
2. Read order: `docs/index.md` → relevant `docs/features/<topic>.md` → **only** the paths, symbols, and line ranges listed there.
3. If the location is unknown: search `docs/index.md` → Grep / SemanticSearch → read matched ranges only.
4. On move, rename, split, or new module: update `docs/index.md` and the matching feature docs **in the same task**.
5. If `docs/index.md` is missing: **stop**. Tell the architect to run `/bootstrap`. Do **not** scan the repo as a substitute.

Never read `.venv`, `node_modules`, `dist`, `build`, or `docs/archive/` unless explicitly asked.

---

## 1. Language Policy

| Target | Language |
|--------|----------|
| This file (`AGENTS.md`) | **English** |
| Chat with architect | **Korean** |
| Code comments | **Korean** |
| Identifiers, functions, classes, variables | **English** |
| User-facing UI strings | **Korean** |
| `prd.md` | **English** |
| `docs/` prose | **Korean** (paths and symbols in English) |

---

## 2. Project Overview

| Field | Value |
|-------|-------|
| Name | Pokémon Random Party Maker |
| Summary | Single-page web app that generates random 6-Pokémon parties from the full National Pokédex with configurable filters, pinning, and type-balance analysis. All sprites/data fetched live from PokéAPI — no local image assets. |
| Stack | Vanilla JavaScript (ES Modules, ES2020+), Plain CSS, PokéAPI REST. Vite build recommended (no-build ESM also acceptable). |
| Entry point | `index.html` → `src/main.js` |

Details: `docs/requirements.md`  
Architecture: `docs/architecture/system_design.md`

---

## 3. Docs = Map

`docs/index.md` is the **only** entry point. Find features and edit targets through docs — not by browsing source.

### Feature docs must include

- One-line summary
- Code Map: `path/to/file.js` — `symbol_name` (L45–L120)
- **Reusable** — modules other features often import
- **Reuse Pitfalls** — common mistakes when reusing this code
- Dependencies, Notes, Change Log

### Reusable Modules (index)

Cross-feature modules **must** appear under **Reusable Modules** in `docs/index.md`, with links to feature docs.  
Shared failure modes go in `docs/troubleshooting.md`.

### Plan lifecycle

- `docs/plan.md` holds **active** work only.
- When done, **move** to `docs/archive/plan_<version>_<topic>.md`.
- Format: follow the project's plan template (from bootstrap).

### Read restrictions

- `docs/archive/` — only when explicitly requested
- `docs/plan.md` — during planning / implementation of that plan
- Build artifacts and node_modules — never (see §0)

---

## 4. Code Structure

### 4.1 File size

| Type | Rule |
|------|------|
| `.js`, `.ts`, etc. | Split by feature. **No file over 300 lines.** |
| `.html` | Single-file allowed |

If a file exceeds (or would exceed) 300 lines: split and update `docs/index.md` + feature docs in the **same task**.

### 4.2 Split rules

- Move **whole** functions, methods, or cohesive groups — never bisect a file at an arbitrary line.
- Never leave a half-written function or class in either file.
- If one function alone exceeds 300 lines: break it into smaller **complete** functions first, then move those units into modules.
- Update imports and docs in the same task.

### 4.3 Modularity

- Separate `api/` / `core/` / `ui/` / `state/` / `styles/`
- Do not mix unrelated features in one file
- Naming: `docs/architecture/naming_convention.md`
- **Filter registry pattern**: each filter is one self-contained file; adding/removing a filter touches only that file + one registry import line. No changes to `FilterPanel.js` or `partyGenerator.js`.

### 4.4 Scope

- No drive-by refactors or formatting outside the request
- No new packages without checking `package.json` and asking first

---

## 5. Workflow

```
Navigate → Plan → Approval → Implement → Sync docs
```

| Step | Action |
|------|--------|
| Navigate | Read `docs/index.md` + relevant feature doc only |
| Plan | Write `docs/plan.md`: paths, line ranges, snippets, trade-offs (option A/B + one-line reason), split plan if any file would exceed 300 lines |
| Approval | Wait for **explicit** approval (`승인`, `진행해`, `OK`, or clear equivalent). **Do not write code until approved.** Silence or questions alone are **not** approval |
| Implement | Edit approved scope only. Check off `docs/plan.md`. Split if over 300 lines |
| Sync | Update `docs/index.md`, `docs/features/*`, and `troubleshooting.md` when needed — **same task**, no slash command |

### Plan gate

**All code edits require an approved `docs/plan.md`.**  
No exceptions unless the architect explicitly says to skip the plan in the same message.

---

## 6. Communication & Failures

- Architect chat: **Korean**
- Ambiguous request → **ask**; do not guess
- Same error after **3** fix attempts → **stop**, log in `docs/troubleshooting.md`, wait
- Record significant errors and fixes in `docs/troubleshooting.md`

---

## 7. Security & Commits

- No hardcoded secrets — env vars + `.env.example`
- **Commit only when the architect asks.** Message: `agent: [step name]`

---

## 8. Quick Links

| Feature | Doc | Main code |
|---------|-----|-----------|
| API Client | [docs/features/api-client.md](docs/features/api-client.md) | `src/api/pokeApiClient.js` |
| Dataset | [docs/features/dataset.md](docs/features/dataset.md) | `src/api/dataset.js` |
| Filters | [docs/features/filters.md](docs/features/filters.md) | `src/core/filters/registry.js` |
| Party Generator | [docs/features/party-generator.md](docs/features/party-generator.md) | `src/core/partyGenerator.js` |
| Type Balance | [docs/features/type-balance.md](docs/features/type-balance.md) | `src/core/typeBalance.js` |
| Pin Manager | [docs/features/pin-manager.md](docs/features/pin-manager.md) | `src/core/pinManager.js` |
| UI Components | [docs/features/ui-components.md](docs/features/ui-components.md) | `src/ui/components/` |
| State Store | [docs/features/state-store.md](docs/features/state-store.md) | `src/state/store.js` |

Full map: [`docs/index.md`](docs/index.md)
