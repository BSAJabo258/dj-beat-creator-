# BC-16 — The Ultimate Beat-Making Instrument
### Master blueprint: everything mapped, re-layered and specified

> **The goal in one line:** an instrument that looks and feels extravagant — a rack of glowing analog-future studio gear — but works so simply that you can sit down, grab sounds, put them on pads and make a full song without ever reading a manual.

This document is the single map of the whole machine. It covers:

0. **The studio direction: a virtual analog studio floor + full-screen machines**
1. The design rules that every part must follow
2. What exists today (the honest inventory)
3. The new layered architecture
4. **The Pack Bar** — the scrolling pack strip with drag-to-pad and double-tap pad picking
5. The pad model and how sounds move through the machine
6. Every element of music creation, unit by unit
7. Sound logic (what plays, what cuts off)
8. Navigation and the beat-making chain
9. Help, learning and the coach
10. Projects, saving and packs
11. Data model
12. Keyboard and controller map
13. Visual design system
14. Known gaps
15. Build roadmap with acceptance tests

---

## 0. The studio direction (decided): **A + B combined**

The BC-16 is not one screen with many panels. It is **a virtual analog recording studio**: you walk into a room of equipment, walk up to a machine, and that machine fills the screen with everything it needs. Every major MPC function becomes **its own dedicated piece of studio hardware**, and all of them are wired to the same project, sounds and transport.

### 0.1 Three levels
| Level | Name | What you see | How you get there |
|-------|------|--------------|-------------------|
| **1** | **Studio Floor** | The whole studio: every machine drawn as hardware in its place (tape deck and sampler on the left wall, drum machine and keyboard at the centre desk, console in the middle, DJ booth and launch console to the right, song workstation on the big screen). Each machine shows live status: LEDs, the pattern it holds, a mini meter. | **HOME** button (top-left) or Esc from a machine |
| **2** | **Workstation** | One machine, full screen. Its own display is the main workspace; its knobs, keys and faders are laid out around its purpose; its help is about it. | Tap a machine on the floor, the rail, or NEXT ▶ |
| **3** | **Device modes** | The machine's own operating modes as hardware mode keys on its faceplate (e.g. Sampler: CHOP · TRIM · EDIT · STEMS · LIBRARY). Never floating windows. | Mode keys on the machine |

The rail stays as the fast "patch cable" between machines (one tap from any machine to any other), so the Studio Floor is the way in and the overview, never a required stop.

### 0.2 Transition
Tapping a machine on the floor zooms the camera into it (≈ 400 ms, compositor-only) until its faceplate fills the screen; going HOME zooms back out. It should feel like walking up to another piece of equipment. Reduced-motion: a simple cross-fade.

### 0.3 What stays global (and nothing else)
| Global element | Purpose |
|---------------|---------|
| Studio navigation (HOME, rail, ◀ BACK, NEXT ▶) | move between machines |
| Project display | always know which project/song is open |
| Master meters (VU pair) | monitor the output |
| Transport (REC, OVERDUB, STOP, PLAY, START, pattern, NEXT PART) | one transport for the whole studio |
| UNDO | reverse the last operation, from anywhere |
| Save light | know when changes are saved |
| Help / coach | learn the machine you are on |

Everything else belongs to the machine that needs it.

### 0.4 The machines (each a full-screen workstation)
| Floor zone | Model | Machine | Device modes (level 3) | Its own look |
|-----------|-------|---------|------------------------|--------------|
| Source | **TD-1** | Tape Deck | LOAD · RECORD (mic/line) · ANALYSE · RESUME | reel-to-reel: two spinning reels, tape path, counter, VU pair |
| Source | **PF-1 / PS-3** | Pack Factory / Pack Store | ORDER · LIBRARY · STORE | sample-library cabinet: drawers of cartridges |
| Sample | **CS-1** | Sampling Workstation | CHOP · TRIM · EDIT · STEMS · LIBRARY | big green-on-black waveform CRT, jog wheel, chop keys |
| Sample | **SX-1** | Slice Brain | RECIPES · RANKED · CLEAN-UP | analyser rack: spectrum bars, score meters |
| Instruments | **KF-2** | Kit Forge | BUILD · AUTO-FILL · MY KITS | patch-bay rack: slots with cables to the pads |
| Instruments | **PM-16** | Drum Machine | PLAY · PROGRAM · 16 LEVELS · NOTE REPEAT | the MPC: big rubber pads, Q-link knobs, LCD |
| Instruments | **KT-3** | Keyboard Workstation | TIERS · CHORDS · ARP · SCALES · MIDI | three-tier synth stand, wood end cheeks, pitch/mod wheels |
| Instruments | **SQ-8** | Step Sequencer | STEPS · PIANO ROLL · VELOCITY · TIMING · PROBABILITY | analog sequencer: rows of step LEDs and knobs |
| Perform | **LC-8** | Launch Console | CLIPS · SCENES · FOLLOW | grid controller: backlit clip buttons |
| Perform | **DX-2** | DJ / Performance Mixer | DECKS · CUES · ROLLS · FX | two-deck mixer: crossfader, EQ kills, platter |
| Production | **SB-16** | Song Production Workstation | BUILD · STRUCTURE · SMART EDIT · TIMELINE | big-screen arranger with section lights |
| Production | **BB-9** | Beat Brain | PRESETS · WRITE · PACKS | "AI composer" rack: glowing matrix |
| Production | **MX-16** | Mixing Console | CHANNELS · EQ · DYNAMICS · SENDS · MASTER | analog console: long faders, channel strips, meter bridge |
| Finish | **PM-1** | Project Manager | PROJECTS · VERSIONS · EXPORT | studio tape library / archive shelf |

Rule from this table: **the machines belong to one studio but do not look identical.** A sampler looks like a sampler, a console like a console, a tape deck like a tape deck. They share materials (anodized metal, LEDs, type) and the global strips; their faceplates, layouts and character are their own.

### 0.5 Tablets
Same hierarchy (Floor → Workstation → Modes) with touch-first layouts per machine, not the desktop layout shrunk: e.g. the Drum Machine on a tablet in landscape is pads on the right two-thirds, LCD and Q-links on the left third; the Console becomes 8 strips per swipe page.

---

## 0.6 Specification standard (how every requirement is written)
Every feature is specified in four layers. No requirement uses impression words ("seamless", "professional", "MPC feel") without the observable behaviour that defines them.
| Layer | Contains |
|-------|----------|
| **Design intent** | What the user sees and does, in hardware terms (faceplate, mode key, display, pad, fader). |
| **Functional specification** | What every control does, its states, and its result. |
| **Technical architecture** | Which module owns it, which shared services it reads and writes, which events it emits. |
| **Acceptance criteria** | Tests that pass or fail, run in a real browser. |

