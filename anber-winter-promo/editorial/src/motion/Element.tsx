import React from 'react';
import type { El } from '../types';
import { clamp01 } from './helpers';
import { PaperElement } from './Paper';
import { BoxElement, ImageElement, RectElement, RuleElement } from './Shapes';
import { TextElement } from './Text';
import { CALM, useTempo } from './tempo';

/**
 * Renders any element at scene-local frame `sf` (fractional allowed).
 * Hidden before `at`; exits over `outDur` frames from `out`; hard-cut off at `until`.
 */
export const Element: React.FC<{ el: El; sf: number }> = ({ el, sf }) => {
  const calm = useTempo() === 'calm';
  if (sf < el.at || (el.until !== undefined && sf >= el.until)) return null;
  const f = sf - el.at;
  const outDur = el.outDur ?? (el.kind === 'paper' ? 10 : calm ? CALM.out : 8);
  const exit = el.out !== undefined ? clamp01((sf - el.out) / outDur) : 0;
  if (exit >= 1) return null;
  switch (el.kind) {
    case 'rule': return <RuleElement el={el} f={f} sf={sf} exit={exit} />;
    case 'rect': return <RectElement el={el} f={f} exit={exit} />;
    case 'box': return <BoxElement el={el} f={f} exit={exit} />;
    case 'image': return <ImageElement el={el} f={f} exit={exit} />;
    case 'paper': return <PaperElement el={el} f={f} sf={sf} exit={exit} />;
    default: return <TextElement el={el} f={f} exit={exit} />;
  }
};

/** Paint order: bands under rules under everything else (config order kept within a layer). */
export const layerOf = (el: El) => (el.kind === 'rect' ? 0 : el.kind === 'rule' ? 1 : 2);
