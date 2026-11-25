import React from 'react';
import { Img, staticFile } from 'remotion';
import { PAD, RULE_THICKNESS, W } from '../theme';
import { resolveColor, usePalette } from '../palette';
import type { BoxEl, ImageEl, RectEl, RuleEl } from '../types';
import { Accum, calmEase, clamp01, easeIn, easeInOut, easeOut, osc, poly } from './helpers';
import { CALM, useTempo } from './tempo';

/** Rules draw in (scaleX / scaleY), can kick when something lands, retract on exit. */
export const RuleElement: React.FC<{ el: RuleEl; f: number; sf: number; exit: number }> = ({ el, f, sf, exit }) => {
  const pal = usePalette();
  const color = resolveColor(pal, el.color, pal.rule);
  const calm = useTempo() === 'calm';
  const p = (calm ? easeInOut(clamp01(f / CALM.rule)) : easeOut(clamp01(f / 9))) * (1 - easeIn(exit));
  let kick = 0;
  if (!calm && el.kick !== undefined && sf >= el.kick) {
    const u = sf - el.kick;
    kick = 7 * Math.exp(-u / 4) * Math.sin(u * 0.9);
  }
  if (el.vertical) {
    const x = el.x ?? PAD;
    const y1 = el.y1 ?? el.y + 100;
    return (
      <div style={{ position: 'absolute', left: x - RULE_THICKNESS / 2, top: el.y, width: RULE_THICKNESS, height: y1 - el.y, background: color,
        transform: `translateX(${kick}px) scaleY(${p})`, transformOrigin: 'center top' }} />
    );
  }
  const x0 = el.x0 ?? PAD, x1 = el.x1 ?? W - PAD;
  return (
    <div style={{ position: 'absolute', left: x0, top: el.y - RULE_THICKNESS / 2, width: x1 - x0, height: RULE_THICKNESS, background: color,
      transform: `translateY(${kick}px) scaleX(${p})`, transformOrigin: el.from === 'left' ? 'left center' : 'right center' }} />
  );
};

/** Flat highlight band, revealed by a hard-edged wipe from one side. */
export const RectElement: React.FC<{ el: RectEl; f: number; exit: number }> = ({ el, f, exit }) => {
  const pal = usePalette();
  const p = easeOut(clamp01(f / (el.dur ?? 8))) * (1 - easeIn(exit));
  const from = el.from ?? 'right';
  const horiz = from === 'left' || from === 'right';
  const origin = { left: 'left center', right: 'right center', top: 'center top', bottom: 'center bottom' }[from];
  return (
    <div style={{ position: 'absolute', left: el.x, top: el.y, width: el.w, height: el.h, background: resolveColor(pal, el.fill, pal.accent),
      transform: horiz ? `scaleX(${p})` : `scaleY(${p})`, transformOrigin: origin }} />
  );
};

/** Outline box whose stroke draws around (callouts, ranges). */
export const BoxElement: React.FC<{ el: BoxEl; f: number; exit: number }> = ({ el, f, exit }) => {
  const pal = usePalette();
  const calm = useTempo() === 'calm';
  if (exit >= 1) return null;
  const p = calm ? easeInOut(clamp01(f / Math.max(el.dur ?? 0, CALM.box))) : easeOut(clamp01(f / (el.dur ?? 12)));
  const sw = el.width ?? 4;
  return (
    <svg style={{ position: 'absolute', left: el.x - sw, top: el.y - sw, overflow: 'visible' }} width={el.w + sw * 2} height={el.h + sw * 2}>
      <rect x={sw} y={sw} width={el.w} height={el.h} fill="none" stroke={resolveColor(pal, el.stroke, pal.small)} strokeWidth={sw}
        pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
    </svg>
  );
};

// image slices (e.g. a logo as the final lockup): four horizontal bands slide into place,
// land slightly off-register, then lock. Calm = slow, inside the image's own window, no blur.
const IMG_OFF = [-0.11, 0.07, -0.05, 0.13];
const ImageSlices: React.FC<{ el: ImageEl; f: number; calm: boolean }> = ({ el, f, calm }) => {
  const w = el.width ?? el.height;
  const x0 = el.align === 'left' ? PAD : el.align === 'right' ? W - PAD - w : (W - w) / 2;
  const m = 40;
  const L = x0 - m, R = x0 + w + m;
  const lock = el.lock ?? (calm ? 40 : 18);
  const bands = (ff: number) => [0, 1, 2, 3].map((i) => {
    const a = i * (calm ? CALM.sliceStagger : 2);
    if (ff < a) return null;
    const top = (el.height * i) / 4, bot = (el.height * (i + 1)) / 4;
    const side = i % 2 === 0 ? 1 : -1;
    const resid = IMG_OFF[i] * el.height * (calm ? 0.35 : 0.5);
    let x: number;
    if (calm) {
      const q = calmEase(clamp01((ff - a) / CALM.sliceIn));
      x = side * (R - L) * (1 - q) + resid * q;
      if (ff >= lock) x = resid * (1 - easeInOut(clamp01((ff - lock) / CALM.sliceLock)));
    } else {
      const q = easeOut(clamp01((ff - a) / 7));
      x = side * 1300 * (1 - q) + resid * q;
      if (ff >= lock) x = resid * (1 - osc(ff - lock - i * 0.6, 0.95, 0.42));
    }
    const clip = calm ? poly([[L, top], [R, top], [R, bot], [L, bot]]) : poly([[-400, top], [W + 400, top], [W + 400, bot], [-400, bot]]);
    return (
      <div key={i} style={{ position: 'absolute', inset: 0, clipPath: clip }}>
        <Img src={staticFile(el.src)} style={{ position: 'absolute', left: x0, top: 0, width: w, height: el.height, transform: `translateX(${x}px)` }} />
      </div>
    );
  });
  return (
    <div style={{ position: 'absolute', left: 0, top: el.y, width: W, height: el.height }}>
      {calm ? bands(f) : <Accum f={f} active={f > 0 && f < 14} samples={10} render={(ff) => <>{bands(ff)}</>} />}
    </div>
  );
};

export const ImageElement: React.FC<{ el: ImageEl; f: number; exit: number }> = ({ el, f, exit }) => {
  const justify = el.align === 'left' ? 'flex-start' : el.align === 'right' ? 'flex-end' : 'center';
  const calm = useTempo() === 'calm';
  if (el.motion === 'slices' && exit === 0) return <ImageSlices el={el} f={f} calm={calm} />;
  const inP = calm ? calmEase(clamp01(f / CALM.slide)) : osc(f);
  const y = el.motion === 'cut' ? 0 : (1 - inP) * el.height * 1.05 + easeIn(exit) * el.height * 1.05;
  return (
    <div style={{ position: 'absolute', left: 0, top: el.y, width: W, height: el.height,
      clipPath: poly([[-100, -el.height], [W + 100, -el.height], [W + 100, el.height], [-100, el.height]]) }}>
      <div style={{ display: 'flex', justifyContent: justify, padding: `0 ${PAD}px`, transform: `translateY(${y}px)` }}>
        <Img src={staticFile(el.src)} style={{ height: el.height }} />
      </div>
    </div>
  );
};
