import React from 'react';
import { Img, staticFile } from 'remotion';
import { ROLE, SAFE_BOTTOM, W } from '../theme';
import { usePalette } from '../palette';
import type { PaperEl } from '../types';
import { Accum, clamp01, easeIn, easeOut, osc } from './helpers';

const A4 = Math.SQRT2;

const Sheet: React.FC<{ el: PaperEl; h: number }> = ({ el, h }) => {
  const pal = usePalette();
  if (el.src) {
    return <Img src={staticFile(el.src)} style={{ width: el.w, height: h, objectFit: 'cover', objectPosition: 'top', display: 'block' }} />;
  }
  // clearly-labelled placeholder until the real page image is supplied
  return (
    <div style={{ width: el.w, height: h, background: '#FFFFFF', position: 'relative' }}>
      {Array.from({ length: 16 }, (_, i) => (
        <div key={i} style={{ position: 'absolute', right: el.w * 0.09, top: h * (0.1 + i * 0.05), height: Math.max(3, el.w * 0.008),
          width: el.w * (i % 4 === 0 ? 0.5 : 0.82 - (i % 3) * 0.08), background: 'rgba(15,20,33,0.16)' }} />
      ))}
      <div dir="rtl" style={{ position: 'absolute', left: 0, right: 0, top: h * 0.44, textAlign: 'center', color: pal.dim,
        fontFamily: ROLE.small.family, fontWeight: 900, fontSize: Math.round(el.w * 0.055) }}>[ {el.label} ]</div>
    </div>
  );
};

const paperAt = (el: PaperEl, f: number, sf: number, exit: number, pal: ReturnType<typeof usePalette>) => {
  const h = el.w * A4;
  const from = el.from ?? 'right';
  const k = 1 - osc(f, 0.42, 0.62); // 1 → 0 with a slight overshoot
  const out = easeIn(exit);
  let dx = 0, dy = 0;
  if (from === 'right') dx = 1150 * k - 1150 * out;
  if (from === 'left') dx = -1150 * k + 1150 * out;
  if (from === 'bottom') { dy = 1400 * k; dx = (el.x + el.w / 2 > W / 2 ? 1150 : -1150) * out; }
  const rot = (el.rot ?? 0) + (from === 'left' ? -9 : 9) * k;
  const c = el.callout;
  const cp = c ? easeOut(clamp01((sf - c.at) / 12)) : 0;
  const tagP = easeOut(clamp01((f - 11) / 6));
  const sheetNode = (
    <div style={{ position: 'absolute', left: el.x, top: el.y, width: el.w, height: h,
      transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)`, transformOrigin: '50% 50%' }}>
      <div style={{ position: 'absolute', inset: 0, outline: `2px solid ${pal.rule}`, background: '#FFFFFF' }}>
        <Sheet el={el} h={h} />
      </div>
      {c && sf >= c.at && (
        <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={el.w} height={h}>
          <rect x={c.x * el.w} y={c.y * h} width={c.w * el.w} height={c.h * h} fill="none" stroke={pal.accent} strokeWidth={7}
            pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - cp} />
        </svg>
      )}
      {el.tag && tagP > 0 && (
        <div style={{ position: 'absolute', ...(el.tagSide === 'right' ? { right: -10 } : { left: -10 }), top: el.tag.includes('\n') ? -44 : -26, background: pal.small, color: pal.bg, padding: '3px 12px 6px',
          fontFamily: ROLE.small.family, fontWeight: 900, fontSize: 22, lineHeight: 1.08, letterSpacing: '0.01em', whiteSpace: 'pre',
          transform: `scaleX(${tagP})`, transformOrigin: el.tagSide === 'right' ? 'right center' : 'left center' }}>
          {el.tag}
        </div>
      )}
    </div>
  );
  // sheets entering from the bottom rise through a mask line, so they never cross the bottom fifth
  if (from !== 'bottom') return sheetNode;
  return <div style={{ position: 'absolute', inset: 0, clipPath: `polygon(-400px -400px, ${W + 400}px -400px, ${W + 400}px ${SAFE_BOTTOM - 6}px, -400px ${SAFE_BOTTOM - 6}px)` }}>{sheetNode}</div>;
};

/** A real exam page as a sheet: slides in with blur + overshoot, optional callout box and tag chip. */
export const PaperElement: React.FC<{ el: PaperEl; f: number; sf: number; exit: number }> = ({ el, f, sf, exit }) => {
  const pal = usePalette();
  const outDur = el.outDur ?? 10;
  const moving = (f >= 0 && f < 13) || (exit > 0 && exit < 1);
  return (
    <Accum f={f} active={moving} samples={10} render={(ff) => {
      const e = exit > 0 ? clamp01(exit + (ff - f) / outDur) : 0;
      return paperAt(el, ff, sf + (ff - f), e, pal);
    }} />
  );
};
