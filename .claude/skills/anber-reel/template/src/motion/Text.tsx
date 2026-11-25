import React from 'react';
import { PAD, ROLE, SMALL_SIZE, W } from '../theme';
import { fit, isArabic, measure, prep } from '../text';
import { resolveColor, usePalette } from '../palette';
import type { TextEl } from '../types';
import { Accum, calmEase, clamp01, easeIn, easeInOut, easeOut, osc, poly, snapEase } from './helpers';
import { CALM, useTempo } from './tempo';

export type Geo = { text: string; size: number; w: number; rowH: number; x0: number; rtl: boolean; colL: number; colR: number };

export const geometry = (el: TextEl): Geo => {
  const text = prep(el.text);
  const colL = el.x0 ?? PAD;
  const colR = el.x1 ?? W - PAD;
  // `max` auto-fits the column; `size` alone is fixed; both = fixed layout size, shrunk to fit if needed
  const size = el.max
    ? Math.min(el.size ?? el.max, fit(text, el.role, el.max, el.width ?? colR - colL))
    : el.size ?? (el.role === 'small' ? SMALL_SIZE : 200);
  const w = measure(text, el.role, size);
  const rowH = Math.round(size * ROLE[el.role].lineHeight);
  const rtl = isArabic(text);
  const align = el.align ?? (rtl ? 'right' : 'left');
  const x0 = align === 'left' ? colL : align === 'right' ? colR - w : (colL + colR - w) / 2;
  return { text, size, w, rowH, x0, rtl, colL, colR };
};

const useInk = (el: TextEl) => {
  const pal = usePalette();
  return resolveColor(pal, el.color, el.role === 'huge' ? pal.huge : pal.small);
};

const fontStyle = (el: TextEl, g: Geo, color: string): React.CSSProperties => {
  const r = ROLE[el.role];
  return {
    lineHeight: `${g.rowH}px`, fontFamily: r.family, fontWeight: r.weight, fontStyle: r.style, fontSize: g.size,
    // never track Arabic: spacing breaks joining and mark (shadda) placement
    letterSpacing: g.rtl ? 0 : `${r.tracking}em`, color, whiteSpace: 'pre',
  };
};

export const Glyphs: React.FC<{ el: TextEl; g: Geo; style?: React.CSSProperties }> = ({ el, g, style }) => {
  const ink = useInk(el);
  return (
    <div dir={g.rtl ? 'rtl' : 'ltr'} style={{ position: 'absolute', left: g.x0 - 2, top: 0, width: g.w + 4, height: g.rowH,
      textAlign: g.rtl ? 'right' : 'left', ...fontStyle(el, g, ink), ...style }}>
      {g.text}
    </div>
  );
};

const Row: React.FC<{ y: number; h: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ y, h, style, children }) => (
  <div style={{ position: 'absolute', left: 0, top: y, width: W, height: h, ...style }}>{children}</div>
);

// ---------------------------------------------------------------------------
// Arabic sub-words: a word breaks naturally after every non-joining letter, so each
// piece can move on its own without ever breaking a join (لا stays one piece).
// ---------------------------------------------------------------------------
const NONJOIN = new Set([...'اأإآٱدذرزوؤةء']);
const MARK = /[ً-ٰٟۖ-ۭ]/;
export const subwords = (s: string) => {
  const out: string[] = [];
  const cs = [...s];
  let cur = '';
  for (let i = 0; i < cs.length; i++) {
    cur += cs[i];
    while (i + 1 < cs.length && MARK.test(cs[i + 1])) cur += cs[++i];
    const base = [...cur].filter((c) => !MARK.test(c)).pop() ?? '';
    if (NONJOIN.has(base) || base === ' ') {
      out.push(cur);
      cur = '';
    }
  }
  if (cur) out.push(cur);
  return out;
};

const maskOf = (g: Geo) => {
  const maskY = g.rowH + g.size * 0.3; // just under the descenders
  return { maskY, travel: maskY + g.size * 0.15 };
};