Terminology: DAW (the whole production environment), sampler, drum machine, step sequencer, mixer, transport, arranger, signal routing, shared project state. The interface emulates analog hardware; the audio engine is digital.

## 0.7 Phase 0 rules (locked)
1. The Studio Floor is the home environment, never a mandatory navigation step (the rail reaches any machine in one tap).
2. Every machine opens into a dedicated, full-screen workstation.
3. Each machine has its own controls, modes, layout and visual identity.
4. Shared services connect all machines; no machine duplicates audio or project state.
5. The Pack Bar is contextual, with the same gestures on every machine.
6. Desktop and tablet each get purpose-designed layouts.
7. Existing working features are preserved and tested.

**Phase 0 acceptance test:** enter the studio → open the Drum Machine → build a beat → open the Sampler → manipulate sounds → open the Song Builder → arrange a song, without losing the project, sounds or workflow. *(Automated: `p0_accept.py`, 13 checks, passing.)*

## 0.8 Loop-tight slicing (built)
**Design intent:** a loaded beat is cut so its patterns loop cleanly: no dead air at the front or end, bar 1 on the first downbeat with sound, every cut on its hit.
**Functional specification:**
| Function | Behaviour |
|----------|-----------|
| Tempo lock | After the tempo guess, a least-squares fit of the strong hits to the beat grid sets the exact beat length and phase (BPM to 2 decimals). |
| Dead ends | Silence before the first sound (−44 dB of the peak) and after the last sound (−50 dB + 40 ms release) is removed from the cuts. |
| Bar 1 | The first downbeat within half a beat of the first sound. Pickups before it are not part of the loop. |
| Loop length | A whole number of bars from bar 1 to the end of the sound. |
| On the hit | Every cut starts at its attack on a zero crossing. In GRID / BEAT / BAR modes a grid cut within 25 ms of a real hit moves onto that hit. |
| LOOP CHECK readout | Tempo, fit (± ms), what was trimmed, loop length in bars, % of cuts on the 1/16 or triplet grid, cuts moved. |
| LOOP-TIGHT key | On by default. Off = cuts exactly as detected. Remembered per device. |
**Architecture:** `js/slicesmart.js` wraps the engine's `grid()` and `rebuild()`; exposes `BC16_LOOP`.
**Acceptance:** demo beat → BPM locked 149.78 with hits within ±18 ms, 0.81 s lead-in removed, 92-bar loop from bar 1; GRID mode → 97 % of cuts on grid, 482 grid cuts moved onto their hits.

## 0.8a Smart start (built): the smartest MPC, not the most functional
**Design intent:** loading a song ends in a playable machine, never in a question.
**Functional specification:** on load the machine locks the tempo, cuts loop-tight, detects the genre (or takes it from the pack), builds the genre drum kit in bank A and exact 1- and 2-bar loops in bank C, switches the pads to the KIT program, and opens the PM-16 drum machine. A strip (beside the pads, never over them) says what it built and why, with one-tap next moves: RECORD A BEAT, WRITE A STARTER BEAT, CHOP THE SONG, BUILD A FULL SONG, CHANGE GENRE. Patterns stay empty; nothing plays until a pad or PLAY is pressed. The old SESSION START menu is retired.
**Acceptance:** demo → drum machine, bank A = KICK, 808, SNARE, CLAP, HAT…; bank C = 12 loops; 0 sounds start without input; WRITE A STARTER BEAT fills P1 and PLAY plays it.

## 0.8c Producer engine: retempo, stretch, flip (built)
**Design intent:** the machine does what a producer does with a sample: put it at the genre's tempo without wrecking its key, chop it on the beat, and turn it into a new phrase over drums.
**Functional specification:**
| Function | Behaviour |
|----------|-----------|
| Time-stretch | WSOLA stretch (2048-sample windows for loops, 1024 for chops, ±12 ms alignment search). Every loop, chain and flip chop follows the project tempo with its key kept. Built ahead of time when the tempo changes. |
| RETEMPO key (PM-16) | STRETCH (key kept) or VARISPEED (turntable: pitch follows tempo, chipmunk soul). Saved with the project. |
| Producer tempo | Each genre has a tempo range (trap 140–160, Detroit 145–165, boom bap 86–96, lo-fi 70–88, house 120–126, amapiano 108–115…). The sample sits on the grid, rides half-time under a double-time grid, or runs double-time, whichever needs the least stretch. E.g. a 100 BPM soul loop under trap → 160 grid, sample plays as 80, 20 % stretch instead of 60 %. |
| FLIP IT | Picks the most melodic, cleanest 2-bar phrase; 8 beat chops moved onto their real attacks; each chop stretched to exactly its slot; re-sequenced in the genre's flip style (trap: repeats and stutters; sample: swung; club: offbeat stabs; afro: syncopated; chill: long holds) over the bank A drums; PHRASE, HALF A, HALF B pads for holds. Bank G holds the chops. |
**Acceptance:** at 120 BPM a 2-bar loop renders exactly 4.000 s with pitch unchanged (zero-crossing rate 1621 → 1576 Hz; varispeed would drop 20 %), in 65 ms; boom bap from a 150 BPM sample → 86 grid, double-time, 15 % stretch; FLIP on the demo → 8 chops from the hook (bar 29), 4-bar pattern, plays.

## 0.8b Genre kits: auto 1-bar and 2-bar loops + genre drum layout (built)
**Design intent:** one press on KF-2 KIT FORGE turns the loaded song (or a Pack Factory track) into a ready kit for the genre: a loops bank and a drum bank.
**Functional specification:**
| Function | Behaviour |
|----------|-----------|
| Bar analysis | Every bar on the locked grid is measured in 16 steps for low (<150 Hz), mid and high (>4 kHz) energy. |
| Sections | Bars are grouped where the sound changes (on 4-bar lines) and named INTRO / VERSE / HOOK / BREAK / OUTRO by energy and position. |
| Loop choice | Each 1-bar and 2-bar candidate is scored on: does the groove repeat in the next bars, a hit on the one, a clean seam, and fit to the genre's weights (trap: low end + hats; sample-based: mids; club: steady kick on every beat; afro: busy percussion). No overlaps, no near-duplicates, spread across sections. |
| Loop cut | Starts on the bar line (zero crossing within 0.5 ms), exactly 1 or 2 bars long, latched, tempo-synced, 1.5 ms fade at both ends. Named by section and bar, e.g. HOOK 2BAR 29. |
| Genre families | Trap / drill / Detroit · Sample-based (boom bap, lo-fi, soul, R&B, gospel, jazz, funk) · Club (house, techno, EDM, dnb, dubstep, Jersey) · Afro / latin / island · Pop / band / cinematic. Each sets loop counts, loop weights and a 16-pad drum layout (trap: KICK, 808, SNARE, CLAP, HAT, HAT 2, OPEN HAT, PERC, KICK 2, 808 2, RIM, PERC 2, STAB, STAB 2, FX, CRASH). |
| AUTO genre | Detected from tempo (with half/double time), kick regularity, hat density and band balance; the reason is shown. |
| Pack types | DRUM BREAK → more 1-bar grooves; LOOPS / KEYS / FLIP → more 2-bar loops + chord stabs; 808 & BASS → 808 and bass slots; VOCAL → vox chops; ATMOSPHERE → FX and pads. |
| Pack Factory PRO PACK | Loads the track and builds the genre kit for that pack's genre and type automatically; both banks saved to MY KITS. |
| Auto kits on load | Bank C (loops) now uses the same exact-loop engine. |
**Acceptance:** demo beat → detected trap (150 BPM); 12 loops, every one exactly 1 or 2 bars long and starting on the bar line (offset < 0.0003 bar); drum bank KICK, 808, SNARE, CLAP, HAT, HAT 2, OPEN HAT, PERC, KICK 2, 808 2, RIM, PERC 2, STAB, STAB 2, FX, CRASH.

