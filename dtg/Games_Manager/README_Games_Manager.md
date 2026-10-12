# Games Manager

> **License:** Proprietary — source shared exclusively with the venue operator. Not open source. See [License](#license) for details.

Games Manager is a macOS and iPadOS staff scheduling and floor management application for venue operations. A separate App Store version is in active development alongside the internal build.

---

## Current Status

| | Status |
|---|---|
| macOS app | Live — in active daily use |
| iPadOS app | Live — iPad is primary on-floor test device |
| iPhone app | In progress |
| TestFlight | Live — internal and external tester groups active |
| Beta App Review | Passed (external tester bar) |
| Apple Developer Program | Active |
| App Store release | In progress |

---

## Tech Stack

- **Language:** Swift
- **Framework:** SwiftUI (macOS + iPadOS)
- **Storage:** JSON files — human-readable, editable outside the app
- **PDF:** PDFKit (native)
- **IDE:** VS Code + Xcode
- **No third-party libraries** — no SwiftData, no CoreData, no external dependencies
- **Sandboxed** — all data lives in the app container; templates seeded from bundle on first launch

---

## Sections

### Schedule

Weekly schedule grid. Rows divided by department, editable shift time cells per employee per day, game-of-the-night row per column. Generates from employee availability and time-off data. Saves to JSON per week start date. Exports HTML and publishes directly to a GitHub Pages site (DEV_FEATURES only). Full print support via system print dialog.

---

### Calendar

Monthly calendar grid with week-row navigation into the weekly schedule view. Supports special date marking (early opens, notes) with visual indicators. Shared `MonthCalendarGrid` component reused across Calendar, Employees, and Football Field.

---

### Employees

Full CRUD employee management. Employees grouped by department with skill/certification badges, availability toggles (7-day grid), and a per-employee calendar for time-off and shift notes. Edit panel opens inline with a document folder shortcut for employee PDFs.

---

### Documents

PDF template viewer and employee document manager. Templates bundled with the app and seeded to the container on first launch. Folder icon in the employee panel creates dated copies of templates per employee. PDFKit renders and supports fillable forms. OCR auto-fill (DocumentLogic.swift) is planned — will map Vision framework field detection to employee data.

---

### Football Field

The gaming pit — referred to on the floor as "the football field." Visual drag-and-drop pit layout editor with snap-to-grid placement, per-table image import, and rotation-based dealer assignment.

Two separate logic engines power the floor view:

**FFLogic — the roster builder.** Runs once on Generate. Takes the pool of available dealers and active tables, assigns dealers based on certifications, groups them into rotations, and produces a static board snapshot. Has no concept of time.

**BSLogic — the live floor tracker.** Runs continuously once the board is locked. Uses an anchor (who was on break + when) and the real clock to track who is on break now, when each dealer's next break is, and whether a proposed swap would violate the 1-hour rule. Never generates — only tracks and validates the board FFLogic (or the manager) set up.

**The short version: FFLogic builds the board. BSLogic runs the shift.**

---

### Settings

Data import controls, appearance options, collapsible section groups. GitHub Publish configuration (DEV_FEATURES only). Import Source folder flow for bulk seeding all app data from a folder (used for dev setup and App Review seeding).

---

## Architecture

- Main window 1200×800, top navigation bar switching between sections
- `EmployeeStore` injected app-wide via `@EnvironmentObject`
- All persistent data as JSON in the app container (`Application Support/Games Manager/`)
- DEV_FEATURES Swift Active Compilation Condition — debug/venue-specific code compiled out entirely in Release builds

**Files with full DEV_FEATURES wrap (excluded in Release):**
- `GitHubPublisher.swift` — GitHub Pages publish pipeline
- `ScheduleEncryptor.swift` — AES-GCM-256 schedule encryption
- `Keychain.swift` — GitHub PAT storage
- `ExportedWeeksStore.swift` — published weeks tracking

---

## Distribution

**Bundle ID:** `com.pyrothiefprojects.Games-Manager`

**Pushing a build to TestFlight:**
1. Xcode → scheme set to "Any iOS Device" → Product → Archive
2. Distribute App → App Store Connect → Upload
3. Wait 5–30 min for processing
4. Build appears automatically for all tester groups — no re-invitation needed

**App Store version:** Release build (DEV_FEATURES stripped). Generic rebrand — no venue-specific terminology. Category: Business. Demo data seeded from bundle on first launch for App Review.

---

## License

Games Manager is **not open source.**

All software, source code, assets, and tooling in this project are the exclusive property of Pyrothiefprojects.

**Source-exclusive arrangement:** The full source code is shared privately with the venue operator under a direct agreement. This gives the operator full visibility into what the app does with their data, the ability to verify there is no data collection or transmission, and continuity of access to the codebase independent of the developer relationship.

This sharing arrangement does not constitute a transfer of ownership or a license to redistribute, modify, or reuse the source for any other purpose. All rights remain with Pyrothiefprojects.

The App Store version of this app is a separate, generic build distributed under standard Apple App Store terms.

---

## Key Decisions

- Swift / SwiftUI for macOS-native feel with VS Code + Claude Code workflow
- JSON over CoreData or SwiftData — human-readable, portable, editable outside the app
- Local only — no network connectivity in the production build
- Sandboxed — data never leaves the device
- DEV_FEATURES flag over separate targets — single codebase, one build switch strips all dev/venue-specific code
