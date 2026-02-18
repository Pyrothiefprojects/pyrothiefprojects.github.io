# Project Nova

> **License:** This project is proprietary. All rights reserved by Pyrothiefprojects. Individual components may carry their own license terms — see [LICENSE](LICENSE) for details.

Project Nova is the full scope of this project — a multi-genre game framework built from custom engines, each powering a Nova Universe title and serving as a reusable dev kit. It comprises four interconnected games and a shared hub world (Club Nova), all set in the Nova Universe. Development builds will be available on the website, with a planned Steam release.

All game and engine names below are developmental titles and subject to change.

## Engines

- **Parallax** — Point-and-click engine (JavaScript, browser-based)
- **Redshift** — Ship systems roguelike engine (Java)
- **Club Nova Engine** *(planned)* — Hub world and future titles (C, compiles to native + Wasm)

---

## The Games

### Ship Systems Roguelike

**Tone:** Dark theme, little dialogue, simple storytelling

A system-heavy ship combat simulator set in the Nova Universe. The crew can only observe the asteroid via long-range sensors — they never physically interact with it. A small number of cutscenes reinforce key story beats.

The story follows a spaceship crew who discover the asteroid. The asteroid causes a nearby star to go nova, consuming the blast to fuel its massive engine. The crew is pulled into unknown space with it. They must traverse unfamiliar surroundings and keep pace with the asteroid for any hope of returning home.

Players receive items that can be redeemed for rewards in Club Nova.

### Point-and-Click Adventure

**Tone:** Neutral with dark undertones, no dialogue

Takes place directly in a web browser and explores the asteroid's structure and purpose in depth. There is no dialogue or personal interaction — only environmental descriptions.

It introduces Isomarks as a symbolic language derived from ideograms. Players gradually learn to recognize this language, allowing it to function as cross-game symbolism and hidden details in the other titles.

The game tells five or six connected stories serving as a prequel to the universe. Each story focuses on a different system within the asteroid — the first covering the cryo system. As stories are completed, players learn how the language functions, what the structure does, and their role within that process.

The conclusion leads into the events of the Ship Systems Roguelike.

### Squadron Dogfighter

**Tone:** Witty and fun, dialogue-heavy

A squadron-based dogfighting game set around the fighters stationed on the asteroid. You play as a pilot working with your team to defend it and execute missions.

Progression is linear, with ship system upgrades that emphasize tactical depth and system management.

More lighthearted in tone, with room for sarcasm and strong character personalities (potentially stylized, such as animal-based characters).

### Survival Exploration

**Tone:** Very dark, highly explorative, dialogue-heavy

A survival-focused exploration game where the full Nova Universe converges, incorporating systems, factions, and consequences from the other titles.

This entry heavily integrates elements from all previous games. It may follow either a team or a solo character. This is intended to be the final game developed.

---

## Club Nova

The hub world connecting all four games. Accessible at any time, Club Nova is where players can:

- Access and launch all games
- Turn in rewards (dance moves, mission easter eggs)
- Interact with characters from across the universe
- Spend credits earned in the Ship Systems Roguelike (cosmetics, social features, etc.)

Club Nova is an evolving social space that reflects player progression across all four games.

---

## Inspirations

- **RimWorld** — Wealth systems and character development
- **Neo Scavenger** — Explorative survival and crafting presentation
- **FTL: Faster Than Light** — Pacing and risk/reward structure
- **Star Fox / Wing Commander** — Squadron-driven space combat

---

## Cross-Game Elements

To preserve continuity, all games share a unified presentation approach:

- **Storytelling:** Overlaid panel for encounter-driven narrative
- **HUD:** Consistent design language across titles
- **Geometry:** Hexagons used throughout UI, maps, and layouts
- **Symbols:** Shared iconography where narratively appropriate
- **Font:** Orbitron (Google Fonts) — used across all Nova UI and the website, with `letter-spacing: 0.15em` for readability

## Shared Systems

- Isomarks / wealth
- The asteroid (seen from different perspectives per game)
- Technology
- Enemies
- Friendlies
- Art theme
- UI theme
- Club Nova rewards

---

## Development Plan

### Architecture

- **Club Nova (C)** — Central hub, native-first, browser-capable via Wasm
- **Redshift (Java)** — Packaged standalone with bundled JRE via jpackage, no dependencies for the user
- **Parallax (JavaScript)** — Runs in browser only
- **Squadron Dogfighter (C)** — Built on Club Nova's shared foundation
- **Survival Exploration (C)** — Built on Club Nova's shared foundation

**Desktop:** Club Nova is the main process and launcher. C-based games (Squadron Dogfighter, Survival Exploration) run natively alongside it. Redshift (Java) is launched as a separate process via IPC. Parallax (JS) runs in an embedded browser view or links out to the web version.

**Browser (pyrothief.ca):** The website hosts Parallax as the only fully playable browser title. Club Nova can optionally be compiled to Wasm and embedded on the site for hub features (rewards, social, content browsing), but this is not required — the website functions independently. The other three games are desktop-only and not playable in the browser.

### Build Order

1. **Parallax** (JavaScript) — in progress
2. **Redshift** (Java) — in progress
3. **Squadron Dogfighter** (C)
4. **Survival Exploration** (C)

**Club Nova** (C) — the hub, next to begin development as the launcher/orchestrator
