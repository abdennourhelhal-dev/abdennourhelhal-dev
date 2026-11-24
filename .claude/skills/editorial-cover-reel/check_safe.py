"""Check that the bottom fifth of a reel stays empty (only flat background colour).
usage: python3 -I check_safe.py video.mp4 [--step 5] [--bg #2433F0,#F4EEE1] [--skip 90-104,240-254]
Decodes the y >= 1536 band with ffmpeg and reports sampled frames containing anything that is
not one of the allowed background colours. Use --skip for transition frames (edge lines and
page moves legitimately cross the whole frame).
"""
import argparse, subprocess, sys

ap = argparse.ArgumentParser()
ap.add_argument('video')
ap.add_argument('--step', type=int, default=5)
ap.add_argument('--bg', default='#2433F0')
ap.add_argument('--skip', default='')
a = ap.parse_args()

W, Y0, H = 1080, 1536, 384
TOL = 40  # h264 + yuv420p chroma noise
bgs = [tuple(int(c.strip().lstrip('#')[i:i + 2], 16) for i in (0, 2, 4)) for c in a.bg.split(',') if c.strip()]
skips = [tuple(int(v) for v in r.split('-')) for r in a.skip.split(',') if r.strip()]

cmd = ['ffmpeg', '-v', 'error', '-i', a.video, '-vf', f"select='not(mod(n\\,{a.step}))',crop={W}:{H}:0:{Y0}",
       '-vsync', '0', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']
raw = subprocess.run(cmd, capture_output=True, check=True).stdout
fsz = W * H * 3
bad, checked = [], 0
for i in range(len(raw) // fsz):
    n = i * a.step
    if any(s <= n <= e for s, e in skips):
        continue
    checked += 1
    fr = raw[i * fsz:(i + 1) * fsz]
    worst = 0
    for p in range(0, fsz, 3 * 7):  # every 7th pixel
        d = min(abs(fr[p] - b[0]) + abs(fr[p + 1] - b[1]) + abs(fr[p + 2] - b[2]) for b in bgs)
        if d > worst:
            worst = d
    if worst > TOL:
        bad.append((n, worst))
print(f'checked {checked} frames (skipped {len(raw) // fsz - checked}); violations: {len(bad)}')
for n, d in bad[:20]:
    print(f'  frame {n}: max colour distance {d}')
sys.exit(1 if bad else 0)
