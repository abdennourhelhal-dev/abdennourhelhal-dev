---
name: editorial-cover-reel
description: Build a 9:16 kinetic-typography reel in Remotion in an editorial magazine style — flat cover colour (electric blue by default, or a brand colour), lowercase type, huge serif italic vs small black grotesk, thin 55% rules the huge words break across, mask/wipe/slice motion with no fades — plus optional "inside pages" (paper + ink) with data tables, calendars and real document scans. Use when asked for an "editorial", "magazine cover", "blue cover style" reel or animation, to animate a line/URL/slogan as a cover, to show tables/data/real documents in that look, or to restyle an existing reel (including Arabic ones).
---

# Editorial cover reel (Remotion)

A ready Remotion v4 project lives in `template/`. Copy it, edit one config file, render.
Visual rules live in `src/theme.ts` + palettes, motion in `src/motion/*`, data layouts in
`src/data/*`. A new reel is almost always **only a new `src/cover.config.ts`** plus `public/` assets.

## The style (do not drift from it)

| | |
|---|---|
| Canvas | 1080×1920, 30 fps, default 30 s (900 frames) |
| Cover background | flat **electric blue `#2433F0`** by default — or the brand's own colour when the user asks for their identity (sample it from their logo/assets) |
| Type colour | white by default; with a brand palette the huge words may take the brand accent (e.g. flat logo gold) |
| Case | all lowercase for Latin text (`prep()` lowercases automatically) |
| Fonts — exactly two roles | **huge** = Instrument Serif *Italic* 400 · **small** = Schibsted Grotesk Black 900 |
| Arabic counterparts | huge → **Amiri Italic 400** · small → **Cairo 900** (browser falls back per glyph) |
| Rules | thin 2 px rules at a *static* 55 % opacity; huge words sit on top of and cross them |
| Layout | parts alternate small / huge / small / huge, stacked like a cover; huge words break across rules |
| Safe area | **bottom fifth (y ≥ 1536) stays empty** — every row must end above it |
| Pacing | fast and confident, short holds, slow drift so no frame freezes, **1.5 s hold** on the final lockup |
| Banned | fades / opacity animation, glow, text shadows, gradients, extra fonts |

### Palettes
`config.palettes = { cover, inside }`, each `{ bg, huge, small, rule, accent, onAccent, dim }`.
Default `ELECTRIC` (theme.ts). Scenes pick one with `theme: 'cover' | 'inside'`.
Example brand palette (Anber School): cover = navy `#0F1421` bg, gold `#D4A23A` huge, white small,
gold rules; inside = cream `#F4EEE1` paper, navy ink, gold accent bands.
Colour tokens usable in elements: `'accent' | 'onAccent' | 'dim' | 'huge' | 'small'` or any CSS colour.

### Inside pages (sibling style for data)
Same fonts, rules and motion, inverted onto paper: cream background, ink type, accent bands.
Use for tables, calendars, numbers and **real** document scans (exam papers, certificates...).
Typical arc: **cover intro → inside pages → cover outro** ("magazine").

## Motion vocabulary (`motion` field)

| motion | what it does | defaults |
|---|---|---|
| `rise` | rises through a baseline mask with spring overshoot. Latin = per letter. **Arabic huge = per sub-word** (split after non-joining letters ا أ إ آ د ذ ر ز و ؤ ة ء — joins and لا never break). Arabic small = per word (keeps digits, brackets, bidi intact) | ~12 frames |
| `snap` | first word rises **huge** at centre, holds, 4-frame anticipation, 7-frame snap into its kicker slot with motion blur, small overshoot settle | `hold: 20–30`, `hugeY: 760` |
| `wipe` | slanted clip wipe; a thin accent line leads the edge and exits past the word | 11 frames |
| `under` | slides out from under the element above; `under` = canvas y of the clip edge | ~14 frames |
| `slices` | four horizontal slices fly in (motion-blurred), land off-register, lock at `lock` | `lock: 18–24` |
| `cut` | hard cut on | 0 |
| exits | any element: `out` (scene frame) → text sinks under its mask, rules/bands retract, papers slide away | 8–10 frames |
| rules | draw with `scaleX`/`scaleY`; `kick` = small wobble when something lands | 9 frames |

