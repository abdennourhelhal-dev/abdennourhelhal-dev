import React from 'react';
import { Easing, Img, staticFile } from 'remotion';
import { PAD, ROLE, RULE_COLOR, RULE_THICKNESS, SMALL_SIZE, W, WHITE } from '../theme';
import { fit, isArabic, measure, prep } from '../text';
import type { El, ImageEl, RuleEl, TextEl } from '../types';

// ---------------------------------------------------------------------------
// helpers — everything is a pure function of the local frame `f` (may be fractional,
// so the hand-rolled motion blur can sample sub-frames). No opacity anywhere.
// ---------------------------------------------------------------------------
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Damped spring 0 -> 1 with overshoot. w = angular freq (rad/frame), z = damping ratio. */
export const osc = (f: number, w = 0.55, z = 0.4) => {
  if (f <= 0) return 0;
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * f) * (Math.cos(wd * f) + ((z * w) / wd) * Math.sin(wd * f));
};
const easeOut = Easing.bezier(0.16, 0.84, 0.2, 1);
const snapEase = Easing.bezier(0.7, 0, 0.15, 1);

type Geo = { text: string; size: number; w: number; rowH: number; x0: number; rtl: boolean };

const geometry = (el: TextEl): Geo => {
  const text = prep(el.text);
  const size = el.size ?? (el.max ? fit(text, el.role, el.max, el.width) : el.role === 'small' ? SMALL_SIZE : 200);
  const w = measure(text, el.role, size);
  const rowH = Math.round(size * ROLE[el.role].lineHeight);
  const align = el.align ?? (isArabic(text) ? 'right' : 'left');
  const x0 = align === 'left' ? PAD : align === 'right' ? W - PAD - w : (W - w) / 2;
  return { text, size, w, rowH, x0, rtl: isArabic(text) };
};

const Glyphs: React.FC<{ el: TextEl; g: Geo; style?: React.CSSProperties }> = ({ el, g, style }) => {
  const r = ROLE[el.role];
  return (
    <div
      dir={g.rtl ? 'rtl' : 'ltr'}
      style={{
        position: 'absolute', left: g.x0 - 2, top: 0, width: g.w + 4, height: g.rowH,
        lineHeight: `${g.rowH}px`, fontFamily: r.family, fontWeight: r.weight, fontStyle: r.style,
        // never track Arabic: spacing breaks joining and mark (shadda) placement
        fontSize: g.size, letterSpacing: g.rtl ? 0 : `${r.tracking}em`, color: WHITE, whiteSpace: 'nowrap',
        textAlign: g.rtl ? 'right' : 'left', ...style,
      }}
    >
      {g.text}
    </div>
  );
};

const Row: React.FC<{ y: number; h: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ y, h, style, children }) => (
  <div style={{ position: 'absolute', left: 0, top: y, width: W, height: h, ...style }}>{children}</div>
);

const poly = (pts: [number, number][]) => `polygon(${pts.map(([x, y]) => `${x}px ${y}px`).join(',')})`;

