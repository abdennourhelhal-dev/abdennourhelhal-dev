# Anber School: Winter Courses Promo (9:16, 30s)

Motion-graphics ad for the winter holiday courses (4AM/BEM and 3AS/BAC, all subjects).

- `out/anber-winter-30s.mp4`: final video with sound effects (no music, no voice yet)
- `out/anber-winter-30s-silent.mp4`: same video, no audio
- `script.md`: voice-over script with timings, plus the open questions for the teacher

## Rebuild
```bash
npm install
node src/render.js frames /tmp/frames 30          # renders 900 JPEG frames + cues.json
python3 -I src/sfx.py /tmp/frames/cues.json sfx/sfx_track.wav 30
ffmpeg -framerate 30 -i /tmp/frames/f_%05d.jpg -i sfx/sfx_track.wav -c:v libx264 -crf 18 \
  -pix_fmt yuv420p -c:a aac -b:a 192k -shortest out/anber-winter-30s.mp4
```
Edit texts/timing in `src/index.html` (GSAP timeline). `node src/render.js stills <dir> 6.4 12.3` grabs single frames.

## Editorial (blue cover) version
`editorial/` is the same reel rebuilt in Remotion with the `editorial-cover-reel` skill
(`.claude/skills/editorial-cover-reel/`): flat #2433F0, white type, Amiri Italic / Cairo 900
(+ Instrument Serif Italic / Schibsted Grotesk Black for Latin), no fades, bottom fifth empty.
- Output: `editorial/out/anber-winter-editorial-30s.mp4` (silent — script and SFX to be refined)
- Edit `editorial/src/cover.config.ts`, then `cd editorial && npm i && npx remotion render src/index.ts Cover out/anber-winter-editorial-30s.mp4`

## v3 (school identity + data)
`editorial/out/anber-winter-v3-30s.mp4`: navy/gold cover intro and outro (colours sampled from the
logo card), cream "inside pages" in the middle:
- official winter break 2026/2027 calendar (17 Dec 2026 evening → 3 Jan 2027 morning, decision no. 41)
- levels table (4AM → BEM, 3AS → BAC)
- real BAC 2026 / BEM 2026 first pages (placeholders until `public/papers/*.png` and `src/papers.ts` are filled)

Timings follow `script.md` v2. Real papers: put page 1 PNGs in `editorial/public/papers/` and set
their file names in `editorial/src/papers.ts`, then re-render.

## v4 (calm motion + real papers)
`editorial/out/anber-winter-v4-30s.mp4`: same structure as v3 with `tempo: 'calm'` (text lines slide
in slowly and simply, rules draw slowly; gentle opening snap and closing slices) and the **real**
first pages of BAC 2026 (sciences exp.: maths, physique, anglais) and BEM 2026 (maths, physique) in
`editorial/public/papers/`, with gold callouts on each exam header. The subjects scene is now a
3-row list with each real paper arriving on its word.

## Final (client voice-over)
`editorial/out/anber-winter-final-voice.mp4` (≈ 38.3 s): v7 re-timed to the client's recorded voice
(7 clips in `editorial/public/vo/`, prepared with `scripts/prep_voice.py`), soft SFX underneath,
calendar simplified to "courses throughout the winter break" (official dates only).