**Tempo** (`config.tempo`): `'punchy'` (default, everything above) or `'calm'` — "very simple":
every text line slides up once through its baseline mask over 24 frames (soft ease-out, no bounce,
no per-letter cascade; `rise`/`wipe`/`under` all become this slide), rules and outline boxes draw
over 20 frames ease-in-out, snap moves gently over 18 frames and slices slide into the word's own
window and lock slowly — no blur on text. Transitions, papers and accent bands are unchanged.
Use calm when the client finds the motion too fast or flashy; leave ≈ 24 frames per text beat.

**Scene transitions** (`transitionIn`, 14 frames, motion-blurred, never a fade):
`slideUp` (next page slides up, accent rule on the leading edge — use cover → inside),
`push` (RTL page turn — inside → inside), `diagonal` (slanted wipe with accent edge — inside → cover),
`cut`. Living holds: `drift` (px of slow rise) or `push` (slow camera scale) per scene.

Motion blur = `Accum` (sub-frame accumulation, plus-lighter average). Only active while
something moves fast; its per-sample opacity is an accumulation weight, not a fade.

## Elements
```ts
{ text: 'https://', role: 'small', motion: 'snap', at: 0, hold: 26, y: 200, align: 'left' }
{ text: 'anber-', role: 'huge', motion: 'wipe', at: 44, y: 330, max: 360, align: 'left' }
{ kind: 'rule', y: 300, at: 30, from: 'left' }            // or vertical: true, x, y, y1
{ kind: 'rect', x, y, w, h, at, from: 'right' }             // accent band, wipes in
{ kind: 'box', x, y, w, h, at, stroke: 'accent' }           // outline that draws
{ kind: 'image', src: 'logo.png', at, y, height, align }
{ kind: 'paper', src: 'papers/bac.png', label, x, y, w, rot, from: 'right', tag: 'bac 2026\nmaths',
  tagSide: 'right', callout: { x: .05, y: .02, w: .9, h: .15, at } }   // real document sheet
```
Generators (expand to primitives, so everything animates the same way):
- `calendar({ at, y, start /*Sunday*/, weeks, cellH, month, monthNames, band, outline })` —
  RTL month grid, rules draw, days rise, highlight band wipes in reading order.
- `table({ at, y, cols /*right→left*/, header, rows, vRules })`, `columnBox(cols, c)`.

Authoring notes
- `at` / `out` / `until` are frames relative to the scene; `y` = top of the row.
- Huge words: `max` auto-fits the column (shaping-aware canvas measure). Row height = size × 1.12
  (huge) / 1.35 (small). Amiri ascenders reach ~0.25 em above the row — leave room under kickers.
- Put a rule through each huge row (≈ 75–90 % down) so the word breaks across it.
- Never letter-space Arabic. Drop shadda from huge Amiri Italic words (it stacks far too high).
- First part of a line uses `snap`; the last huge word of the piece uses `slices`.
- One cover/page per voice-over line; time beats to the stressed words of the script.
- Real documents only from real sources (state the source in a small `dim` line); until the file
  exists, `src: null` renders a clearly-labelled placeholder sheet.
- Sound: `cues: [frame, name, volume]` plays `public/sfx/<name>.wav` at that frame (rendered into the MP4).
  Keep SFX soft and sparse (no music unless asked). Images: `motion:'rise'` + `zoom` (e.g. 1.08) + `dur`
  gives a smooth logo reveal; `motion:'slices'` (+ `width`) assembles an image from four bands.

## Render (this cloud image)
```bash
cp -r .claude/skills/editorial-cover-reel/template <project>/ && cd <project>
npm install
npx remotion bundle src/index.ts --out-dir /tmp/b                 # once
npx remotion still /tmp/b Cover /tmp/f120.jpg --frame=120          # spot checks
npx remotion render src/index.ts Cover out/cover.mp4              # full render
```
`remotion.config.ts` points at the preinstalled headless shell; override with `REMOTION_BROWSER=...`.
PDF page → image: `pdftoppm -png -r 150 -f 1 -l 1 in.pdf out` (poppler is installed).

## Verify before delivering
1. Stills at each beat's settle frame + one mid-motion frame per motion/transition: Arabic shaping
   intact, nothing overlapping or clipped, data correct (dates/highlighted days), papers legible.
2. Bottom fifth empty: `python3 -I check_safe.py out.mp4 --bg '#0F1421,#F4EEE1' --skip 90-104,...`
   (skip transition frames, whose edge lines cross the whole frame).
3. `grep -rn opacity src` → only static rule colours and the `blur-accumulation` weights.
4. `ffprobe` → 1080×1920, 30 fps, expected duration.
