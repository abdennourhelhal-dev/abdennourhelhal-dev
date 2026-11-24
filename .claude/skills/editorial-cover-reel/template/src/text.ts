import { PAD, ROLE, Role, W } from './theme';

export const isArabic = (s: string) => /[؀-ۿ]/.test(s);
// Latin copy is always lowercase in this style; Arabic has no case.
export const prep = (s: string) => (isArabic(s) ? s : s.toLowerCase());

let ctx: CanvasRenderingContext2D | null = null;
const cache = new Map<string, number>();

export const fontCss = (role: Role, size: number) => {
  const r = ROLE[role];
  return `${r.style} ${r.weight} ${size}px ${r.family}`;
};

/** Width in px of `text` set in `role` at `size` (shaping-aware, via canvas). */
export const measure = (text: string, role: Role, size: number) => {
  const key = `${role}|${size}|${text}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  if (!ctx) ctx = document.createElement('canvas').getContext('2d');
  const c = ctx!;
  c.font = fontCss(role, size);
  (c as any).letterSpacing = isArabic(text) ? '0px' : `${ROLE[role].tracking * size}px`;
  c.direction = isArabic(text) ? 'rtl' : 'ltr';
  const w = c.measureText(text).width;
  if (document.fonts.check(fontCss(role, size), text)) cache.set(key, w);
  return w;
};

/** Largest size <= maxSize that fits `maxWidth`. */
export const fit = (text: string, role: Role, maxSize: number, maxWidth = W - 2 * PAD) => {
  const w = measure(text, role, 100);
  return Math.min(maxSize, Math.floor((maxWidth / w) * 100));
};