// ---------------------------------------------------------------------------
// rise: pieces rise through a baseline mask with spring overshoot
// ---------------------------------------------------------------------------
const Rise: React.FC<{ el: TextEl; g: Geo; f: number }> = ({ el, g, f }) => {
  const ink = useInk(el);
  const { maskY, travel } = maskOf(g);
  // huge Arabic: sub-words; small Arabic: whole words (digits, brackets and bidi stay intact); Latin: letters
  const parts = g.rtl ? (el.role === 'huge' ? subwords(g.text) : g.text.split(/(?<= )/)) : [...g.text];
  const step = g.rtl
    ? Math.max(0.8, Math.min(el.role === 'huge' ? 1.6 : 2, (el.role === 'huge' ? 6 : 8) / parts.length))
    : Math.max(0.6, Math.min(1.6, 14 / parts.length));
  return (
    <div style={{ position: 'absolute', inset: 0, clipPath: poly([[-200, -g.rowH * 1.5], [W + 200, -g.rowH * 1.5], [W + 200, maskY], [-200, maskY]]) }}>
      <div dir={g.rtl ? 'rtl' : 'ltr'} style={{ position: 'absolute', left: g.x0 - 2, top: 0, width: g.w + 4, height: g.rowH,
        display: 'flex', justifyContent: 'flex-start', ...fontStyle(el, g, ink) }}>
        {parts.map((c, i) => (
          <span key={i} style={{ display: 'inline-block', transform: `translateY(${(1 - osc(f - i * step)) * travel}px)` }}>{c}</span>
        ))}
      </div>
    </div>
  );
};

/** Exit: the settled word sinks back under its baseline mask. */
const Sink: React.FC<{ el: TextEl; g: Geo; e: number }> = ({ el, g, e }) => {
  const { maskY, travel } = maskOf(g);
  return (
    <div style={{ position: 'absolute', inset: 0, clipPath: poly([[-200, -g.rowH * 1.5], [W + 200, -g.rowH * 1.5], [W + 200, maskY], [-200, maskY]]) }}>
      <Glyphs el={el} g={g} style={{ transform: `translateY(${easeIn(e) * travel}px)` }} />
    </div>
  );
};

// ---------------------------------------------------------------------------
// wipe: slanted clip wipe; the edge line leads in and exits past the word
// ---------------------------------------------------------------------------
const Wipe: React.FC<{ el: TextEl; g: Geo; f: number }> = ({ el, g, f }) => {
  const pal = usePalette();
  const dur = 11, lineDur = 16;
  const p = easeOut(clamp01(f / dur));
  const lp = easeOut(clamp01(f / lineDur));
  const s = g.rowH * 0.42; // slant run
  const a = g.x0 - 80 - s, b = g.x0 + g.w + 80 + s;
  const edge = g.rtl ? b + (a - b) * p : a + (b - a) * p;
  const lineEdge = g.rtl ? b + 40 + (a - 260 - (b + 40)) * lp : a - 40 + (b + 260 - (a - 40)) * lp;
  const T = -g.rowH * 0.35, B = g.rowH * 1.35;
  const top = edge + s / 2, bot = edge - s / 2;
  const clip = g.rtl ? poly([[top, T], [W + 300, T], [W + 300, B], [bot, B]]) : poly([[-300, T], [top, T], [bot, B], [-300, B]]);
  const drift = (g.rtl ? -1 : 1) * -(1 - p) * 40;
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, clipPath: clip }}>
        <Glyphs el={el} g={g} style={{ transform: `translateX(${drift}px)` }} />
      </div>
      {f > 0 && f < lineDur && (
        <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={W} height={g.rowH}>
          <line x1={lineEdge + s / 2} y1={T} x2={lineEdge - s / 2} y2={B} stroke={pal.accent} strokeWidth={3} />
        </svg>
      )}
    </>
  );
};

// ---------------------------------------------------------------------------
// under: slides out from beneath the element above (static clip edge)
// ---------------------------------------------------------------------------
const Under: React.FC<{ el: TextEl; g: Geo; f: number }> = ({ el, g, f }) => {
  const edge = (el.under ?? el.y) - el.y;
  const start = edge - g.rowH * 1.1;
  const y = start * (1 - osc(f, 0.5, 0.45));
  return (
    <div style={{ position: 'absolute', inset: 0, clipPath: poly([[-300, edge], [W + 300, edge], [W + 300, g.rowH * 3], [-300, g.rowH * 3]]) }}>
      <Glyphs el={el} g={g} style={{ transform: `translateY(${y}px)` }} />
    </div>
  );
};

