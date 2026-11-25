"""Synthesise the reel's soft sound-effect bank (no music) into public/sfx/*.wav.

usage: python3 -I scripts/make_sfx.py public/sfx

Every sound is normalised to the same peak; the level in the video is set per cue
(`cues: [frame, name, volume]` in src/cover.config.ts). Calm palette: airy swooshes for
page changes, paper slides for exam sheets, a felt-marker swipe for gold highlights,
soft clicks for numbers, a soft knock for key words, a gentle chime for the logo and a
low air swell under the slogan.
"""
import os
import sys
import wave

import numpy as np

SR = 48000
rng = np.random.default_rng(2026)


# ── helpers ────────────────────────────────────────────────────────────────────
def t_axis(dur):
    return np.arange(int(SR * dur)) / SR


def lowpass(x, cut):
    """one-pole low-pass; `cut` (Hz) may be a scalar or per-sample array."""
    cut = np.broadcast_to(np.asarray(cut, dtype=float), x.shape)
    k = 1 - np.exp(-2 * np.pi * cut / SR)
    y = np.empty_like(x)
    s = 0.0
    for i in range(len(x)):
        s += k[i] * (x[i] - s)
        y[i] = s
    return y


def bandpass(x, lo, hi):
    return lowpass(x, hi) - lowpass(x, lo)


def pink(n):
    """cheap pink-ish noise (white noise through a gentle low-pass blend)."""
    w = rng.standard_normal(n)
    return 0.6 * lowpass(w, 1200) + 0.4 * w * 0.35


def norm(x, peak=0.9):
    m = np.abs(x).max()
    return x * (peak / m) if m > 0 else x


def stereo(mono, pan=0.0):
    """pan: -1 left … +1 right (constant power); pan may be a per-sample array."""
    pan = np.broadcast_to(np.asarray(pan, dtype=float), mono.shape)
    a = (pan + 1) * np.pi / 4
    return np.stack([mono * np.cos(a), mono * np.sin(a)], 1)


def fade_edges(x, ms_in=0.5, ms_out=4):
    """tiny de-click fades (short at the start so click attacks survive)."""
    a, b = int(SR * ms_in / 1000), int(SR * ms_out / 1000)
    if len(x) > a + b:
        if a:
            r = np.linspace(0, 1, a)
            x[:a] *= r[:, None] if x.ndim == 2 else r
        if b:
            r = np.linspace(1, 0, b)
            x[-b:] *= r[:, None] if x.ndim == 2 else r
    return x


# ── sounds ─────────────────────────────────────────────────────────────────────
def swoosh(dur=0.75, lo=300, hi=2600):
    t = t_axis(dur)
    u = t / dur
    n = pink(len(t))
    centre = lo + (hi - lo) * np.sin(np.pi * u) ** 1.5
    x = bandpass(n, centre * 0.35, centre)
    env = np.where(u < 0.45, np.sin(np.pi / 2 * u / 0.45) ** 2, np.cos(np.pi / 2 * (u - 0.45) / 0.55) ** 2)
    return stereo(norm(x * env), pan=-0.5 + u)


def paper(dur=0.55):
    t = t_axis(dur)
    u = t / dur
    n = rng.standard_normal(len(t))
    hiss = bandpass(n, 1500, 7000)
    # grainy friction: random short grains
    grains = np.zeros(len(t))
    pos = 0
    while pos < len(t):
        g = int(SR * rng.uniform(0.004, 0.014))
        grains[pos:pos + g] = rng.uniform(0.4, 1.0)
        pos += g + int(SR * rng.uniform(0.0, 0.006))
    grains = lowpass(grains, 300)
    env = np.minimum(u / 0.15, 1) * np.where(u < 0.75, 1.0, np.cos(np.pi / 2 * (u - 0.75) / 0.25) ** 2)
    slide = hiss * grains * env
    # soft landing: low thump + flap near the end
    land = np.zeros(len(t))
    i0 = int(len(t) * 0.72)
    tt = np.arange(len(t) - i0) / SR
    land[i0:] = np.sin(2 * np.pi * 140 * tt) * np.exp(-tt * 40) * 0.6 + bandpass(rng.standard_normal(len(tt)), 400, 3000) * np.exp(-tt * 70) * 0.5
    return stereo(norm(slide + land), pan=0.15)


