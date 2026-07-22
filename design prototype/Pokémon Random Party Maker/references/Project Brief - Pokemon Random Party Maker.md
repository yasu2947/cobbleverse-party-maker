# Pokémon Random Party Maker — Project Brief

Handoff summary of everything requested for this design, for any agent/developer picking up the project.

## Overview
A modern, single-page web app that randomly generates a 6-member "Pokémon" party from a mock Pokédex, with filters and pinning. This is a **visual design pass with fully mocked/dummy data** — no real API wiring, and all creature names are **invented placeholder species**, not real Pokémon (only the region names and type-matchup mechanics are drawn from the real Pokémon franchise, purely as reference/flavor).

## Visual style
- Modern, clean, minimal; card-based layout, soft shadows, generously rounded corners.
- Dark mode is the default/primary look: deep charcoal background, vibrant per-type accent colors. Light mode also supported via a toggle.
- Typography: Manrope (single family, multiple weights) for strong heading/body hierarchy.
- Subtle hover/active micro-interactions on cards and buttons; no gratuitous animation.
- All UI copy is in Korean.

## Color system
- Accent colors derived from the 18 classic Pokémon types (fire = orange/red, water = blue, grass = green, etc.), defined in OKLCH, used for type badges, highlights, and mega/pin indicators.
- Base UI (backgrounds, panels, text) stays neutral dark so type colors pop.

## Layout & components

### Top bar
Logo/app name on the left, light/dark mode toggle on the right.

### Left sidebar — Filters
- **Mega exclusion toggles**: three independent toggle chips — Standard Mega / Z-Mega / Legendary Mega — all **on (included) by default**; clicking a chip **excludes** that mega category from the whole generation pool (shown with strike-through + dimmed style), rather than being a single-select "pick one" control.
- **Region exclusion chips**: real Pokémon regions (Kanto/Johto/Hoenn/Sinnoh/Unova/Kalos/Alola/Galar/Paldea, shown in Korean) as chips, same on-by-default / click-to-exclude pattern, used to exclude legendaries by region.
- **Include unevolved forms** / **Include fully-evolved forms**: two independent toggle switches.
- **"파티 랜덤 돌리기" (Randomize Party) button**: sits near the top of the "Pin a Pokémon" search block (moved up from the sidebar bottom).
- **Pin a Pokémon search**: a read-only-looking input that opens a **search modal** on focus/click — modal has a text search field, two type-filter dropdowns (Type 1 / Type 2, order-independent), and a grid of matching mock Pokémon; clicking a result registers/pins it. Selected pins show as removable chips below the input.

### Main content — Party
- Party starts as **6 empty slots**, each showing a dashed "+" placeholder ("Slot N — click to choose a Pokémon"), so the tool supports both a fully **random** party and a manually **fixed/curated** party.
- Clicking an empty slot (or an existing card) opens the same search modal, targeted at that specific slot.
- Slots are **drag-and-drop reorderable**, with a smooth opacity/scale transition while dragging.
- Each filled card shows: sprite placeholder, name, 1–2 type badges (pill-shaped, colored per type, Korean type names), a Mega/Mega-Z badge overlay when applicable, a **pin button** (bottom-right of the sprite) to lock the slot from being overwritten by randomize, and a subtle **✕ remove button** (top-right, no background, just an icon) to clear the slot back to empty.
- Pinned cards get a distinct glowing border treatment.
- Randomizing keeps pinned slots and only refills unpinned ones (respecting all sidebar filters).

### Defense Matchup panel
Redesigned (after iteration) to match the "poketata.com" team-analysis style rather than a generic bar chart:
- A **weakness list**: types the party is weak to, each row = type badge + horizontal severity bar + multiplier label (plain decimal, e.g. "2", "4", not fraction symbols), sorted worst-first, with a "show N more" expand control.
- A **resistances & immunities** row of chips below, each with its multiplier (e.g. "0.5", "0.25", "0").
- Positioned to the right of the party grid (three-column layout: party | defense matchup | acquisition info), sized generously per feedback (matchup column doubled in width during iteration).

### Acquisition Info panel
A mocked "where to get this Pokémon" table, styled after a Minecraft Pokémon-mod spawn guide (Cobbleverse-style), positioned to the right of the Defense Matchup panel. For each of the 6 party members it shows:
- English name
- Spawn location (biome, in Korean, themed to the mon's type)
- Rarity: 흔함 (Common) / 흔치않음 (Uncommon) / 희귀함 (Rare) / 매우희귀함 (Very Rare)
- Condition (Minecraft-style spawn condition: weather, time of day, fishing, cave depth, etc.)
- Form notes — **Mega-evolved party members show the location of their pre-Mega base form**, with a note that the displayed entity is a Mega evolution.

## Data / content notes
- All species are invented placeholder creatures (e.g. "Blazehound", "Tidalfin") with plausible type combinations — deliberately not real Pokémon names, per the "use dummy/placeholder data" instruction.
- Region names, the 18-type system, and type-effectiveness math are the only elements drawn directly from the real Pokémon games.
- Sprite art is a striped placeholder box labeled "스프라이트 자리" (sprite slot) — real art/sprites are expected to be dropped in later.

## Build notes
Built as a Design Component (single streaming HTML file) with the individual party card factored out as a small reusable child component. A standalone, fully offline-capable HTML export was also produced separately (with the child component inlined, since offline export can't fetch sibling files at runtime).

## Reference materials (in this folder) and why each was used
1. **pokemondb.net/type** — the canonical Pokémon type-effectiveness chart. Used to build the accurate 18×18 attack/defense multiplier table that powers the Defense Matchup panel's weakness/resistance math.
2. **poketata.com/ko/type-coverage** (screenshots 03–05) — reference for the "Team Analysis" UI pattern: a card labeled "방어 매치업" (Defense Matchup) with horizontal weakness bars + multiplier tags, plus a separate "내성 & 무효" (Resistances & Immunities) chip list below. The Defense Matchup panel was redesigned to follow this exact pattern instead of a generic type-balance bar chart.
3. **lumyverse.com — Cobbleverse all-Pokémon-spawn guide** — reference for the format of a Minecraft Pokémon mod's spawn documentation (English name, spawn biome, rarity tier, spawn condition, form notes). Used as the template/format for the mocked Acquisition Info table, adapted with Minecraft terminology and Korean labels.
4. **Screenshots 01–02, 06–10** — the user's own annotated mockups/UI reference and mid-iteration screenshots of the working design, used to refine specific interactions: the search modal layout, region-chip on/off styling, the 2-column party card grid, empty-slot placeholders, and the pin/remove-button positions on each card.