// ---------------------------------------------------------------------------
// slices: four horizontal slices fly in (motion-blurred), land off-register, then lock
// ---------------------------------------------------------------------------
const OFF = [-0.11, 0.07, -0.05, 0.13];
const slicesAt = (el: TextEl, g: Geo, f: number) => {
  const lock = el.lock ?? 18;
  return [0, 1, 2, 3].map((i) => {
    const a = i * 2;
    if (f < a) return null;
    // integer band edges + 1 px overlap: no hairline seam once the slices lock
    const top = i === 0 ? -g.rowH : Math.round((g.rowH * i) / 4) - 1;
    const bot = i === 3 ? g.rowH * 2 : Math.round((g.rowH * (i + 1)) / 4);
    const side = i % 2 === 0 ? 1 : -1;
    const resid = OFF[i] * g.size;
    const q = easeOut(clamp01((f - a) / 7));
    let x = side * 1300 * (1 - q) + resid * q;
    if (f >= lock) x = resid * (1 - osc(f - lock - i * 0.6, 0.95, 0.42));
    return (
      <div key={i} style={{ position: 'absolute', inset: 0, clipPath: poly([[-400, top], [W + 400, top], [W + 400, bot], [-400, bot]]) }}>
        <Glyphs el={el} g={g} style={{ transform: `translateX(${x}px)` }} />
      </div>
    );
  });
};
const Slices: React.FC<{ el: TextEl; g: Geo; f: number }> = ({ el, g, f }) => (
  <Accum f={f} active={f > 0 && f < 14} samples={10} render={(ff) => <>{slicesAt(el, g, ff)}</>} />
);

// ---------------------------------------------------------------------------
// snap: rises huge at centre → 4-frame anticipation → 7-frame blurred snap → settle
// ---------------------------------------------------------------------------
const snapP = (t: number) => {
  if (t <= 0) return 0;
  if (t < 7) return snapEase(t / 7);
  const u = t - 7;
  return 1 + 0.07 * Math.exp(-u / 3.2) * Math.sin(u * 0.95);
};
const snapTransform = (el: TextEl, g: Geo, f: number): React.CSSProperties => {
  const hold = el.hold ?? 20;
  const k = Math.min(940 / g.w, 8);
  const fx = g.x0 + g.w / 2, fy = el.y + g.rowH / 2;
  const cx = W / 2, cy = el.hugeY ?? 760;
  const t = f - hold;
  const p = snapP(t);
  const ant = t > -4 ? easeInOut(clamp01((t + 4) / 4)) : 0;
  const sc = (k + (1 - k) * p) * (1 + 0.045 * ant * (1 - clamp01(p)));
  return { transform: `translate(${(cx - fx) * (1 - p)}px, ${(cy - fy) * (1 - p)}px) scale(${sc})`, transformOrigin: `${fx}px ${g.rowH / 2}px` };
};
const Snap: React.FC<{ el: TextEl; g: Geo; f: number }> = ({ el, g, f }) => {
  const hold = el.hold ?? 20;
  return (
    <Accum f={f} active={f >= hold - 0.5 && f <= hold + 9} samples={12} render={(ff) => (
      <Row y={el.y} h={g.rowH} style={snapTransform(el, g, ff)}>
        <Rise el={el} g={g} f={ff} />
      </Row>
    )} />
  );
};