## 0.9 Self-update from GitHub (built)
**Design intent:** whoever opens BC-16 runs the newest version.
**Functional specification:** version = content hash of the app's files, written to `version.json` and into the single-file build. On start and every 30 min the app reads `version.json` from the repository's `main` branch. If newer, a SYSTEM · UPDATE key lights on the meter bridge. On the live site (GitHub Pages) a network-first service worker means a reload is always the newest build; UPDATE reloads. From a downloaded file: UPDATE offers OPEN THE LIVE APP or DOWNLOAD THE FILE. The app is installable (web manifest) and works offline from the last good copy.
**Acceptance:** build writes a deterministic version (CI check passes); stale version shows UPDATE; live site reload serves new files.

## 0.10 Smart Routes (next: built with the MX-16 console, Phase 2)
**Design intent:** signal routing is automatic. The producer picks a route preset; nobody wires buses by hand unless they open the routing page.
**Functional specification:** every sound source is auto-assigned to a channel by role (kick, snare/clap, hats/perc, bass/808, chords/keys, lead, vocal/sample, FX). Route presets, one tap each:
| Smart Route | What it sets |
|-------------|--------------|
| **Trap standard** | Drums → DRUM bus (glue comp); 808 → its own bus, sidechained by the kick; melodic → MUSIC bus with reverb send; vocals/samples → VOX bus. |
| **Sample flip** | The chopped sample on one bus with filter + saturation; drums ducked under nothing; bass high-passed under 30 Hz. |
| **Clean / no FX** | All channels straight to master, no sends (for exporting stems). |
| **Live / DJ** | Two deck buses + crossfader; pads to a performance bus with echo/filter throws. |
| **Stems out** | One output per bus, named, for export to another DAW. |
Each preset shows its routing as a patch-bay diagram on the MX-16 display; any connection can be changed by dragging a cable, and the edit is saved with the project.
**Architecture:** a Routing service (graph of sources → channels → buses → master) under the Audio Engine; presets are data; the MX-16 and the export engine read the same graph.
**Acceptance:** loading a kit assigns every pad to the right channel by role; switching preset re-routes with no audible click and no stopped playback; export with "Stems out" produces one file per bus.