def marker(dur=0.42):
    t = t_axis(dur)
    u = t / dur
    n = rng.standard_normal(len(t))
    fric = bandpass(n, 1800, 5200)
    am = 0.7 + 0.3 * np.sin(2 * np.pi * (38 + 10 * u) * t)  # felt friction flutter
    env = np.sin(np.pi * np.clip(u, 0, 1)) ** 0.8
    return stereo(norm(fric * am * env), pan=0.1 - 0.3 * u)


def click(amp=1.0, f=2600):
    n = int(SR * 0.012)
    tt = np.arange(n) / SR
    burst = bandpass(rng.standard_normal(n), 1500, 6000) * np.exp(-tt * 600)
    tone = np.sin(2 * np.pi * f * tt) * np.exp(-tt * 450) * 0.6
    return (burst + tone) * amp


def ticks(dur=0.7, count=14):
    out = np.zeros(int(SR * dur))
    pos = 0
    for k in range(count):
        c = click(amp=rng.uniform(0.55, 1.0) * (1 - 0.4 * k / count), f=rng.uniform(2200, 3000))
        if pos + len(c) >= len(out):
            break
        out[pos:pos + len(c)] += c
        pos += int(SR * rng.uniform(0.032, 0.055))
    return stereo(norm(out), pan=0.0)


def tick():
    out = np.zeros(int(SR * 0.09))
    c = click(1.0, 2400)
    out[:len(c)] += c
    return stereo(norm(out))


def tap(dur=0.4):
    t = t_axis(dur)
    f = 60 + 55 * np.exp(-t * 30)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11)
    knock = lowpass(rng.standard_normal(len(t)), 1800) * np.exp(-t * 90) * 0.8
    return stereo(norm(np.tanh((body + knock) * 1.4)))


def chime(dur=2.4):
    t = t_axis(dur)
    out = np.zeros(len(t))
    for f0, delay, amp in [(659.25, 0.0, 1.0), (987.77, 0.07, 0.75), (1318.5, 0.16, 0.35)]:
        i0 = int(SR * delay)
        tt = t[: len(t) - i0]
        note = sum(a * np.sin(2 * np.pi * f0 * r * tt) * np.exp(-tt * d)
                   for a, r, d in [(1.0, 1, 2.2), (0.35, 2.0, 3.5), (0.18, 2.76, 5.0), (0.06, 5.4, 9.0)])
        note *= np.minimum(1, tt / 0.004)
        out[i0:] += amp * note
    sparkle = bandpass(rng.standard_normal(len(t)), 5000, 11000) * np.exp(-t * 6) * 0.05
    return stereo(norm(out + sparkle), pan=0.0)


def air(dur=1.4):
    t = t_axis(dur)
    u = t / dur
    n = pink(len(t))
    x = lowpass(n, 250 + 900 * u)
    pad = 0.25 * np.sin(2 * np.pi * 220 * t) * u ** 2
    env = np.sin(np.pi / 2 * np.minimum(u / 0.7, 1)) ** 2 * np.where(u < 0.82, 1, np.cos(np.pi / 2 * (u - 0.82) / 0.18) ** 2)
    return stereo(norm((x + pad) * env))


BANK = {
    'swoosh': lambda: swoosh(),
    'swoosh_s': lambda: swoosh(0.42, 500, 3400),
    'paper': paper,
    'marker': marker,
    'ticks': ticks,
    'tick': tick,
    'tap': tap,
    'chime': chime,
    'air': air,
}


def write(path, x):
    x = fade_edges(np.asarray(x, dtype=float))
    pcm = (np.clip(x, -1, 1) * 32767).astype('<i2')
    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else 'public/sfx'
    os.makedirs(out, exist_ok=True)
    for name, fn in BANK.items():
        x = fn()
        write(os.path.join(out, f'{name}.wav'), x)
        print(f'{name:9s} {len(x) / SR:.2f}s')


if __name__ == '__main__':
    main()