// ---------------------------------------------------------------------------
// calm tempo ("very simple"): the whole line slides up once through its mask, slowly,
// no bounce, no cascade; gentle snap and slices without blur
// ---------------------------------------------------------------------------
const baselineClip = (g: Geo) => {
  const { maskY } = maskOf(g);
  return poly([[-200, -g.rowH * 1.5], [W + 200, -g.rowH * 1.5], [W + 200, maskY], [-200, maskY]]);
};
const Slide: React.FC<{ el: TextEl; g: Geo; f: number }> = ({ el, g, f }) => {
  const { maskY } = maskOf(g);
  const p = calmEase(clamp01(f / CALM.slide));
  return (
    <div style={{ position: 'absolute', inset: 0, clipPath: baselineClip(g) }}>
      <Glyphs el={el} g={g} style={{ transform: `translateY(${(1 - p) * (maskY + g.size * 0.12)}px)` }} />
    </div>
  );
};
const CalmSink: React.FC<{ el: TextEl; g: Geo; e: number }> = ({ el, g, e }) => {
  const { maskY } = maskOf(g);
  return (
    <div style={{ position: 'absolute', inset: 0, clipPath: baselineClip(g) }}>
      <Glyphs el={el} g={g} style={{ transform: `translateY(${easeInOut(e) * (maskY + g.size * 0.12)}px)` }} />
    </div>
  );
};
const CalmSnap: React.FC<{ el: TextEl; g: Geo; f: number }> = ({ el, g, f }) => {
  const hold = el.hold ?? 30;
  const k = Math.min(940 / g.w, 8);
  const fx = g.x0 + g.w / 2, fy = el.y + g.rowH / 2;
  const cx = W / 2, cy = el.hugeY ?? 760;
  const p = easeInOut(clamp01((f - hold) / CALM.snapMove));
  const sc = k + (1 - k) * p;
  return (
    <Row y={el.y} h={g.rowH} style={{ transform: `translate(${(cx - fx) * (1 - p)}px, ${(cy - fy) * (1 - p)}px) scale(${sc})`, transformOrigin: `${fx}px ${g.rowH / 2}px` }}>
      <Slide el={el} g={g} f={f} />
    </Row>
  );
};
const CalmSlices: React.FC<{ el: TextEl; g: Geo; f: number }> = ({ el, g, f }) => {
  const lock = el.lock ?? 40;
  const m = g.size * 0.25; // window margin covers the italic overhang
  const L = g.x0 - m, R = g.x0 + g.w + m;
  return (
    <>
      {[0, 1, 2, 3].map((i) => {
        const a = i * CALM.sliceStagger;
        if (f < a) return null;
        const top = i === 0 ? -g.rowH : Math.round((g.rowH * i) / 4) - 1;
        const bot = i === 3 ? g.rowH * 2 : Math.round((g.rowH * (i + 1)) / 4);
        const side = i % 2 === 0 ? 1 : -1;
        const resid = OFF[i] * g.size * 0.6;
        const q = calmEase(clamp01((f - a) / CALM.sliceIn));
        let x = side * (R - L) * (1 - q) + resid * q;
        if (f >= lock) x = resid * (1 - easeInOut(clamp01((f - lock) / CALM.sliceLock)));
        // each slice slides into the word's own window, entering through its edge
        return (
          <div key={i} style={{ position: 'absolute', inset: 0, clipPath: poly([[L, top], [R, top], [R, bot], [L, bot]]) }}>
            <Glyphs el={el} g={g} style={{ transform: `translateX(${x}px)` }} />
          </div>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------------------
export const TextElement: React.FC<{ el: TextEl; f: number; exit: number }> = ({ el, f, exit }) => {
  const g = geometry(el);
  const tempo = useTempo();
  if (tempo === 'calm') {
    if (exit > 0) return <Row y={el.y} h={g.rowH}><CalmSink el={el} g={g} e={exit} /></Row>;
    const cm = el.motion ?? 'rise';
    if (cm === 'snap') return <CalmSnap el={el} g={g} f={f} />;
    const calmInner = cm === 'slices' ? <CalmSlices el={el} g={g} f={f} /> : cm === 'cut' ? <Glyphs el={el} g={g} /> : <Slide el={el} g={g} f={f} />;
    return <Row y={el.y} h={g.rowH}>{calmInner}</Row>;
  }
  if (exit > 0) return <Row y={el.y} h={g.rowH}><Sink el={el} g={g} e={exit} /></Row>;
  const m = el.motion ?? 'rise';
  if (m === 'snap') return <Snap el={el} g={g} f={f} />;
  const inner =
    m === 'rise' ? <Rise el={el} g={g} f={f} /> :
    m === 'wipe' ? <Wipe el={el} g={g} f={f} /> :
    m === 'under' ? <Under el={el} g={g} f={f} /> :
    m === 'slices' ? <Slices el={el} g={g} f={f} /> :
    <Glyphs el={el} g={g} />;
  return <Row y={el.y} h={g.rowH}>{inner}</Row>;
};
