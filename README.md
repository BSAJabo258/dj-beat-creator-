# DJ Beat Creator

A sampler, sequencer and DJ deck that runs entirely in the browser. Load a song and it finds the tempo, key and every hit. From there you can turn the slices into kits, play them on pads, write beats from your own sounds, DJ the track live and export everything.

Your audio never leaves your device.


## The studio (BC-16 OS)

Every page is its own piece of studio gear, switched from the **rail** on the left (Alt+1 … Alt+0):

| Rail | Unit(s) | What it is for |
|---|---|---|
| DECK | Tape Deck TD-1 | Load a song; tempo, key and hits are found |
| CHOP | Sampler CS-1 | Slice length (SHORTEST / LONGEST); the pads follow the cuts |
| KITS | Kit Forge KF-2 | Light a slot, hold a cut, it lands; save kits by name |
| PADS | Drum Machine PM-16 | Play / program pads, CHOP or KIT program |
| SEQ | Step Sequencer SQ-8 | Draw hits on the grid |
| KEYS | Key Tower KT-3, Piano, Layer Rig | Three stacked keyboards, each with its own sound and octave; MIDI in |
| SONG | Song Builder, Song Arranger, Auto Producer | Loop a part, play over it, NEXT PART, channels per part; export | Order patterns, export WAV / MIDI |
| LIVE | Launch Console LC-8, DJ Mixer | All 8 patterns to launch (F1–F8), cues, loops, rolls |
| LAB | Browser, Stem Splitter, Sorter | Dig, split, group |
| BRAIN | Beat Brain | Presets, variations, smart kits |
| LIBRARY | Pack Factory, Pack Store | AI sample packs in 34 genres (your own sunoapi.org-compatible key), library saved on the device, free starter packs, PRO / STUDIO memberships (Lemon Squeezy or Gumroad license keys) |
| GUIDE | Studio Manual | Lessons, studio map, button book, self-playing demo |

