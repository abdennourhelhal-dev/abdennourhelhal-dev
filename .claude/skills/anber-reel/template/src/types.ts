import type { Palette, Role } from './theme';
import type { Tempo } from './motion/tempo';

/**
 * Motion vocabulary (no fades — every reveal is a mask, clip or move):
 *  rise   letters rise through a baseline mask with spring overshoot
 *         (Latin per letter; Arabic per sub-word, split at non-joining letters)
 *  snap   starts huge at screen centre, anticipates, snaps into its small slot with blur, settles
 *  wipe   slanted clip wipe; a thin line leads the edge and exits past the word
 *  under  slides out from under the element above (clip edge = `under` y)
 *  slices four horizontal slices fly in (blurred), land off-register, then lock
 *  cut    hard cut on
 * Any element can leave with `out` (scene frame): text sinks under its mask, rules retract,
 * papers slide away.
 */
export type Motion = 'rise' | 'snap' | 'wipe' | 'under' | 'slices' | 'cut';
export type Align = 'left' | 'right' | 'center';

type Base = { at: number; until?: number; out?: number; outDur?: number };

export type TextEl = Base & {
  kind?: 'text';
  text: string;
  role: Role;
  y: number; // top of the text row
  size?: number;
  max?: number; // auto-fit up to this size
  width?: number; // auto-fit width (default: column width)
  x0?: number; // column box (default PAD .. W-PAD)
  x1?: number;
  align?: Align;
  motion?: Motion;
  color?: string; // palette token or CSS colour
  hold?: number; // snap
  hugeY?: number; // snap
  under?: number; // under
  lock?: number; // slices
};

export type RuleEl = Base & {
  kind: 'rule';
  y: number;
  x0?: number;
  x1?: number;
  from?: 'left' | 'right';
  vertical?: boolean; // vertical rule at x, from y to y1
  x?: number;
  y1?: number;
  kick?: number; // scene frame: small settle wobble (e.g. when slices lock)
  color?: string;
};

export type RectEl = Base & {
  kind: 'rect';
  x: number; y: number; w: number; h: number;
  fill?: string; // default accent
  from?: 'left' | 'right' | 'top' | 'bottom';
  dur?: number;
};

export type BoxEl = Base & {
  kind: 'box';
  x: number; y: number; w: number; h: number;
  stroke?: string; // default small-type colour
  width?: number;
  dur?: number;
};

export type ImageEl = Base & {
  kind: 'image';
  src: string; // file in /public
  y: number;
  height: number;
  width?: number; // needed for `slices` (rendered width at `height`)
  align?: Align;
  motion?: 'rise' | 'cut' | 'slices'; // slices: e.g. a logo as the final lockup
  lock?: number; // slices
  zoom?: number; // rise: start scale that settles to 1 (e.g. 1.08) — smooth logo reveal
  dur?: number; // rise: frames (calm default 30)
};

export type PaperEl = Base & {
  kind: 'paper';
  src?: string | null; // page image in /public; null -> clearly-labelled placeholder sheet
  label: string; // placeholder caption / alt
  x: number; y: number; w: number; // sheet box (A4 ratio)
  rot?: number; // resting rotation (deg)
  from?: 'left' | 'right' | 'bottom';
  tag?: string; // small chip, e.g. "bac 2026\nmaths" (\n = two lines)
  tagSide?: 'left' | 'right'; // corner of the chip (use 'right' when sheets overlap right→left)
  callout?: { x: number; y: number; w: number; h: number; at: number }; // fractions of the sheet
};

export type El = TextEl | RuleEl | RectEl | BoxEl | ImageEl | PaperEl;

export type Transition = 'cut' | 'slideUp' | 'push' | 'diagonal';

export type Scene = {
  from: number;
  duration: number;
  theme?: 'cover' | 'inside';
  transitionIn?: Transition;
  transitionFrames?: number;
  drift?: number; // px of slow upward drift across the scene (living hold)
  push?: number; // slow camera push (scale delta across the scene)
  els: El[];
};

export type CoverConfig = {
  durationInFrames: number;
  palettes?: { cover?: Palette; inside?: Palette };
  tempo?: Tempo; // 'punchy' (default) | 'calm'
  scenes: Scene[];
  cues?: [number, string, number?][]; // SFX: [frame, file in public/sfx without .wav, volume 0-1]
};