## 0.11 Open-source shortlist (to make the engine stronger)
| Library | Use in BC-16 | License | Fit |
|---------|--------------|---------|-----|
| [@audio/beat](https://github.com/audiojs/beat) | Second opinion on onsets / tempo / dynamic-programming beat tracking for the Slice Brain | MIT | Drop-in JS, check against our slicer |
| [web-audio-beat-detector](https://github.com/chrisguttandin/web-audio-beat-detector) | BPM + first-beat offset cross-check at load | MIT | Small, browser-native |
| [Essentia.js](https://github.com/MTG/essentia.js) | Key, chords, onsets, beat tracking (WASM) | **AGPL-3.0** | Strongest analysis, but AGPL obliges publishing source; fine for an open repo, not for a closed paid build |
| [demucs-onnx](https://github.com/StemSplit/demucs-onnx) / HTDemucs ONNX | Real AI stem split (drums/bass/vocals/other) in the browser, replacing the current splitter | MIT | Large model download (hundreds of MB); load on demand in STEMS mode |
| Tone.js | Transport, scheduling, effects for the MX-16 sends | MIT | Optional; engine already schedules |
| Rubber Band (WASM) / SoundTouchJS | Time-stretch so loops fit any tempo | GPL / LGPL | Needed for "fit loop to song tempo" |
| WebMidi.js | Controllers, MIDI clock in/out | Apache-2.0 | Closes the MIDI-clock gap |

## 1. Design rules (the constitution)

Every screen, button and feature is judged against these. If a feature breaks one, it gets redesigned, not shipped.

| # | Rule | What it means in practice |
|---|------|---------------------------|
| 1 | **Pads are the centre of the universe** | Every sound in the machine can reach a pad in two moves or fewer. Every unit either feeds the pads, plays the pads, or arranges what the pads made. |
| 2 | **Nothing plays unless you asked** | Loading a song never writes beats or starts sound. Only a tap, a key, PLAY, or an explicit "write it for me" makes sound. |
| 3 | **One main player at a time** | Transport, song preview, auto-producer playback and library preview are exclusive. Pads and keys you play by hand always play over whatever runs. |
| 4 | **The same button is in the same place everywhere** | Only the global elements in 0.3 are shared (top: project + meters + save; bottom: transport + undo). Everything else belongs to its machine. |
| 4b | **Every machine gets its full working space** | No machine is squeezed into a card. Its display is the main workspace; important controls are never hidden to fit a generic layout. |
| 4c | **Connected operation** | Changing something on one machine updates every machine that depends on it (a re-chop updates pads, Pack Bar, sequencer rows and the song). |
| 5 | **Every action has a way back** | UNDO (50 steps), ◀ BACK (last unit), Esc (back out of anything open), versions (restore a whole project). |
| 6 | **Scroll, don't pop up** | Choices live in scrolling strips and docked panels, not in windows that cover the instrument. Dialogs only for destructive confirmations, drawn as part of the machine. |
| 7 | **Show, then explain** | Hold any control ½ s to learn it. Coach panel explains the next step. Nothing requires leaving the instrument to understand it. |
| 8 | **Smart, never pushy** | AI (Slice Brain, Beat Brain, Pack Factory) suggests and writes only when asked, and everything it does is editable and undoable. |
| 9 | **Extravagant look, quiet surface** | Glow, liquid light and analog texture on frames and LEDs; content areas stay calm and readable. One accent colour per unit, not per button. |
| 10 | **Works the same on a tablet** | Every gesture has a touch version; every hover has a tap version; nothing depends on a right-click or a tiny target. |

---

## 2. What exists today (honest inventory)

### 2.1 Shell
| Part | State |
|------|-------|
| Side rail grouped in 6 stages (SOURCE, SAMPLE, INSTRUMENTS, PERFORM, ARRANGE, FINISH) + GUIDE | ✅ |
| Meter bridge: song display + message line, analog VU, LOAD, SAVE (unsaved light), SHORTCUTS, MASTER, TAKE REC | ✅ |
| Transport bar: REC, OVERDUB, STOP (twice = ALL STOP), PLAY, START, TAP, pattern ◀ ▶ + LCD, P1–P16, COPY ▶, CLEAR, NEXT PART ▶, UNDO, ◀ BACK | ✅ |
| Unit header: ◀ BACK (named), unit name/model, sub-tabs, STEP n OF 10 · NEXT ▶ | ✅ |
| Per-unit zoom (− ⤢ +), focus mode | ✅ |
| **Pack Bar** | ❌ **new — section 4** |

### 2.2 Units (pages)
| Stage | Unit | What it does now |
|-------|------|------------------|
| 01 SOURCE | **Tape Deck TD-1** | Load song / demo, analysis readout, RESUME last project |
| | **Pack Factory PF-1** | AI sample packs, 34 genres × 8 pack types, device library, LOAD & CHOP, PRO PACK |
| | **Pack Store PS-3** | Free starter packs, PRO/STUDIO plans, license keys, premium catalog |
| 02 SAMPLE | **Sampler CS-1** | Waveform, cuts, method/sensitivity/shortest/longest, pads follow cuts |
| | **Slice Brain SX-1** | 7 chop recipes, recommendation, every cut scored (grid/punch/clean), merge cuts, best-of kit |
| | **Lab** (Browser, Stem Splitter, Sound Sorter) | Dig slices, split stems, group similar sounds |
| 03 INSTRUMENTS | **Kit Forge KF-2** | Kit rack (8 banks × 16), cut library pages, auto-fill (MPC layout etc.), suggestions, save kits |
| | **Drum Machine PM-16** | Pads, CHOP/KIT program, pad editor (play/arrange/edit), Q-link knobs, automation switch, pad functions |
| | **Step Sequencer SQ-8** | Grid edit, length, smart beat |
| | **Keys** (Key Tower KT-3, Piano, Layer Rig) | 3 stacked keyboards, scale lock, stack/hold, MIDI in |
| 04 PERFORM | **Launch Console LC-8**, **DJ Mixer DX-2** | 16 clips queued on the loop; cues, loops, rolls, kills, filter |
| 05 ARRANGE | **Song Builder SB-16** | Loop a part → NEXT PART, channels per part, structure templates, smart edit per part, arrangement view |
| | Song Arranger, Auto Producer | Order, exports (WAV/MP3/MIDI/kit zip), auto arrangement |
| | **Beat Brain BB-9** | Presets, variations, write full song, smart packs |
| 06 FINISH | **Project Manager PM-1** | Recent projects, versions, .bc16 files with audio, duplicate |
| — | **Studio Manual** | Narrated 16-chapter course (studio voice), lessons, map, button book |

### 2.3 Engines and systems
- Audio analysis: tempo, key, Camelot, hits, slice kinds (kick/snare/hat/tone), pitch clarity.
- Studio core: 8 banks × 16 pads (KIT program) + CHOP program (128 cuts per page), 16 patterns, song order, choke, note repeat, 16 levels, swing, quantize (TC).
- Automation lanes: filter, pump, swing (write / read / off).
- Sound logic: one main player, page cleanup, ALL STOP.
- Persistence: autosave per song, versions (IndexedDB), songs kept on device, .bc16 project files.
- Help: hold-to-learn, explain mode, coach panel, narrated course (recorded voice), shortcuts card.

---

## 3. The new layered architecture

The machine is re-layered so each layer has one job and talks only to the layer below through a clear interface. This is what makes "everything connected" stay true as features grow.

### 3.0 The studio as modules
Every machine is an **independent module** with a defined interface to shared studio services. Improving the Drum Machine can never break the Mixer, because neither reaches into the other: they only talk to the services.

```
BC-16 STUDIO
├── STUDIO ENVIRONMENT
│   ├── Studio Floor (home) + hardware navigation (rail, BACK, NEXT)
│   ├── Global transport
│   ├── Master monitoring (VU, peak, ALL STOP)
│   └── Project display + save light
├── SOURCE EQUIPMENT ........ TD-1 Tape Deck · PF-1 Pack Factory · PS-3 Pack Store
├── SAMPLE EQUIPMENT ........ CS-1 Sampler · SX-1 Slice Brain · LAB Workstation
├── INSTRUMENT EQUIPMENT .... KF-2 Kit Forge · PM-16 Drum Machine · SQ-8 Sequencer · KT-3 Keyboard
├── PERFORMANCE EQUIPMENT ... LC-8 Launch Console · DX-2 DJ Mixer
├── PRODUCTION EQUIPMENT .... SB-16 Song Builder · BB-9 Beat Brain · MX-16 Mixing Console
└── STUDIO SERVICES (shared, no UI of their own)
    ├── Audio Engine      decode · analyse · slice · voices · buses · render
    ├── Sound Library     Sound/Pack objects, search, favourites (feeds every Pack Bar)
    ├── Event System      sound.played · pad.assigned · pattern.changed · transport.* …
    ├── Project Database  songs, state, versions, autosave, .bc16
    ├── Automation        lanes, write/read, playback, export
    └── Export Engine     WAV · MP3 · stems · MIDI · kits · packs, render check
```

**Module contract** (every machine implements the same five things):
| Member | Meaning |
|--------|---------|
| `mount(stage)` / `unmount()` | build/tear down its full-screen workspace; unmount stops its own sounds |
| `modes` | its level-3 mode keys |
| `library` | how its Pack Bar context filters and where drops land |
| `help` | its coach steps, tips, lesson and narration ids |
| `subscribe(events)` | what it listens for (and nothing else) |

**Migration from today:** the existing units already sit on one shared engine and state (engine.js, studio.js) with a shell (os.js). The move is to (1) carve os.js into one file per machine with the contract above, (2) put the services behind the event system instead of polling, (3) add the Studio Floor and the MX-16 console.

```
┌──────────────────────────────────────────────────────────────────────┐
│ L7  CONTENT      Packs · Library · Store · Factory · My Kits · Takes │
├──────────────────────────────────────────────────────────────────────┤
│ L6  PROJECT      Song audio · state · versions · .bc16 · autosave    │
├──────────────────────────────────────────────────────────────────────┤
│ L5  HELP         Hold-to-learn · Coach · Explain · Course · Shortcuts│
├──────────────────────────────────────────────────────────────────────┤
│ L4  UNITS        Tape Deck · Sampler · Kit Forge · Drum Machine …    │
├──────────────────────────────────────────────────────────────────────┤
│ L3  SHELL        Rail · Meter bridge · PACK BAR · Transport bar      │
├──────────────────────────────────────────────────────────────────────┤
│ L2  SOUND LOGIC  Focus · choke · mutes · buses · ALL STOP · meters   │
├──────────────────────────────────────────────────────────────────────┤
│ L1  STUDIO CORE  Pads · banks · patterns · song · transport · auto   │
├──────────────────────────────────────────────────────────────────────┤
│ L0  AUDIO ENGINE Decode · analyse · slice · voices · render/export   │
└──────────────────────────────────────────────────────────────────────┘
```

### 3.1 The one source of truth: the **Sound** object
Today a "sound" is several different things (a slice, a kit pad, a library track, a chain, a take). The re-layering gives everything one shape so the Pack Bar, pads, keys and sequencer all speak the same language:

```js
Sound = {
  id,                 // stable id
  src,                // which audio buffer (song, take, library item, pack file)
  segs: [[start,end]],// one or more regions (chains = several)
  name, role,         // "KICK 3", role: kick|snare|clap|hat|open|perc|808|bass|keys|chord|stab|loop|vocal|fx
  root,               // detected note (MIDI) or null
  key, bpm,           // where it came from
  tags: [genre, character, source],
  score,              // Slice Brain quality 0–1
  color               // role colour
}
Pad   = { sound: Sound|null, play: one|gate|loop|latch|cue, tune, fine, vol, pan,
          start, end, reverse, choke, attack, decay, filter, send:{bus}, layers:[Sound] }
Pack  = { id, name, kind: cuts|smart|mine|library|store|takes|favorites,
          genre, sounds:[Sound], cover, locked:false|'pro'|'studio' }
```

### 3.2 The event bus
Every unit announces what happened (`sound.played`, `pad.assigned`, `pattern.changed`, `transport.started`, `pack.opened`) and listens for what it needs. The coach, Pack Bar, meters and autosave all subscribe instead of polling.

---

## 4. THE PACK BAR (new centrepiece)

> Instead of windows, a **scrolling strip of packs** you flick through, open, audition and pull straight onto pads. Or you select a pad first and the bar shows you sounds for it.

### 4.0 Decision: one shared library, a contextual bar in every machine
The Pack Bar is **one shared sound library** with **one gesture language**, but it does **not** permanently take screen space from every machine. It lives in each machine as that machine's own library drawer:

| State | Size | When |
|-------|------|------|
| **Closed** | a 28 px "cartridge slot" strip: the 5 pinned/recent packs as small tabs + the handle | default on every machine |
| **Open** | the full scrolling bar (packs row + sounds row) slides out from the machine's top edge, over the machine's own non-essential area, never covering pads or the main display's playhead | tap the slot, swipe down, **Shift+P**, or automatically when you **double-tap a pad** |
| **Pinned** | stays open while you work on this machine | pin icon; remembered per machine |

Same library, different context — what the bar shows first depends on the machine:

| Machine | The bar becomes | Shows first | Drop targets |
|---------|-----------------|-------------|--------------|
| PM-16 Drum Machine | **pad-loading library** | sounds matching the selected pad's role | pads, bank keys |
| KF-2 Kit Forge | **kit builder library** | role-matched suggestions for the lit slot | slots, bank keys |
| CS-1 Sampler | **sample & slice library** | CUTS pages, takes, stems | sampler (load as new source), pads |
| KT-3 Keyboard | **instrument & preset browser** | tonal sounds in key, saved key presets | keyboard tiers |
| SQ-8 Sequencer | **sound assignment panel** | the pattern's channels + replacements of the same role | sequencer rows (swap a row's sound) |
| SB-16 Song Workstation | **part & loop library** | loops, phrases, patterns, transitions | parts, channel rows |
| LC-8 / DX-2 | **performance library** | loops, one-shots, FX | clips, decks |

### 4.1 Where it lives (open state, Drum Machine shown)
```
┌───────────────────────── METER BRIDGE ──────────────────────────────┐
│ SONG DISPLAY │ VU │ LOAD │ SAVE │ SHORTCUTS │ MASTER │ TAKE REC      │
├───────────────────────────── PACK BAR ──────────────────────────────┤
│ [ALL][DRUMS][808][MELODIC][LOOPS][VOCAL][FX][★]  🔍 search   ◀ ▶  ⌄  │
│ ◀ ┃CUTS 1-16┃ ┃CUTS 17-32┃ ┃SMART KIT┃ ┃MY: FLINT KNOCK┃ ┃TRAP 808s┃ ▶│
│   └─ open pack expands here: ┆KICK 1┆SNR 2┆HAT 3┆OPEN┆PERC┆808 C┆…┆    │
├──────────────┬──────────────────────────────────────┬──────────────┤
│     RAIL     │            UNIT STAGE                │  PAD MATRIX  │
```
- **Closed:** the 28 px cartridge slot (see 4.0).
- **Open, packs row:** pack cartridges, 56 px tall.
- **Open, sounds row:** the open pack's sounds, 72 px tall. Swipe up or tap the handle to close.
- **Pinned:** stays open on this machine (remembered per machine).
- It exists on the instrument, sample, arrange and perform machines. Tape Deck, Project and Guide have no bar.

### 4.2 What's in it (pack cartridges, left to right)
| Order | Cartridge type | Source | Notes |
|-------|----------------|--------|-------|
| 1 | **★ FAVORITES** | sounds you starred anywhere | always first once you have any |
| 2 | **CUTS** pages | current song's slices, 16 per cartridge | follows every re-chop |
| 3 | **SMART KITS** | auto-built banks (kit, chains, loops, melodic, groups, cues) | built when a song loads |
| 4 | **MY KITS** | saved kits (all songs, not just this one) | name, cover colour |
| 5 | **TAKES** | recordings, prints, resamples | newest first |
| 6 | **LIBRARY** | Pack Factory tracks once chopped (PRO PACK) | by genre |
| 7 | **STORE** | free + premium packs | locked ones show 🔒 and the plan |

Each cartridge looks like a physical cartridge: colour band by kind, name, sound count, genre tag, tiny waveform strip, lock/star badges.

### 4.3 Filters and search
- **Role chips:** ALL · DRUMS · 808/BASS · MELODIC · LOOPS · VOCAL · FX · ★ — filter both cartridges and sounds inside them.
- **Search:** name, genre, key, role ("808 C#", "soul", "snare tight").
- **Key match toggle:** shows the sound's key next to the song key; out-of-key melodic sounds get a "tune to key" badge (tapping it tunes when placed).

### 4.4 Gestures — the complete interaction map

**A. Browse and audition**
| Gesture | Result |
|---------|--------|
| Flick the bar sideways (or ◀ ▶, or mouse wheel) | scroll through packs |
| Tap a cartridge | open it: its sounds slide out in the second row (only one open at a time) |
| Tap a sound chip | audition it (short, cut off by the next audition) |
| Hold a sound chip ½ s | info bubble: name, role, length in beats, key, score, source; ★ to favourite |
| Tap the open cartridge again | close it |

**B. Sound → pad (pick the sound first)**
| Gesture | Result |
|---------|--------|
| Drag a sound chip onto a pad | the pad gets that sound; pad flashes; UNDO takes it back |
| Drag a sound chip onto a pad that already has one | replace (the old sound goes to UNDO) — hold over it ½ s to **layer** instead (pad shows ⧉) |
| Drag a **whole cartridge** onto a bank button (A–H) | load the pack's first 16 sounds into that bank |
| Drag a cartridge onto the pad grid | same as onto the current bank, with an "into bank B?" confirm strip |

**C. Pad → sound (pick the pad first) — the double-tap flow**
| Step | Gesture | Result |
|------|---------|--------|
| 1 | **Double-tap a pad** | the pad is **SELECTED**: bright pulsing ring, label "PICKING FOR A07". The Pack Bar expands by itself and shows sounds **for that slot** first (role-matched: a snare slot shows snares; MPC layout roles on empty pads) |
| 2 | Browse packs as normal; tap sounds to audition | auditions play; the selected pad keeps pulsing so you never lose your place |
| 3 | **Double-tap a sound** (or tap it and press **PUT ▶ A07**) | the sound goes on the selected pad; the pad flashes; with **AUTO-NEXT** on, the next empty pad becomes selected so you keep filling |
| 4 | **Double-tap the selected pad again** | unselect; the Pack Bar returns to normal browsing |

**D. Go deeper**
| Gesture | Result |
|---------|--------|
| Hold a pad ½ s (empty or full) | open Kit Forge with that slot lit (the deep editor: pages of cuts, suggestions, auto-fill) |
| ✎ on a selected pad | open the pad editor (tune, trim, envelope, filter, choke, play mode, layers) |
| SAVE AS PACK (end of the bar) | the current bank becomes a cartridge in MY KITS |

### 4.5 Guarding against accidents (important)
Double-tap is also what a drummer does when playing fast. Rules so it never fights performance:
- A pad still **plays on the first tap** (MPC "pad select" behaviour): you always hear what you are selecting.
- Double-tap selects only if the two taps land within **280 ms** on the **same pad** with less than 8 px movement.
- While **REC is armed or a pattern is recording**, double-tap select is **off** (rolls must record cleanly). A small "SELECT" key on the pad matrix does the same job when you need it while recording.
- Setting: **Pad double-tap: On / Only when not recording (default) / Off**.

### 4.6 Visual states of a pad
| State | Look |
|-------|------|
| Empty | dark recessed, role hint label ("KICK", "HAT") |
| Loaded | role-colour underglow, name |
| Playing | full glow, flash |
| **Selected (picking)** | white outer ring pulsing + accent glow, "PICKING" tag |
| Drop target (dragging over) | dashed bright outline, "DROP" |
| Just assigned | colour wash for 600 ms |
| Muted | grey, strike line |
| Layered | ⧉ badge |

### 4.7 Pack Bar on tablet and phone
- Tablet: same layout; drag with a finger; long-press opens info.
- Phone: the Pack Bar becomes a bottom drawer above the transport; swipe up to open; pads stay visible above it.

### 4.8 Pack Bar acceptance tests
1. Double-tap an empty pad → it pulses; the bar shows role-matched sounds first.
2. Double-tap a sound → it lands on the selected pad; AUTO-NEXT selects the next empty pad.
3. Double-tap the selected pad → unselected.
4. Drag a cartridge to bank C → 16 sounds land; UNDO restores bank C.
5. While recording, double-tapping a pad records two hits and does not select.
6. Search "808" across all packs returns 808 sounds from every cartridge kind.

---

## 5. The pad model and sound flow

### 5.1 Programs
- **CHOP program:** pads play the song's cuts in order (A01 = cut 1 … H16 = cut 128; pages beyond). Follows every re-chop. Read-only map.
- **KIT program:** 8 banks of 16 pads you build. This is where custom pads live.
- **Planned: unlimited programs** — a project can hold several kits (e.g. "Drums", "Chops", "Hook"), each 8 banks deep. A part in the song remembers its program + bank (already true for bank/program).

### 5.2 How a sound travels
```
 Song / Take / Library / Store
        │ decode + analyse (L0)
        ▼
   CUTS ──► Slice Brain scores ──► Pack Bar (cartridges)
        │                               │ drag / double-tap
        ▼                               ▼
  Kit Forge (deep) ───────────────►  PAD (Pad object)
                                        │ play / record
                                        ▼
                         Pattern events (timing, velocity, pitch, length)
                                        │
                     Song Builder parts (+ channel mutes, automation)
                                        │
                           Export (WAV / MP3 / MIDI / stems / kit)
```

### 5.3 Pad editor (complete parameter list)
| Group | Controls |
|-------|----------|
| Sound | name, colour, role, sound picker (opens Pack Bar for this pad) |
| Trim | start, end (zero-crossing snap), reverse, normalise |
| Play | one-shot, gate, loop, latch, hot cue; mute/choke group (1–8) |
| Pitch | tune (±24 st), fine (cents), tune-to-key, glide (808) |
| Amp | volume, pan, attack, decay/hold, release, velocity sensitivity |
| Tone | filter type (LP/HP/BP), cutoff, resonance, drive |
| FX send | bus A (space: reverb), bus B (time: delay/echo), bus C (crush/colour) |
| Layers | up to 4 sounds per pad, each with its own tune/vol (velocity-switch or stack) |

---

## 6. Every element of music creation, unit by unit

### 6.1 SOURCE
**Tape Deck** — load (drop anywhere, LOAD, demo), RESUME, analysis (tempo ½×/2× fix, key, Camelot, bars, slice count). *Add:* **mic / line input recording** ("RECORD A SAMPLE") into a take that becomes a pack cartridge.

**Pack Factory** — order AI packs (genres × types), library on device, LOAD & CHOP, PRO PACK. *Add:* results appear automatically as LIBRARY cartridges in the Pack Bar.

**Pack Store** — free/premium packs; unlocked packs appear as STORE cartridges.

### 6.2 SAMPLE
**Sampler** — waveform, manual cuts (tap to add/remove), method, sensitivity, shortest/longest, pages, preview original/new. *Add:* zoom/scroll waveform with pinch; **region select → "make a sound"** (drag across the waveform to create a pad-ready sound of any length); loop-point finder for seamless loops.

**Slice Brain** — recipes, recommendation, ranked cuts, merge weak cuts, best-of kit. *Add:* "BEST 16 for DRUMS / MELODY / VOCAL" one-press cartridges straight into the Pack Bar.

**Lab** — browser, stems (drums/bass/vocal/melody), sound sorter (similar groups). *Add:* stems become cartridges ("DRUMS STEM CUTS").

### 6.3 INSTRUMENTS
**Kit Forge** — deep pad building (section 4.4 D). Auto-fill recipes, role layout, suggestions, save/load kits.

**Drum Machine** — pads, programs, banks (◀ ▶), Q-link knobs (tempo, swing, filter, pump), automation write/read, note repeat (rates incl. triplets), 16 levels (pitch / velocity / decay / filter), full level, pad mute, erase, TC quantize, undo. *Add:* **velocity-sensitive touch** (position on pad = velocity, already used on keys), **16 LEVELS for any parameter**, **sample-chain resampling** ("bounce bank to one sound").

**Step Sequencer** — grid per pad row, length 1–8 bars, smart beat, copy-to-new. *Add:* **per-step velocity and nudge lanes**, **ratchet/roll per step**, **probability**, **piano-roll view** for melodic pads.

**Keys** — Key Tower (3 tiers, own sound + octave, scale lock, stack, hold, mute, MIDI in), Piano, Layer Rig. *Add:* **chord mode** (one key → triad/7th in key), **arpeggiator** (up/down/random, rate synced), **808 glide** tier mode.

### 6.4 PERFORM
**Launch Console** — 16 clips, launch at loop end, F1–F12. *Add:* **scenes** (a row of clips per part), **follow actions** (after 4 loops go to next), **mute groups as performance buttons**.

**DJ Mixer** — hot cues, loops, rolls, echo, gate, kills, backspin, tape stop, print. *Add:* two-deck crossfade between the song and the beat; sync to transport.

### 6.5 ARRANGE
**Song Builder** — the heart of chop-style song making:
1. Loop a part → play over it → NEXT PART (carry whole / channels on / blank).
2. Channels per part (on/off without deleting).
3. Pads follow the part (bank + program remembered).
4. SONG STRUCTURE templates (classic, trap, chop flip, short) → LAY IT OUT, optionally written by Beat Brain.
5. SMART EDIT per part: write as intro/verse/hook/bridge/outro, new take, drums only, no drums, all on, ×2, ½, make it its own, label.
6. Arrangement view: parts × channels × automation lanes, playhead.

*Add:* **transitions** per part boundary (riser, drop-out, reverse cymbal, filter sweep, stop-and-hit), **count-in markers**, **section colours**, **drag parts to reorder in the arrangement view**, **bar ruler with song time**.

**Beat Brain** — presets, numbered variations, full-song writing, smart packs. Stays as the "producer partner"; its controls also live inline in Smart Edit.

### 6.6 MIX (new unit — currently missing)
A **Mixer MX-16** unit, drawn as an analog console:
- One channel strip per pad in the bank (16) + bus strips (A space, B time, C colour) + master.
- Each strip: fader, pan, mute, solo, 3-band EQ knobs, send A/B/C knobs, meter.
- Master: glue compressor, limiter, width, final VU pair.
- Sidechain pump (exists globally) becomes a per-bus switch.
- Mixer settings are saved per project and **included in export** (export must equal what you hear).

### 6.7 FINISH
**Project Manager** — recent projects, versions, .bc16 files, duplicate. *Add:* export centre in one place: WAV / MP3 / **stems per channel** / MIDI / kit zip / **pack (.bc16pack) to share or sell**, with a **"render check"** that plays back the exported file against the live mix.

---

## 7. Sound logic (what plays, what cuts off)

| Situation | Rule |
|-----------|------|
| Start transport | stops song preview, auto-producer playback, library preview |
| Start a preview | stops the transport and the other previews |
| Tap pads / keys / sounds in the Pack Bar | always play, over anything |
| Pack Bar audition | one at a time (a new audition cuts the previous) |
| Choke groups | hats choke each other; 808s choke each other (mono) |
| Leave a unit | stops that unit's own sounds (previews, held notes); transport keeps running |
| STOP on a stopped machine | ALL STOP: latched pads, note repeat, previews, held notes, everything |
| Recording | count-in, then every pad/key hit records with timing, velocity, pitch, length |
| Export | renders exactly the mix: mutes, channel-per-part, automation, mixer, buses |

---

## 8. Navigation and the beat-making chain

### 8.1 The chain (NEXT ▶ in every unit header)
```
LOAD ─► CHOP ─► BUILD KITS ─► PLAY ─► PROGRAM ─► KEYS ─► PERFORM ─► BUILD SONG ─► EXPORT ─► KEEP
Tape     Sampler   Kit Forge   Drum      Step      Key     Launch    Song         Song        Project
Deck     /Slice    + Pack Bar  Machine   Seq       Tower   Console   Builder      Arranger    Manager
         Brain
```

### 8.2 Session start (after a song loads)
CHOP & FLIP IT · MAKE A BEAT FROM ITS SOUNDS · START A FULL SONG · JUST LOOK AROUND.

### 8.3 Ways back
◀ BACK (named), Esc, UNDO, versions, ALL STOP, Esc closes dialogs/overlays/focus/explain/pick.

### 8.4 Simplification target
- **3 taps to a playable kit** from a loaded song: SESSION START → MAKE A BEAT → pads.
- **5 taps to a full song sketch:** START A FULL SONG → LAY IT OUT → PLAY THE SONG.
- **2 moves to put any sound on any pad:** drag it, or double-tap pad + double-tap sound.

---

## 9. Help, learning and the coach

| Layer | What it does |
|-------|--------------|
| Hold any button ½ s | explains it, without pressing it |
| COACH panel | steps for this unit (ticked live), what you just pressed + what's next, pro tips |
| EXPLAIN (?) mode | every press explains instead of acting |
| SHORTCUTS card | every key on one card (Shift+K) |
| Narrated course | 16 chapters in a soft recorded voice, camera zoom, a hand that does each step |
| Lessons + button book | short tours; searchable reference with SHOW ME |

*Add for the Pack Bar:* a 6-step lesson "Fill your pads from packs" (scroll, open, audition, drag, double-tap select, save as pack) with narration.

---

## 10. Projects, saving and packs

| Thing | Where it lives |
|-------|---------------|
| Song audio | IndexedDB (songs), reopened with RESUME / Recent |
| Working state | autosave per song (pads, banks, patterns, song, automation, mutes, names) |
| Versions | each SAVE + every 5 min of changes; restore keeps current as a version |
| Project file | .bc16 = audio + state + kits |
| My Kits | per song today → **make global** so every kit is a Pack Bar cartridge in any project (sound audio copied into the pack) |
| Packs | **.bc16pack** = sounds (audio) + names/roles/keys + cover; import by drop; export to share or sell |
| Library | Pack Factory tracks (device), become LIBRARY cartridges after chop |

---

## 11. Data model (summary)
```js
Project  { id, name, song: AudioRef, bpm, key, cuts:{method,sens,minl,maxl,manual},
           programs:[{name, banks:[[Pad×16]×8]}], patterns:[Pattern×16],
           song:[partIndex], mixer:Mixer, automation, takes:[Sound], versions:[ref] }
Pattern  { name, bars, ev:[{t, pad|ci, v, st, d}], mute:[channel], bank, prog,
           auto:{flt:[{t,v}], pump:[], sw:[]} }
Mixer    { strips:[{vol,pan,mute,solo,eq:[l,m,h],send:[a,b,c]}], buses, master }
Pack     { id, name, kind, genre, sounds:[Sound], cover, locked }
```

---

## 12. Keyboard and controller map

| Area | Keys |
|------|------|
| Transport | Space play/stop · Enter rec · Backspace undo · 0 click · Shift+← → pattern · Z–, patterns 1–8 |
| Pads | A S D F G H J K / Q W E R T Y U I · 1–8 banks · ← → bank · L 16 levels |
| Perform | O P [ ] rolls · ; ' . / gate/echo/backspin/tape stop · 9 - = kills · F1–F12 clips |
| Units | Alt+1…0 · ` back · Esc back out · ? explain · Shift+K shortcuts |
| **Pack Bar (new)** | **Shift+P** open/close · **, .** previous/next pack · **↑ ↓** sounds in open pack · **Space** (when bar focused) audition · **Enter** put on selected pad · **Tab** next empty pad |
| MIDI | notes → Key Tower tier / pads (MPC-style note map 36–51); CC → Q-link knobs; *planned* MIDI clock in/out |

---

## 13. Visual design system

- **Chassis:** dark anodized faceplates, brushed texture, corner screws, vents, rack nameplates with model numbers.
- **Light:** one accent per unit (CHOP cyan, KITS amber, PADS magenta, SEQ lime, KEYS violet, SONG gold, LIVE red, LAB blue, BRAIN pink, LIBRARY mint, PROJECT sky); liquid light pipe on nameplates; LEDs on every key.
- **Analog cues:** VU meter with needle, knobs with position marks, faders with caps, toggle switches, LCD readouts.
- **Pack Bar look:** cartridges like physical tape/ROM carts: coloured label band by kind, embossed name, mini waveform window, LED for "open", star/lock badges; sound chips like small backlit keycaps.
- **Type:** Archivo (expanded, heavy) for unit names; Martian Mono for readouts.
- **Motion:** only on change (assign flash, select pulse, playhead); compositor-only animations; respects reduced motion.
- **Density:** 44 px minimum touch targets; one accent colour per unit; content areas calm.

---

## 14. Known gaps (to fix, in priority)

| Gap | Impact |
|-----|--------|
| No Pack Bar (sounds only reach pads through Kit Forge pages) | the biggest simplicity win |
| My Kits are stored per song, not global | packs can't travel between projects |
| No mixer unit; export ignores knob automation | export ≠ what you hear when automation is on |
| No per-pad envelope/filter/FX sends/layers editor in one place | sound design is shallow |
| Step sequencer has no velocity/nudge/probability lanes, no piano roll | melodic programming is limited |
| No mic/line sampling | can't sample from outside the song |
| Pitch changes speed (no time-stretch) | can't keep tempo when re-pitching loops |
| No MIDI clock in/out | can't sync with outside gear |
| No transitions between parts | arrangements feel blocky |

---

## 15. Build roadmap

### Phase 0 — **Studio Floor + machine modules** (the frame everything else hangs on) — **delivered for PM-16, CS-1, SB-16**
1. Split the shell into one module per machine with the contract in 3.0; services behind the event system.
2. Studio Floor (level 1): every machine drawn in its place with live status; zoom-in/zoom-out transition; HOME.
3. Full-screen workstation layout for each machine (level 2) and hardware mode keys (level 3), starting with PM-16, CS-1 and SB-16.
4. Each machine gets its own faceplate character (0.4) on the shared material system.
5. Tablet layouts per machine (0.5).
**Done when:** from the floor you reach any machine in one tap, every machine fills the screen with nothing cramped, leaving a machine stops only its own sounds, and the transport/undo/save/meters are identical everywhere.

### Phase 1 — **Pack Bar + pad selection** (the simplicity core)
1. Unified `Sound` and `Pack` objects; adapters for cuts, smart kits, my kits, takes, library, store.
2. Pack Bar shell: cartridges, filters, search, open/close, audition.
3. Drag sound → pad, drag cartridge → bank, replace/layer.
4. Double-tap select pad → role-matched sounds → double-tap/PUT → AUTO-NEXT; guard rules (section 4.5).
5. SAVE AS PACK; global My Kits.
6. Lesson + narration for the Pack Bar.
**Done when:** all 6 acceptance tests in 4.8 pass on desktop and tablet.

### Phase 2 — **Sound design + mix**
Pad editor complete (5.3), layers, buses, Mixer unit, export renders mixer + automation, render check.
**Done when:** an exported WAV null-tests against the live mix within −60 dB.

### Phase 3 — **Programming depth**
Velocity/nudge/probability lanes, ratchets, piano roll, chord mode, arpeggiator, 808 glide.

### Phase 4 — **Song finishing**
Transitions per boundary, scenes and follow actions in Launch, drag-to-reorder in arrangement view, stems export, .bc16pack share/sell.

### Phase 5 — **Studio integration**
Mic/line sampling, time-stretch, MIDI clock and controller mapping (MPC note map, CC learn).

---

## Appendix A — A full session with the Pack Bar (how it should feel)

1. Drop a soul record on the machine. SESSION START → **CHOP & FLIP IT**.
2. Slice Brain recommends **SOUL FLIP**; press USE IT. CUTS cartridges fill the Pack Bar.
3. Double-tap pad A01 → it pulses; the bar shows the best phrase cuts. Tap, tap, tap to audition; double-tap the one you love → it lands; A02 starts pulsing. Fill eight pads in under a minute.
4. Open the **★ FAVORITES** / **SMART KIT** cartridge, drag a kick to A13, a snare to A14, hats to A15–A16.
5. PADS → REC → PLAY → play the flip and drums. COPY ▶ for the hook variation.
6. SONG → LAY IT OUT (chop flip) with "write the parts" off → loop each part, NEXT PART, play the next part in.
7. SMART EDIT: intro = NO DRUMS; bridge = DRUMS ONLY; hook ×2.
8. Mixer: pull the hats down, send the chops to the space bus, pump on the music bus.
9. SAVE (version), EXPORT WAV + stems, SAVE AS PACK for the kit → it's in MY KITS for the next beat.

---

*BC-16 blueprint v2 · direction: virtual analog studio floor + full-screen machines (A + B) · living document · every new feature must update sections 0.4, 2, 4/6 and 15.*
