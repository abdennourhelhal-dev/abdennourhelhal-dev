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
