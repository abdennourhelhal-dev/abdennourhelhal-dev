import React from 'react';
import { Img, staticFile } from 'remotion';
import { PAD, RULE_THICKNESS, W } from '../theme';
import { resolveColor, usePalette } from '../palette';
import type { BoxEl, ImageEl, RectEl, RuleEl } from '../types';
import { clamp01, easeIn, easeOut, osc, poly } from './helpers';

/** Rules draw in (scaleX / scaleY), can kick when something lands, retract on exit. */
export const RuleElement: React.FC<{ el: RuleEl; f: number; sf: number; exit: number }> = ({ el, f, sf, exit }) => {
  const pal = usePalette();
  const color = resolveColor(pal, el.color, pal.rule);
  const p = easeOut(clamp01(f / 9)) * (1 - easeIn(exit));
  let kick = 0;
  if (el.kick !== undefined && sf >= el.kick) {
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
  if (exit >= 1) return null;
  const p = easeOut(clamp01(f / (el.dur ?? 12)));
  const sw = el.width ?? 4;
  return (
    <svg style={{ position: 'absolute', left: el.x - sw, top: el.y - sw, overflow: 'visible' }} width={el.w + sw * 2} height={el.h + sw * 2}>
      <rect x={sw} y={sw} width={el.w} height={el.h} fill="none" stroke={resolveColor(pal, el.stroke, pal.small)} strokeWidth={sw}
        pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
    </svg>
  );
};

export const ImageElement: React.FC<{ el: ImageEl; f: number; exit: number }> = ({ el, f, exit }) => {
  const justify = el.align === 'left' ? 'flex-start' : el.align === 'right' ? 'flex-end' : 'center';
  const y = el.motion === 'cut' ? 0 : (1 - osc(f)) * el.height * 1.05 + easeIn(exit) * el.height * 1.05;
  return (
    <div style={{ position: 'absolute', left: 0, top: el.y, width: W, height: el.height,
      clipPath: poly([[-100, -el.height], [W + 100, -el.height], [W + 100, el.height], [-100, el.height]]) }}>
      <div style={{ display: 'flex', justifyContent: justify, padding: `0 ${PAD}px`, transform: `translateY(${y}px)` }}>
        <Img src={staticFile(el.src)} style={{ height: el.height }} />
      </div>
    </div>
  );
};