// ---------------------------------------------------------------------------
// rise: letters rise through a baseline mask with overshoot.
// Latin -> real per-letter spans. Arabic -> whole word cloned into vertical strips
// (keeps letter joining intact), strips staggered from the reading start.
// ---------------------------------------------------------------------------
const Rise: React.FC<{ el: TextEl; g: Geo; f: number }> = ({ el, g, f }) => {
  const r = ROLE[el.role];
  // mask edge sits just under the descenders so settled glyphs are never cut
  const maskY = g.rowH + g.size * 0.3;
  const travel = maskY + g.size * 0.15;
  const baseline = poly([[-200, -g.rowH], [W + 200, -g.rowH], [W + 200, maskY], [-200, maskY]]);
  if (!g.rtl) {
    const chars = [...g.text];
    const step = Math.max(0.6, Math.min(1.6, 14 / chars.length));
    return (
      <div style={{ position: 'absolute', inset: 0, clipPath: baseline }}>
        <div style={{ position: 'absolute', left: g.x0 - 2, top: 0, height: g.rowH, lineHeight: `${g.rowH}px`, whiteSpace: 'pre',
          fontFamily: r.family, fontWeight: r.weight, fontStyle: r.style, fontSize: g.size, letterSpacing: `${r.tracking}em`, color: WHITE }}>
          {chars.map((c, i) => (
            <span key={i} style={{ display: 'inline-block', transform: `translateY(${(1 - osc(f - i * step)) * travel}px)` }}>{c}</span>
          ))}
        </div>
      </div>
    );
  }
  const n = Math.max(3, Math.min(9, Math.round(g.w / 95)));
  const over = g.size * 0.35; // italic overhang
  return (
    <>
      {Array.from({ length: n }, (_, k) => {
        // k = 0 is the right-most strip (reading start in RTL)
        const right = g.x0 + g.w - (g.w * k) / n + (k === 0 ? over : 0.5);
        const left = g.x0 + g.w - (g.w * (k + 1)) / n - (k === n - 1 ? over : 0.5);
        const clip = poly([[left, -g.rowH], [right, -g.rowH], [right, maskY], [left, maskY]]);
        return (
          <div key={k} style={{ position: 'absolute', inset: 0, clipPath: clip }}>
            <Glyphs el={el} g={g} style={{ transform: `translateY(${(1 - osc(f - k * 1.4)) * travel}px)` }} />
          </div>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------------------
// wipe: slanted clip wipe with a thin white line on its edge (line exists only mid-wipe)
// ---------------------------------------------------------------------------
const Wipe: React.FC<{ el: TextEl; g: Geo; f: number }> = ({ el, g, f }) => {
  const dur = 10;
  const p = easeOut(clamp01(f / dur));
  const s = g.rowH * 0.42; // slant run
  const a = g.x0 - 80 - s, b = g.x0 + g.w + 80 + s;
  const edge = g.rtl ? b + (a - b) * p : a + (b - a) * p;
  const top = edge + s / 2, bot = edge - s / 2;
  const T = -g.rowH * 0.35, B = g.rowH * 1.35;
  const clip = g.rtl ? poly([[top, T], [W + 300, T], [W + 300, B], [bot, B]]) : poly([[-300, T], [top, T], [bot, B], [-300, B]]);
  const drift = (g.rtl ? -1 : 1) * -(1 - p) * 36;
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, clipPath: clip }}>
        <Glyphs el={el} g={g} style={{ transform: `translateX(${drift}px)` }} />
      </div>
      {p > 0 && p < 1 && (
        <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={W} height={g.rowH}>
          <line x1={top} y1={T} x2={bot} y2={B} stroke={WHITE} strokeWidth={3} />
        </svg>
      )}
    </>
  );
};

// ---------------------------------------------------------------------------
// under: slides out from beneath the element above (static clip edge at `under`)
// ---------------------------------------------------------------------------
const Under: React.FC<{ el: TextEl; g: Geo; f: number }> = ({ el, g, f }) => {
  const edge = (el.under ?? el.y) - el.y;
  const start = edge - g.rowH * 1.1;
  const y = start * (1 - osc(f, 0.5, 0.45));
  const clip = poly([[-300, edge], [W + 300, edge], [W + 300, g.rowH * 3], [-300, g.rowH * 3]]);
  return (
    <div style={{ position: 'absolute', inset: 0, clipPath: clip }}>
      <Glyphs el={el} g={g} style={{ transform: `translateY(${y}px)` }} />
    </div>
  );
};

// ---------------------------------------------------------------------------
// slices: four horizontal slices land off-register, then lock
// ---------------------------------------------------------------------------
const OFF = [-0.11, 0.07, -0.05, 0.13];
const Slices: React.FC<{ el: TextEl; g: Geo; f: number }> = ({ el, g, f }) => {
  const lock = el.lock ?? 18;
  return (
    <>
      {[0, 1, 2, 3].map((i) => {
        const a = i * 2;
        if (f < a) return null;
        const top = i === 0 ? -g.rowH : (g.rowH * i) / 4;
        const bot = i === 3 ? g.rowH * 2 : (g.rowH * (i + 1)) / 4;
        const side = i % 2 === 0 ? 1 : -1;
        const resid = OFF[i] * g.size;
        const q = easeOut(clamp01((f - a) / 7));
        let x = side * 1300 * (1 - q) + resid * q;
        if (f >= lock) x = resid * (1 - osc(f - lock, 0.95, 0.42));
        return (
          <div key={i} style={{ position: 'absolute', inset: 0, clipPath: poly([[-400, top], [W + 400, top], [W + 400, bot], [-400, bot]]) }}>
            <Glyphs el={el} g={g} style={{ transform: `translateX(${x}px)` }} />
          </div>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------------------
// snap: rises huge at centre, holds, then snaps down into its small slot with motion blur.
// The blur is a sub-frame accumulation (12 samples additively averaged in an isolated
// group). The per-sample opacity there is accumulation weight, not a fade.
// ---------------------------------------------------------------------------
const snapTransform = (el: TextEl, g: Geo, f: number) => {
  const hold = el.hold ?? 20;
  const k = Math.min(940 / g.w, 8);
  const fx = g.x0 + g.w / 2, fy = el.y + g.rowH / 2;
  const cx = W / 2, cy = el.hugeY ?? 760;
  const t = f - hold;
  const p = t <= 0 ? 0 : t >= 7 ? 1 : snapEase(t / 7);
  const sc = k + (1 - k) * p;
  return { transform: `translate(${(cx - fx) * (1 - p)}px, ${(cy - fy) * (1 - p)}px) scale(${sc})`, transformOrigin: `${fx}px ${g.rowH / 2}px` };
};

const SnapSample: React.FC<{ el: TextEl; g: Geo; f: number }> = ({ el, g, f }) => (
  <Row y={el.y} h={g.rowH} style={snapTransform(el, g, f)}>
    <Rise el={el} g={g} f={f} />
  </Row>
);

const Snap: React.FC<{ el: TextEl; g: Geo; f: number }> = ({ el, g, f }) => {
  const hold = el.hold ?? 20;
  const blurring = f >= hold - 0.5 && f <= hold + 8;
  if (!blurring) return <SnapSample el={el} g={g} f={f} />;
  const N = 12, shutter = 0.5; // 180° shutter
  return (
    <div style={{ position: 'absolute', inset: 0, isolation: 'isolate' }}>
      {Array.from({ length: N }, (_, j) => (
        <div key={j} style={{ position: 'absolute', inset: 0, opacity: 1 / N /* blur-accumulation */, mixBlendMode: 'plus-lighter' }}>
          <SnapSample el={el} g={g} f={f - (j * shutter) / N} />
        </div>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------------------
const TextElement: React.FC<{ el: TextEl; f: number }> = ({ el, f }) => {
  const g = geometry(el);
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

const RuleElement: React.FC<{ el: RuleEl; f: number }> = ({ el, f }) => {
  const x0 = el.x0 ?? PAD, x1 = el.x1 ?? W - PAD;
  const p = easeOut(clamp01(f / 9));
  return (
    <div style={{ position: 'absolute', left: x0, top: el.y, width: x1 - x0, height: RULE_THICKNESS, background: RULE_COLOR,
      transform: `scaleX(${p})`, transformOrigin: el.from === 'left' ? 'left center' : 'right center' }} />
  );
};

const ImageElement: React.FC<{ el: ImageEl; f: number }> = ({ el, f }) => {
  const justify = el.align === 'left' ? 'flex-start' : el.align === 'right' ? 'flex-end' : 'center';
  const y = el.motion === 'cut' ? 0 : (1 - osc(f)) * el.height * 1.05;
  return (
    <Row y={el.y} h={el.height} style={{ clipPath: poly([[-100, -el.height], [W + 100, -el.height], [W + 100, el.height], [-100, el.height]]) }}>
      <div style={{ display: 'flex', justifyContent: justify, padding: `0 ${PAD}px`, transform: `translateY(${y}px)` }}>
        <Img src={staticFile(el.src)} style={{ height: el.height }} />
      </div>
    </Row>
  );
};

/** Renders any element at scene-local frame `sf`. Hidden before `at` and from `until` (hard cuts). */
export const Element: React.FC<{ el: El; sf: number }> = ({ el, sf }) => {
  if (sf < el.at || (el.until !== undefined && sf >= el.until)) return null;
  const f = sf - el.at;
  if (el.kind === 'rule') return <RuleElement el={el} f={f} />;
  if (el.kind === 'image') return <ImageElement el={el} f={f} />;
  return <TextElement el={el} f={f} />;
};
