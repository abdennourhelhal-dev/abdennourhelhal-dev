---
name: editorial-cover-reel
description: Build a 9:16 kinetic-typography reel in Remotion in a blue editorial magazine-cover style — flat electric blue, white lowercase type, huge serif italic vs small black grotesk, thin 55% rules that the huge words break across, mask/wipe/slice motion with no fades. Use when asked for an "editorial", "magazine cover", "blue cover style" reel or animation, to animate a line/URL/slogan as a cover, or to restyle an existing reel (including Arabic ones) in this look.
---

# Editorial cover reel (Remotion)

A ready Remotion v4 project lives in `template/`. Copy it, edit one config file, render.
Everything visual is encoded in `src/theme.ts` and `src/motion/Element.tsx`; a new reel is
almost always **only a new `src/cover.config.ts`** (plus `public/` assets).

## The style (do not drift from it)

| | |
|---|---|
| Canvas | 1080×1920, 30 fps, default 30 s (900 frames) |
| Background | flat electric blue `#2433F0`, no gradients, no texture |
| Type colour | pure white |
| Case | all lowercase for Latin text (`prep()` lowercases automatically) |
| Fonts — exactly two roles | **huge** = Instrument Serif *Italic* 400 · **small** = Schibsted Grotesk Black 900 |
| Arabic counterparts | huge → **Amiri Italic 400** · small → **Cairo 900** (same roles, browser falls back per glyph) |
| Rules | thin white rules (2 px) at a *static* 55 % opacity; huge words sit on top of and cross them |
| Layout | line split into parts that alternate small / huge / small / huge, stacked like a cover; huge words break across rules |
| Safe area | **bottom fifth (y ≥ 1536) stays empty** — every row must end above it |
| Pacing | fast and confident, short holds between beats, **1.5 s hold** on the final lockup |
| Banned | fades / opacity animation, glow, shadows, gradients, extra fonts, colour accents |

## Motion vocabulary (`motion` field)

| motion | what it does | defaults |
|---|---|---|
| `rise` | letters rise through a baseline mask with spring overshoot (Latin = per-letter spans; Arabic = word cloned into vertical strips so joining is never broken, staggered from the reading start) | ~12 frames to settle |
| `snap` | first word: rises **huge** at screen centre, holds `hold` frames, then snaps down into its small kicker slot in 7 frames with sub-frame motion blur | `hold: 20–26`, `hugeY: 760` |
| `wipe` | slanted clip wipe with a thin white line riding the edge (line exists only mid-wipe); RTL wipes right→left | 10 frames |
| `under` | slides out from under the element above; `under` = canvas y of the clip edge (bottom of the word above) | ~14 frames |
| `slices` | four horizontal slices fly in from alternating sides, land off-register, then lock at `lock` frames | `lock: 18–24` |
| `cut` | hard cut on | 0 |
| rules | draw with `scaleX` from `from: 'left' \| 'right'` in 9 frames | — |

Scenes are joined by **hard cuts** (each `Sequence` just starts where the previous ends).
Elements can hard-cut off with `until`.

## Authoring `src/cover.config.ts`

```ts
{ text: 'https://', role: 'small', motion: 'snap', at: 0, hold: 26, y: 200, align: 'left' }
{ kind: 'rule', y: 300, at: 30, from: 'left' }
{ text: 'anber-', role: 'huge', motion: 'wipe', at: 44, y: 330, max: 360, align: 'left' }
{ text: '/ar', role: 'huge', motion: 'slices', at: 134, lock: 22, y: 1150, max: 320 }
{ kind: 'image', src: 'mark-white.png', at: 0, y: 110, height: 150, align: 'center' }
```
- `at` / `until` are frames relative to the scene start; `y` is the top of the text row.
- Huge words: give `max` (largest size) and they auto-fit the width (canvas measurement, shaping-aware).
  Row height = size × line-height (huge 1.12, small 1.35) — check `y + rowHeight < 1536`.
- Put a rule **through** each huge row (≈ 75–90 % down the row) so the word breaks across it.
- Splitting a line into four parts: small kicker → huge → small → huge. Long huge parts may wrap
  onto two rows (e.g. `anber-` / `school`). The **first** part uses `snap`, the **last** huge part uses `slices`.
- Filling 30 s with a single short line: build the cover (~7 s), **recompose it** 2× with new alignments,
  new rule positions and a different motion per part (hard cut between covers), then the final lockup
  (snap → wipe → rise → under → slices) settling ≥ 45 frames before the end.
- Multi-message reels (ads, promos): one cover per message/voice-over line; keep the same grammar on every cover.
- Logos must be **white silhouettes** (make one from the alpha channel) — no colour enters the frame.
- `cues` in the config is reserved for SFX `[frame, name]` (no music in this style unless asked).

## Render (this cloud image)

```bash
cp -r .claude/skills/editorial-cover-reel/template <project>/ && cd <project>
npm install
# edit src/cover.config.ts, add assets to public/
npx remotion still src/index.ts Cover out/f.jpg --frame=120      # spot checks
npx remotion render src/index.ts Cover out/cover.mp4             # full render
```
`remotion.config.ts` points at the preinstalled headless shell
(`/opt/pw-browsers/chromium_headless_shell-1243/...`); override with `REMOTION_BROWSER=...`.
For many stills, bundle once: `npx remotion bundle src/index.ts --out-dir /tmp/b` then
`npx remotion still /tmp/b Cover ...`.

## Verify before delivering
1. Stills at each beat's settle frame + one mid-motion frame per motion type: Arabic shaping intact,
   huge words cross rules, nothing clipped at the margins, slices visibly off-register before lock.
2. Bottom fifth is empty: every pixel row y ≥ 1536 equals `#2433F0` on sampled frames
   (`python3 -I check_safe.py out/cover.mp4` from the skill folder).
3. `grep -n opacity src -r` → only the static `RULE_COLOR` and the `blur-accumulation` weight in `Snap`.
4. `ffprobe` → 1080×1920, 30 fps, expected duration.
