"""Synthesise the promo's sound effects (no music) and mix them on the cue list.
usage: python3 -I src/sfx.py <cues.json> <out.wav> [duration]
"""
import json, sys, wave
import numpy as np

SR = 48000
rng = np.random.default_rng(7)


def env(n, a, d, curve=3.0):
    t = np.linspace(0, 1, n)
    e = np.minimum(t / max(a, 1e-4), 1.0) * (1 - t) ** curve
    return e / (e.max() or 1)


def lowpass_var(x, cut):
    """one-pole low-pass with per-sample cutoff (Hz)."""
    y = np.zeros_like(x); s = 0.0
    k = 1 - np.exp(-2 * np.pi * cut / SR)
    for i in range(len(x)):
        s += k[i] * (x[i] - s); y[i] = s
    return y


def whoosh(dur=0.6):
    n = int(SR * dur); t = np.linspace(0, 1, n)
    noise = rng.standard_normal(n)
    cut = 300 + 5200 * np.sin(np.pi * t) ** 2
    lp = lowpass_var(noise, cut)
    bp = lp - lowpass_var(lp, cut * 0.25)
    e = np.sin(np.pi * t) ** 2
    m = bp * e
    pan = t
    return np.stack([m * (1 - 0.6 * pan), m * (0.4 + 0.6 * pan)], 1) * 1.6


def rise(dur=0.95):
    n = int(SR * dur); t = np.linspace(0, dur, n)
    f = 180 * (1 + 5 * (t / dur) ** 2)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.35
    noise = lowpass_var(rng.standard_normal(n), 400 + 6000 * (t / dur) ** 2) * 0.9
    e = (t / dur) ** 1.6 * np.minimum(1, (dur - t) / 0.06)
    m = (tone + noise) * e
    return np.stack([m, m], 1)


def shimmer(dur=1.4):
    n = int(SR * dur); out = np.zeros((n, 2))
    for k in range(14):
        on = int(rng.uniform(0, 0.55) * SR)
        f = rng.uniform(2200, 6400); L = n - on
        tt = np.arange(L) / SR
        s = np.sin(2 * np.pi * f * tt) * np.exp(-tt * rng.uniform(4, 7)) * 0.12
        p = rng.uniform(0.15, 0.85)
        out[on:, 0] += s * (1 - p); out[on:, 1] += s * p
    air = lowpass_var(rng.standard_normal(n), np.full(n, 9000.0))
    air = (air - lowpass_var(air, np.full(n, 3000.0))) * env(n, 0.2, 1, 2) * 0.25
    out += air[:, None]
    return out


def impact(dur=0.9):
    n = int(SR * dur); t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t * 18)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5.5)
    click = lowpass_var(rng.standard_normal(n), np.full(n, 2500.0)) * np.exp(-t * 40) * 1.5
    m = np.tanh((boom + click) * 1.8) * 0.9
    return np.stack([m, m], 1)


def pop(dur=0.14):
    n = int(SR * dur); t = np.arange(n) / SR
    f = 520 + 900 * (t / dur)
    m = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 38) * 0.75
    return np.stack([m, m], 1)


def ding(dur=1.1):
    n = int(SR * dur); t = np.arange(n) / SR
    m = sum(a * np.sin(2 * np.pi * 1318.5 * r * t) * np.exp(-t * d)
            for a, r, d in [(0.5, 1, 4), (0.22, 2.0, 6), (0.12, 2.76, 8), (0.06, 5.4, 12)])
    m *= np.minimum(1, t / 0.003)
    return np.stack([m, m], 1)


GAIN = {'whoosh': 0.55, 'rise': 0.45, 'shimmer': 0.8, 'impact': 0.85, 'pop': 0.45, 'ding': 0.5}
BANK = {k: f() for k, f in [('whoosh', whoosh), ('rise', rise), ('shimmer', shimmer),
                            ('impact', impact), ('pop', pop), ('ding', ding)]}


def main():
    cues = json.load(open(sys.argv[1]))
    dur = float(sys.argv[3]) if len(sys.argv) > 3 else 30.0
    mix = np.zeros((int(SR * dur), 2))
    for t, name in cues:
        s = BANK[name] * GAIN[name]
        i = int(t * SR); j = min(len(mix), i + len(s))
        mix[i:j] += s[: j - i]
    mix /= max(1e-9, np.abs(mix).max()) / 0.89
    pcm = (mix * 32767).astype('<i2')
    with wave.open(sys.argv[2], 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    print('cues', len(cues), '->', sys.argv[2])


if __name__ == '__main__':
    main()
