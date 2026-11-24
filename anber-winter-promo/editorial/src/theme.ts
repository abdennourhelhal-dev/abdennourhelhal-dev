// Editorial-cover style tokens. Change here, not in components.
export const W = 1080;
export const H = 1920;
export const FPS = 30;

export const BLUE = '#2433F0';
export const WHITE = '#FFFFFF';
export const RULE_COLOR = 'rgba(255,255,255,0.55)'; // static 55% rule — never animated
export const RULE_THICKNESS = 2;

export const PAD = 64; // side margin
export const SAFE_BOTTOM = Math.round(H * 0.8); // 1536: bottom fifth stays empty

export type Role = 'huge' | 'small';

// Latin font first, Arabic counterpart second (the browser falls back per glyph).
export const ROLE: Record<Role, { family: string; weight: number; style: 'italic' | 'normal'; lineHeight: number; tracking: number }> = {
  huge: { family: '"Instrument Serif", "Amiri", serif', weight: 400, style: 'italic', lineHeight: 1.12, tracking: -0.02 },
  small: { family: '"Schibsted Grotesk", "Cairo", sans-serif', weight: 900, style: 'normal', lineHeight: 1.35, tracking: 0.01 },
};
export const SMALL_SIZE = 50;
