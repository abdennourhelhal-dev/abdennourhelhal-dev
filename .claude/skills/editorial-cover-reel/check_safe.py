"""Check that the bottom fifth of an editorial-cover reel stays empty (pure #2433F0).
usage: python3 -I check_safe.py video.mp4 [step_frames=5]
Decodes the y >= 1536 band with ffmpeg and reports frames containing non-background pixels.
"""
import subprocess, sys

path = sys.argv[1]
step = int(sys.argv[2]) if len(sys.argv) > 2 else 5
W, Y0, H = 1080, 1536, 384
BG = (0x24, 0x33, 0xF0)
TOL = 40  # h264 + yuv420p chroma noise

cmd = ['ffmpeg', '-v', 'error', '-i', path, '-vf', f"select='not(mod(n\\,{step}))',crop={W}:{H}:0:{Y0}",
       '-vsync', '0', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']
raw = subprocess.run(cmd, capture_output=True, check=True).stdout
fsz = W * H * 3
bad = []
for i in range(len(raw) // fsz):
    fr = raw[i * fsz:(i + 1) * fsz]
    worst = 0
    for p in range(0, fsz, 3 * 7):  # sample every 7th pixel
        d = abs(fr[p] - BG[0]) + abs(fr[p + 1] - BG[1]) + abs(fr[p + 2] - BG[2])
        if d > worst:
            worst = d
    if worst > TOL:
        bad.append((i * step, worst))
print(f'checked {len(raw) // fsz} frames; violations: {len(bad)}')
for n, d in bad[:20]:
    print(f'  frame {n}: max colour distance {d}')
sys.exit(1 if bad else 0)
