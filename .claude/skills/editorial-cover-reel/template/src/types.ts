import type { Role } from './theme';

/**
 * Motion vocabulary (no fades — every reveal is a mask, clip or move):
 *  rise   letters rise through a baseline mask with spring overshoot
 *  snap   starts huge at screen centre, then snaps down into its small kicker slot with motion blur
 *  wipe   slanted clip wipe with a thin white line riding the edge
 *  under  slides out from under the element above (clip edge = `under` y)
 *  slices four horizontal slices land off-register, then lock
 *  cut    hard cut on
 */
export type Motion = 'rise' | 'snap' | 'wipe' | 'under' | 'slices' | 'cut';
export type Align = 'left' | 'right' | 'center';

export type TextEl = {
  kind?: 'text';
  text: string;
  role: Role;
  /** frame (relative to scene start) the motion begins */
  at: number;
  /** optional hard-cut-off frame (relative to scene) */
  until?: number;
  /** top of the text row, px */
  y: number;
  /** font size px; for huge words prefer `max` + auto-fit */
  size?: number;
  /** auto-fit: largest size up to `max` that fits the width */
  max?: number;
  /** max width for auto-fit (default full width minus margins) */
  width?: number;
  align?: Align;
  motion?: Motion;
  /** snap: frames spent huge before snapping; centre y of the huge state */
  hold?: number;
  hugeY?: number;
  /** under: canvas y of the clipping edge (bottom of the word above) */
  under?: number;
  /** slices: frame (relative to `at`) when the slices lock into register */
  lock?: number;
};

export type RuleEl = {
  kind: 'rule';
  y: number;
  at: number;
  until?: number;
  x0?: number;
  x1?: number;
  /** draw direction */
  from?: 'left' | 'right';
};

export type ImageEl = {
  kind: 'image';
  src: string; // file in /public
  at: number;
  until?: number;
  y: number;
  height: number;
  align?: Align;
  motion?: 'rise' | 'cut';
};

export type El = TextEl | RuleEl | ImageEl;

export type Scene = { from: number; duration: number; els: El[] };

export type CoverConfig = {
  durationInFrames: number;
  scenes: Scene[];
  /** reserved for SFX: [frame, sfxName] — not rendered yet */
  cues?: [number, string][];
};
