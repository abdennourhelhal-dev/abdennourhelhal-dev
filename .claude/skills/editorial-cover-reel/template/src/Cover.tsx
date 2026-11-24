import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Element, layerOf } from './motion/Element';
import { Accum, clamp01, easeInOut, poly } from './motion/helpers';
import { PaletteCtx } from './palette';
import { ELECTRIC, H, W } from './theme';
import { config } from './cover.config';
import type { Scene } from './types';

const TDEF = 14;
const tFrames = (s?: Scene) => (s && s.transitionIn && s.transitionIn !== 'cut' ? s.transitionFrames ?? TDEF : 0);

/**
 * One scene = one full-frame layer (its own flat background). Transitions move or clip the
 * incoming layer over the outgoing one — never a fade:
 *  slideUp  next page slides up from the bottom, accent rule on its leading edge
 *  push     RTL page turn: incoming from the left, outgoing pushed out to the right
 *  diagonal slanted wipe from the right with an accent edge line
 */
const SceneLayer: React.FC<{ scene: Scene; next?: Scene; sf: number }> = ({ scene, next, sf }) => {
  const pal = (scene.theme === 'inside' ? config.palettes?.inside : config.palettes?.cover) ?? ELECTRIC;
  const T = tFrames(scene);
  const kind = scene.transitionIn ?? 'cut';
  const Tn = tFrames(next);
  const pushOut = next?.transitionIn === 'push';
  const ordered = scene.els.map((el, i) => ({ el, i })).sort((a, b) => layerOf(a.el) - layerOf(b.el) || a.i - b.i);

  const renderAt = (ff: number) => {
    const pin = T ? easeInOut(clamp01(ff / T)) : 1;
    const pout = pushOut && ff >= scene.duration ? easeInOut(clamp01((ff - scene.duration) / Tn)) : 0;
    let transform = '';
    let clipPath: string | undefined;
    let edge: React.ReactNode = null;
    const inMove = T > 0 && ff < T;
    if (kind === 'slideUp') {
      transform = `translateY(${H * (1 - pin)}px)`;
      if (inMove) edge = <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: 5, background: pal.accent }} />;
    } else if (kind === 'push') {
      transform = `translateX(${-W * (1 - pin)}px)`;
      if (inMove) edge = <div style={{ position: 'absolute', right: 0, top: 0, width: 5, height: H, background: pal.accent }} />;
    } else if (kind === 'diagonal' && inMove) {
      const xt = W - (W + 520) * pin, xb = xt + 520;
      clipPath = poly([[xt, -10], [W + 10, -10], [W + 10, H + 10], [xb, H + 10]]);
      edge = (
        <svg style={{ position: 'absolute', inset: 0 }} width={W} height={H}>
          <line x1={xt} y1={-10} x2={xb} y2={H + 10} stroke={pal.accent} strokeWidth={6} />
        </svg>
      );
    }
    if (pout > 0) transform = `translateX(${W * pout}px)`;
    const life = clamp01(ff / scene.duration);
    const camera = `translateY(${-(scene.drift ?? 0) * life}px) scale(${1 + (scene.push ?? 0) * life})`;
    return (
      <div style={{ position: 'absolute', inset: 0, background: pal.bg, transform, clipPath, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, transform: camera, transformOrigin: '50% 1480px' }}>
          {ordered.map(({ el, i }) => <Element key={i} el={el} sf={ff} />)}
        </div>
        {kind === 'diagonal' ? null : edge}
        {kind === 'diagonal' && edge}
      </div>
    );
  };

  const moving = (T > 0 && sf < T + 0.5) || (pushOut && sf >= scene.duration);
  return (
    <PaletteCtx.Provider value={pal}>
      <Accum f={sf} active={moving && kind !== 'diagonal'} samples={20} render={renderAt} />
    </PaletteCtx.Provider>
  );
};

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {config.scenes.map((s, i) => {
        const next = config.scenes[i + 1];
        const sf = frame - s.from;
        if (sf < 0 || sf >= s.duration + tFrames(next)) return null;
        return <SceneLayer key={i} scene={s} next={next} sf={sf} />;
      })}
    </AbsoluteFill>
  );
};
