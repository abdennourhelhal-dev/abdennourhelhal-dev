import sys
from PIL import Image, ImageFilter
import numpy as np
src, dst, prev = sys.argv[1:4]
a = np.array(Image.open(src).convert('RGBA')).astype(float)
r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
# 1) red / orange fringe halo -> remove
red = (r > 120) & (g < r * 0.62)
al[red & (al < 230)] = 0
# remaining opaque reddish px -> push to gold hue
fix = red & (al >= 230)
g[fix] = r[fix] * 0.72; b[fix] = r[fix] * 0.25
# 2) neon yellow semi-transparent glow -> fade strongly
neon = (r > 190) & (g > 170) & (b < 90) & (al < 220)
al[neon] *= 0.15
# 3) generic weak alpha speckle -> drop
al[al < 60] = 0
# 4) soften alpha edge with slight erosion + blur
A = Image.fromarray(al.astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
out = np.dstack([r, g, b, np.array(A).astype(float)]).clip(0, 255).astype(np.uint8)
img = Image.fromarray(out, 'RGBA')
img = img.crop(img.getbbox())
img.save(dst)
bg = Image.new('RGBA', img.size, (10, 14, 30, 255)); bg.alpha_composite(img)
bg.convert('RGB').resize((img.width // 2, img.height // 2)).save(prev)
print(img.size)
