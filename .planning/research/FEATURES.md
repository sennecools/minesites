# Feature Landscape

**Domain:** Minecraft server website builder
**Researched:** 2026-05-07
**Confidence:** MEDIUM-HIGH (based on direct inspection of live server websites, community templates, and competitor platform documentation)

---

## Table Stakes

Features that Minecraft players and server owners expect. A website missing these reads as unprofessional or incomplete — visitors bounce or distrust the server.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Hero section with server IP | First thing a visitor needs — how do I join? Prominent display and one-click copy is the standard | Low | IP copy-to-clipboard is expected; "click to copy" with toast feedback |
| Live player count | Players assess server health before committing time to join. Dead-looking servers lose signups | Low | Poll via `api.mcsrvstat.us` or similar; cached server-side. Already in scope per PROJECT.md |
| "Join Now" / Play CTA button | Hero needs a clear action. Minecraft-convention is a styled button that links to join instructions or copies the IP | Low | Often styled as a Minecraft-esque button (pixel font, block aesthetic) |
| Server version + edition badge | Players can only join if the version matches. Mismatch = wasted click | Low | Java / Bedrock / CrossPlay + version string (e.g. "1.21.x") |
| Game modes section | Players self-select by game mode (Survival, SkyBlock, Factions, PvP, etc.). No mode info = visitors leave | Medium | Card-based showcase with name, description, and image per mode |
| Voting links section | Voting is currency in the Minecraft ecosystem — servers depend on server list rankings, players expect to vote for rewards. Nearly every serious server website has a /vote page | Low | List of voting site links with "Click to Vote" buttons; optionally a top voters leaderboard |
| Discord link / banner | Discord is the de facto Minecraft server communication layer. Players expect to find the link prominently | Low | Can be a CTA banner section or nav link; Discord member count widget is a bonus |
| Server rules page / section | Sets expectations, establishes trust, and is required for most server list submissions. Players check this to assess fairness | Low | Simple styled list or accordion; not a wall of unformatted text |
| Distinct gaming visual identity | Visitors who land on a dashboard-styled page don't feel like they arrived at a gaming server — they feel like they're in the wrong place. Dark backgrounds, bold typography, and vivid accents are required for credibility | Low (theme system) | This is MineSites' core stated problem — dashboard-look bleeds into server pages |

---

## Differentiators

Features that are uncommon, create competitive advantage, or meaningfully increase conversion. Not expected, but valued when present.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Game mode cards with screenshots / art | Servers with polished visuals for each game mode look significantly more professional and attract more players. Most servers use text-only descriptions | Medium | Image upload per game mode card; owner-supplied art |
| Live server status indicator | "Online" / "Offline" pill visible in the hero or nav. Gives immediate confidence that the server is running | Low | Piggyback on the same API poll as player count |
| Staff/team section | Builds trust and human connection. Players want to know moderation is active. A named, faced team signals a serious server | Medium | Card per staff member: username, role, Minecraft skin head avatar |
| News / announcements section | Shows the server is actively maintained. Servers with visible update cadences retain players better and look alive | Medium | Simple card-based feed: title, date, summary, optional image. Not a full CMS |
| Top voters leaderboard | Gamifies voting behavior — players compete for the top spot. Common on mid-to-large servers. Drives repeat visits to the vote page | Medium | Requires either a plugin integration or manual data entry; defer plugin integration to v2, allow manual list for v1 |
| Season / wipe countdown timer | Common in Factions, Prison, and Reset-based servers. Creates urgency and return visits | Low | Countdown to a server owner-set date |
| Feature highlights strip | A horizontal row of icon + label highlights (e.g. "Custom Economy", "Anti-Cheat", "Weekly Events"). Quickly communicates unique selling points | Low | Simple icon + text component; owner-supplied icons or from a preset icon library |
| Custom color theme per section | Servers want each section to feel distinct, not one flat theme. Per-section color overrides make pages feel designed, not templated | Medium | Already in PROJECT.md scope; this differentiates from static HTML templates |
| Visual effects (particles, parallax) | Gaming aesthetic hallmark. Hero sections with particle effects or parallax scrolling feel premium. Strong conversion signal for players evaluating server quality | Medium | Gated to paid tier per PROJECT.md |
| Map section (live world map) | Some servers run Dynmap or Bluemap for a live overhead view. Linking or embedding this is highly valued on survival/SMP-type servers | High | Complex iframe/embed; defer to v2. Link-out is sufficient for v1 |

---

## Anti-Features

