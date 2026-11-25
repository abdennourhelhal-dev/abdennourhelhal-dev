import React from 'react';

/**
 * Motion tempo.
 *  punchy (default): per-letter / per-sub-word rises with overshoot, blur snaps and slices.
 *  calm ("very simple"): every line slides up once through its mask, slowly, no bounce;
 *         rules and outline boxes draw slowly; snap and slices stay but gentle, without blur.
 * Page transitions, paper sheets and accent bands are the same in both tempos.
 */
export type Tempo = 'punchy' | 'calm';
export const TempoCtx = React.createContext<Tempo>('punchy');
export const useTempo = () => React.useContext(TempoCtx);

export const CALM = {
  slide: 24, // text slide-in
  out: 14, // text exit
  rule: 20,
  box: 20,
  snapMove: 18,
  sliceIn: 26,
  sliceStagger: 4,
  sliceLock: 14,
};
