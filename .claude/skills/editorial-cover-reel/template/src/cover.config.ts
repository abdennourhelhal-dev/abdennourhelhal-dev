import type { CoverConfig } from './types';

// Demo line: "https://anber-school.vercel.app/ar"
// split -> small "https://" · huge "anber-school" (set on two rows) · small ".vercel.app" · huge "/ar"
// 30s = build the cover, recompose it twice, final lockup with a 1.5s hold.
// Rows: keep y + row height < 1536 (bottom fifth empty).

export const config: CoverConfig = {
  durationInFrames: 900,
  scenes: [
    // ── cover 1: build (0–7.5s) ────────────────────────────────────────────
    {
      from: 0, duration: 225,
      els: [
        { text: 'https://', role: 'small', motion: 'snap', at: 0, hold: 26, hugeY: 760, y: 200, align: 'left' },
        { kind: 'rule', y: 300, at: 30, from: 'left' },
        { text: 'anber-', role: 'huge', motion: 'wipe', at: 44, y: 330, max: 360, align: 'left' },
        { kind: 'rule', y: 640, at: 52, from: 'right' },
        { text: 'school', role: 'huge', motion: 'rise', at: 70, y: 650, max: 360, align: 'right' },
        { kind: 'rule', y: 960, at: 80, from: 'left' },
        { text: '.vercel.app', role: 'small', motion: 'under', at: 104, y: 1068, under: 1060, align: 'right' },
        { kind: 'rule', y: 1300, at: 128, from: 'right' },
        { text: '/ar', role: 'huge', motion: 'slices', at: 134, lock: 22, y: 1150, max: 320, align: 'left' },
      ],
    },
    // ── cover 2: recompose, stacked right/under (7.5–14.5s) ────────────────
    {
      from: 225, duration: 210,
      els: [
        { kind: 'rule', y: 260, at: 0, from: 'right' },
        { text: 'https://', role: 'small', motion: 'rise', at: 4, y: 290, align: 'right' },
        { text: 'anber-', role: 'huge', motion: 'rise', at: 20, y: 380, max: 420, align: 'left' },
        { kind: 'rule', y: 740, at: 34, from: 'left' },
        { text: 'school', role: 'huge', motion: 'under', at: 48, y: 800, under: 830, max: 420, align: 'right' },
        { kind: 'rule', y: 1200, at: 70, from: 'right' },
        { text: '.vercel.app', role: 'small', motion: 'wipe', at: 92, y: 1300, align: 'left' },
        { text: '/ar', role: 'huge', motion: 'rise', at: 118, y: 1240, max: 240, align: 'right' },
      ],
    },
    // ── cover 3: recompose, centred axis (14.5–21.5s) ──────────────────────
    {
      from: 435, duration: 210,
      els: [
        { text: 'https://', role: 'small', motion: 'wipe', at: 0, y: 190, align: 'center' },
        { kind: 'rule', y: 290, at: 6, from: 'left' },
        { text: 'anber-', role: 'huge', motion: 'rise', at: 18, y: 300, max: 400, align: 'center' },
        { kind: 'rule', y: 690, at: 30, from: 'right' },
        { text: 'school', role: 'huge', motion: 'wipe', at: 44, y: 700, max: 400, align: 'center' },
        { kind: 'rule', y: 1100, at: 60, from: 'left' },
        { text: '.vercel.app', role: 'small', motion: 'under', at: 84, y: 1130, under: 1110, align: 'center' },
        { text: '/ar', role: 'huge', motion: 'rise', at: 108, y: 1210, max: 270, align: 'center' },
        { kind: 'rule', y: 1480, at: 116, from: 'right' },
      ],
    },
    // ── cover 4: final lockup, last word in slices, 1.5s hold (21.5–30s) ───
    {
      from: 645, duration: 255,
      els: [
        { text: 'https://', role: 'small', motion: 'snap', at: 0, hold: 24, hugeY: 760, y: 200, align: 'right' },
        { kind: 'rule', y: 300, at: 30, from: 'right' },
        { text: 'anber-', role: 'huge', motion: 'wipe', at: 42, y: 320, max: 340, align: 'right' },
        { kind: 'rule', y: 620, at: 52, from: 'left' },
        { text: 'school', role: 'huge', motion: 'rise', at: 66, y: 630, max: 340, align: 'left' },
        { kind: 'rule', y: 930, at: 76, from: 'right' },
        { text: '.vercel.app', role: 'small', motion: 'under', at: 98, y: 1020, under: 1010, align: 'left' },
        { kind: 'rule', y: 1290, at: 132, from: 'left' },
        { text: '/ar', role: 'huge', motion: 'slices', at: 140, lock: 24, y: 1100, max: 380, align: 'right' },
        // slices settle by ~frame 180 → hold to 255 (≥ 1.5s)
      ],
    },
  ],
};
