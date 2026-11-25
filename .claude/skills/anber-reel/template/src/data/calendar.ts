import { PAD, W } from '../theme';
import type { El, TextEl } from '../types';

/**
 * Month-grid calendar (weeks start on Sunday, RTL: Sunday is the right-most column),
 * expanded into primitives: header labels, grid rules that draw, day numbers that rise,
 * a highlight band that wipes in reading order, and an outline box for a range.
 */
export type CalendarOpts = {
  at: number;
  y: number; // top of the header row
  start: string; // YYYY-MM-DD, must be a Sunday
  weeks: number;
  cellH: number;
  headH?: number;
  dayNames?: string[]; // Sunday..Saturday
  monthNames: Record<number, string>; // 0-11 -> label shown under day 1
  month: number; // the "current" month (others are dimmed) — 0-11
  numSize?: number;
  band?: { from: string; to: string; at: number; dur?: number };
  outline?: { from: string; to: string; at: number };
};

const AR_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const DAY = 86400000;
const parse = (s: string) => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));

export const calendar = (o: CalendarOpts): El[] => {
  const headH = o.headH ?? 64;
  const colW = (W - 2 * PAD) / 7;
  const xR = (d: number) => W - PAD - d * colW;
  const xL = (d: number) => xR(d) - colW;
  const top = o.y + headH;
  const bottom = top + o.weeks * o.cellH;
  const t0 = parse(o.start);
  if (new Date(t0).getUTCDay() !== 0) throw new Error('calendar start must be a Sunday');
  const idx = (s: string) => Math.round((parse(s) - t0) / DAY);
  const els: El[] = [];
  const names = o.dayNames ?? AR_DAYS;

  // header + grid
  els.push({ kind: 'rule', y: o.y, at: o.at, from: 'right' });
  names.forEach((n, d) => {
    els.push({ text: n, role: 'small', size: 26, at: o.at + 2 + d * 1.2, y: o.y + (headH - 35) / 2, x0: xL(d), x1: xR(d), align: 'center' });
  });
  for (let r = 0; r <= o.weeks; r++) els.push({ kind: 'rule', y: top + r * o.cellH, at: o.at + 4 + r * 1.5, from: 'right' });
  for (let c = 1; c < 7; c++) els.push({ kind: 'rule', vertical: true, x: xR(c), y: o.y, y1: bottom, at: o.at + 6 + c });

  // highlight band (under the numbers), one rect per week row, wiping in reading order
  if (o.band) {
    const a = idx(o.band.from), b = idx(o.band.to);
    const rows = new Map<number, [number, number]>();
    for (let i = a; i <= b; i++) {
      const r = Math.floor(i / 7), d = i % 7;
      const cur = rows.get(r);
      rows.set(r, cur ? [Math.min(cur[0], d), Math.max(cur[1], d)] : [d, d]);
    }
    const total = b - a + 1;
    const dur = o.band.dur ?? 20;
    let acc = 0;
    [...rows.entries()].sort((p, q) => p[0] - q[0]).forEach(([r, [d0, d1]]) => {
      const n = d1 - d0 + 1;
      els.push({ kind: 'rect', x: xL(d1) + 3, y: top + r * o.cellH + 3, w: n * colW - 6, h: o.cellH - 6,
        at: o.band!.at + (acc / total) * dur, dur: Math.max(4, (n / total) * dur), from: 'right' });
      acc += n;
    });
  }

  // day numbers (+ month label on the 1st)
  const ns = o.numSize ?? 40;
  for (let i = 0; i < o.weeks * 7; i++) {
    const dt = new Date(t0 + i * DAY);
    const r = Math.floor(i / 7), d = i % 7;
    const at = o.at + 12 + r * 3 + d * 0.7;
    const inMonth = dt.getUTCMonth() === o.month;
    const inBand = o.band ? i >= idx(o.band.from) && i <= idx(o.band.to) : false;
    const num: TextEl = { text: String(dt.getUTCDate()), role: 'small', size: ns, at, y: top + r * o.cellH + 8,
      x0: xL(d) + 14, x1: xR(d) - 16, align: 'right', color: inBand ? 'onAccent' : inMonth ? undefined : 'dim' };
    els.push(num);
    if (dt.getUTCDate() === 1 && o.monthNames[dt.getUTCMonth()]) {
      els.push({ text: o.monthNames[dt.getUTCMonth()], role: 'small', size: 22, at: at + 2, y: top + r * o.cellH + o.cellH - 40,
        x0: xL(d) + 10, x1: xR(d) - 14, align: 'right', color: inMonth ? undefined : 'dim' });
    }
  }

  // outline box around a range inside one week row
  if (o.outline) {
    const a = idx(o.outline.from), b = idx(o.outline.to);
    const r = Math.floor(a / 7), d0 = a % 7, d1 = b % 7;
    els.push({ kind: 'box', x: xL(d1) + 5, y: top + r * o.cellH + 5, w: (d1 - d0 + 1) * colW - 10, h: o.cellH - 10, at: o.outline.at, width: 4 });
  }
  return els;
};

/** Pixel geometry helpers for placing extra marks on the grid from a config. */
export const calendarGeo = (o: Pick<CalendarOpts, 'y' | 'start' | 'cellH' | 'headH'>) => {
  const headH = o.headH ?? 64;
  const colW = (W - 2 * PAD) / 7;
  const t0 = parse(o.start);
  return (date: string) => {
    const i = Math.round((parse(date) - t0) / DAY);
    const r = Math.floor(i / 7), d = i % 7;
    return { x: W - PAD - (d + 1) * colW, y: o.y + headH + r * o.cellH, w: colW, h: o.cellH };
  };
};