Things that look beneficial but hurt conversion, add complexity disproportionate to value, or belong to a different product category.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Forums / community boards | Forum software is a product in itself (moderation, spam, threading, notifications). Players use Discord; forums are a ghost town on all but the largest servers | Link to Discord. The Discord banner section handles community adequately |
| In-site store (ecommerce) | Tebex/Buycraft is the established standard for Minecraft server monetization. Building a competing store adds payment processing, tax compliance, fraud handling, and delivery integrations | Add a "Store" section with a styled CTA button linking out to their Tebex store URL |
| Player stats / leaderboards synced from game | Requires a server-side plugin, database sync, and maintenance. High complexity, low reliability | Explicitly out of scope per PROJECT.md. Manual stat display (owner-entered text) is sufficient |
| Ban appeal / ticket system | Support tooling is a separate product category (LeaderOS, NamelessMC both offer this as a dedicated module). Not a page builder concern | Link to their Discord or external form (Google Forms, etc.) |
| Blog / news CMS | Full CMS with drafts, editors, authors, and taxonomies is disproportionate. News on server sites is infrequent and simple | A simple announcements section with title + date + text (owner-manages inline in the editor) covers 95% of use cases |
| Registration / login for players | Player accounts on the website ≠ player accounts in-game without plugin integration. Without sync it is meaningless friction | Not applicable for v1. Servers should direct players to Discord or in-game registration |
| Interactive live chat widget | Adds third-party JS dependency, privacy surface area, and is unmanned by most small server owners | Discord invite covers this use case |
| Whitelist application forms | Complex custom form builder is a product on its own; low percentage of servers use whitelist | Link to a Discord channel or Google Form |
| SEO settings panel | Most server owners don't know what a meta description is. Premature complexity for v1 | Sensible defaults (server name as title, description as meta) with no exposed controls in v1 |
| Analytics dashboard | Out of scope for the website builder itself. If needed, server owners can add a tracking script manually | Not applicable for v1 |

---

## Feature Dependencies

```
Live player count → Server IP must be stored (server info section prerequisite)
Voting links → Voting site URLs (owner-supplied, no API)
Staff section → Skin avatar rendering → Minecraft skin API by username (api.minetools.eu or crafatar.com)
Game modes section → Image upload (already supported per PROJECT.md)
News section → No dependencies (pure content)
Discord banner → Discord invite URL (owner-supplied)
Store CTA → Tebex/external URL (owner-supplied)
Visual effects (particles/parallax) → Theme system must exist first → Paid tier gate
```

---

## Section Type Recommendations for v1 (7-10 Sections)

Based on what is table stakes and what has the highest conversion impact, these 7 section types cover the core use case with room for one or two differentiators:

**Core 7 (all free tier):**
1. **Hero** — Server name, tagline, IP with copy, player count, edition badge, primary CTA. The only section every website needs.
2. **Server Info** — IP, version, edition, game mode summary, status indicator.
3. **Game Modes** — Card grid showcasing each mode: name, image, description. Owner adds one card per mode.
4. **Features Strip** — Icon + label highlights row. Fast to fill, high visual impact.
5. **Voting** — List of voting site links with buttons. No integration needed — just URLs.
6. **Discord CTA** — Styled banner section: server name, member count (manual or embedded), invite button.
7. **Text / Rules** — Freeform text section. Serves as rules, about page content, or anything narrative.

**Paid-tier unlocks (or v1 stretch):**
8. **Staff** — Team member cards with skin avatar, username, and role.
9. **News / Announcements** — Card feed of updates. Title, date, short description.
10. **Custom CTA / Countdown** — Generic call-to-action or season countdown timer.

---

## MVP Recommendation

For the initial release, prioritize sections 1-7 above. These cover every table-stakes use case. Staff and News are differentiators worth adding in the same milestone if complexity allows, since they directly increase page credibility. Everything in Anti-Features should be explicitly deferred or declined.

**Defer:**
- Map / Dynmap embed — too complex, too niche
- Top voters leaderboard — requires data source not yet available
- Any form builder capability
- Any player-data integration

---

## Sources

- MinePeak.org homepage (direct observation): navigation, news, game modes, player count, Discord section
- PikaNetwork vote page (direct observation): voting link list, top voters leaderboard structure
- MCServer Web Template (FQQD/GitHub): IP cards, team cards, Discord embed, copy button
- Minesite.org competitor (direct observation): forums, custom pages, store, Discord integration, forms
- LeaderOS competitor: 30+ modules, store, forum, tickets, Discord sync
- NamelessMC competitor: open-source, forums, member profiles, plugin integration
- MinePeak/cybrancee growth guide: IP + features + join instructions + Discord as the core set
- Minecraft.buzz server listing (direct observation): player count, version, game mode, status, description
- Tebex.io: de facto standard for Minecraft server monetization; do not replicate
- SpigotMC community threads: template features, staff page conventions
- General UX conversion research: simplicity converts; anti-features validated against friction patterns
