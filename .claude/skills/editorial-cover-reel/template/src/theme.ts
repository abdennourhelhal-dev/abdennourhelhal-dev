// Editorial-cover style tokens. Geometry + type roles live here; colours live in palettes
// (default electric blue; a brand palette can override per config).
export const W = 1080;
export const H = 1920;
export const FPS = 30;

export const PAD = 64; // side margin
export const SAFE_BOTTOM = Math.round(H * 0.8); // 1536: bottom fifth stays empty
export const RULE_THICKNESS = 2;

export type Role = 'huge' | 'small';

// Latin font first, Arabic counterpart second (the browser falls back per glyph).
export const ROLE: Record<Role, { family: string; weight: number; style: 'italic' | 'normal'; lineHeight: number; tracking: number }> = {
  huge: { family: '"Instrument Serif", "Amiri", serif', weight: 400, style: 'italic', lineHeight: 1.12, tracking: -0.02 },
  small: { family: '"Schibsted Grotesk", "Cairo", sans-serif', weight: 900, style: 'normal', lineHeight: 1.35, tracking: 0.01 },
};
export const SMALL_SIZE = 50;

export type Palette = {
  bg: string; // flat background
  huge: string; // huge-role type
  small: string; // small-role type
  rule: string; // static 55% rule colour (never animated)
  accent: string; // highlight bands, callouts, transition edge lines
  onAccent: string; // type sitting on an accent band
  dim: string; // secondary data (other-month days, sources)
};

export const ELECTRIC: Palette = {
  bg: '#2433F0', huge: '#FFFFFF', small: '#FFFFFF', rule: 'rgba(255,255,255,0.55)',
  accent: '#FFFFFF', onAccent: '#2433F0', dim: 'rgba(255,255,255,0.55)',
};