Always on screen: the **meter bridge** (song display, VU meter, LOAD, SAVE, MASTER, TAKE REC, EXPLAIN) and the
**transport bar** (REC, OVERDUB, STOP, PLAY, PLAY START, TAP, pattern ◀ ▶ / P1–P8 / COPY ▶ / CLEAR, UNDO, ◀ BACK).
Keys: `-` / `=` previous / next pattern, `` ` `` back, `?` explain mode. Every unit zooms (− ⤢ +).

## Run it

**One file:** `dist/DJ_Beat_Creator.html` is the whole app in a single file. Download it and open it in Chrome, Edge or Safari, no server needed. Rebuild it after changes with `python3 tools/build-single.py`.

**From the repo:** 
serve the folder with any static web server:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

Pushing to `main` runs the checks in `.github/workflows/site.yml` and publishes the site to GitHub Pages. To turn that on, go to **Settings → Pages** and set **Source** to **GitHub Actions**.

## The machine

The app is laid out as one instrument, the BC-16. Only the screen changes. Every other control is fixed on the body and keeps working in every mode.

| Section | Controls |
|---|---|
| Top | Display (song, BPM, key, Camelot code), **MASTER** volume, **TAKE REC** |
| Screen | The current mode. Its header shows sequence, bank, timing correct and REC/TAKE status. The **soft keys** along the bottom change with each mode. |
| Mode | MAIN, CHOP, STEMS, GROUPS, BROWSE, PROGRAM, STEP SEQ, BRAIN, LIVE, KEYS, DJ, ARRANGE, SONG |
| Data | A **jog wheel** with **−** and **+**. They change whatever value you touched last on the screen (tempo by default). |
| Transport | **REC**, **OVERDUB**, **STOP**, **PLAY**, **PLAY START**, **TAP TEMPO** |
| Sequence | P1–P8 (switch at the end of the loop while playing) |
| Q-link | Knobs for TEMPO, SWING, FILTER and PUMP. Drag, scroll, use the arrow keys, or double-click to reset. |
| Pad bank | A–H |
| Pads | 4×4 rubber pads with colour backlight |
| Pad function | **16 LEVELS**, **CHORD**, **UNDO**, **NOTE REPEAT** with rate, **SHIFT**, **ERASE**, **COPY**, **TC**, **FULL LEVEL**, **PAD MUTE** |

- **ERASE**: press a pad to erase its hits from the current sequence.
- **PAD MUTE**: press pads to mute or unmute them in playback and exports. **SHIFT + PAD MUTE** unmutes all.
- **COPY**: copies the current sequence to the next empty one.
- **TC**: steps through the timing-correct (quantize) values.
- **SHIFT**: latches note repeat. Holding the Shift key does the same.

### Recording works on every page

- **REC / OVERDUB** records into the current sequence from any mode. That covers the pads, plus anything you play on the **Live** pads and keys, the **Keys** piano, **Chop** slices and **Groups**. A sound that isn't on a pad yet gets one automatically, starting in bank H, named "REC …".
- **TAKE REC** records the audio of whatever you play, on any page. Takes can be saved as WAV or MP3, or sent to the slice bin and chopped again.

### Songs

Loading another song swaps everything over to it. Each song keeps its own pads, patterns and song order, and switching back brings them back.

## Modes

| Group | Page | What it's for |
|---|---|---|
| Source | **Main** | Drop a song in. Shows tempo, slices, bars, key and Camelot code. |
| | **Chop** | Tempo and hit detection. Tap the waveform to add or remove cuts. Re-arrange and export the result. |
| | **Stems** | Split a stretch of the song into kick, snare, hats, bass, vocals, melody and FX, then rebuild it. |
| | **Groups** | Collect slices that sound alike into named groups. |
| Build | **Browse** | The slice bin: every slice, take and added file. Smart fills load a whole bank at once. |
| | **Program** | Eight banks of sixteen pads, with recording, note repeat, a pad editor and full-screen performance. |
| | **Step seq** | A step grid for the current pattern, plus Smart Beat. |
| | **Beat Brain** | Presets, repeatable variations, full-song writing and smart sound packs. |
| Perform | **Live** | Drum pads plus lead, chord and bass keyboard layers. |
| | **Keys** | A piano that plays any sound locked to the song's key. |
| | **DJ** | Hot cues, loops, rolls, gate, echo, backspin, tape stop, filter, kills and sidechain pump. |
| Finish | **Arrange** | An automatic new arrangement of the song. |
| | **Song** | Pattern order, WAV/MP3/MIDI export, kit zips, takes and saved setups. |

## Moving sounds between pages

- **Hold any sound for half a second** (a slice, a pad, a key, a group, a Parts row or stem). It goes to the next empty pad.
- **Hold an empty pad** to go pick a sound for it. A banner follows you while you choose. Hold a sound and you land back on that pad.
- **Record from the top bar** on any page. Takes can be saved as WAV or MP3, or sent back to the slice bin and chopped again.

## Automation and presets

- **Automatic setup.** When a song loads, the app builds the pad banks for you: a kit, chains, loops, tuned sounds, groups and hot cues. Pad levels are matched by role, and pitched pads are tuned into the song's key. You can switch each of these off in Beat Brain.
- **Presets.** Detroit bounce, Flint street, Trap, Drill, Boom bap, Soul chop flip and Lo-fi. Each one sets the groove, energy, swing, quantize, sidechain pump, chord pattern and kick pattern. You can save your own.
- **Variations are numbered, not random.** Variation 1 is the preset itself. The same song, preset and number always give the same beat, so you can find a good take again.

## How Beat Brain picks and writes

- **Sweet spots.** A slice ranks higher when it starts right on a strong hit, sits on the grid, ends cleanly before the next hit, has a clear pitch, and has a usable length and level.
- **Chains.** Slices are joined into ½-, 1- and 2-beat and 1-bar phrases. **Loops** are 1-, 2- and 4-bar sections that repeat well and have a click-free seam.
- **Writing.**
  - The 808 locks to the kick and follows the chord roots.
  - Keys stay in key, and chops answer each other bar to bar, in the order they appear in the source.
  - Hat rolls only lead into the next phrase.
  - Sections run intro → verse → hook → bridge → outro.
- **Hot cues.** These go where the energy or the hit count jumps, nudged toward 4- and 8-bar boundaries.

Open the pad editor on any smart pad to see why it was picked.

## Pad controls

Each pad has these controls:

- volume, pan and tune
- trim start and end, and reverse
- attack and release
- a DJ filter: left is low-pass, right is high-pass
- play mode: one-shot, gate, loop while held, loop on/off, or hot cue
- cut group, mono or poly, and lock (smart fills leave locked pads alone)
- follow tempo
- **Tune to key**

## Keyboard

| Keys | Action |
|---|---|
| `1`–`8` | Switch bank |
| `A S D F G H J K` / `Q W E R T Y U I` | Pads 1–8 / 9–16 |
| `Z X C V B N M ,` | Patterns 1–8 (switches at the end of the loop while playing) |
| `Space` / `Enter` | Play/stop · record |
| Hold `Shift` + pad | Note repeat |
| `O P [ ]` | Roll ¼, ⅛, 1/16, 1/32 |
| `;` `'` `.` `/` | Gate, echo, backspin, tape stop |
| `9` `-` `=` | Kill low, mid, high |
| `L` | Keys mode |
| `Backspace` | Undo |

## Inspirations

The workflow borrows proven ideas from hardware and software samplers: Note Repeat and Roll (Akai MPC, Roland SP-404MKII), per-pad envelopes and resampling (SP-404MKII), finding the best chops and slicing at intervals (Serato Sample), and Camelot key codes for harmonic mixing. Pitch shifting here changes the playback speed. True time-stretching is not built in yet.

## Layout

```
index.html        app shell and every page
css/app.css       the instrument skin: body, screen, pads, keys, knobs
css/engine.css    structural styles for the engine panels
js/engine.js      analysis, chopping, Live, Keys, Parts, Groups, Arrange
js/studio.js      pads, sequencer, DJ engine, Beat Brain, presets, automation, connections
js/app.js         modes, physical controls, Q-link knobs, drag-and-drop loading
js/demo-audio.js  the demo beat
tools/            build-single.py bundles everything into dist/DJ_Beat_Creator.html
dist/             the single-file app
```
