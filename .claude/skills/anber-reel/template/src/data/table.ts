import { PAD, ROLE, W } from '../theme';
import type { El, TextEl } from '../types';

/**
 * Editorial table expanded into primitives: rules draw row by row, cells rise in
 * reading order. Columns are given right → left (RTL). Cells need an explicit size.
 */
export type Cell = Omit<TextEl, 'y' | 'x0' | 'x1' | 'at'> & { dy?: number; delay?: number };
export type TableOpts = {
  at: number;
  y: number;
  cols: number[]; // widths, right → left; should sum to W - 2*PAD
  header?: { h: number; cells: (string | null)[] };
  rows: { h: number; at?: number; cells: (Cell | Cell[] | null)[] }[];
  vRules?: boolean;
  padX?: number;
};

export const table = (o: TableOpts): El[] => {
  const padX = o.padX ?? 18;
  const right: number[] = [];
  let x = W - PAD;
  for (const w of o.cols) { right.push(x); x -= w; }
  const left = right.map((r, i) => r - o.cols[i]);
  const els: El[] = [];
  let y = o.y;

  if (o.header) {
    els.push({ kind: 'rule', y, at: o.at, from: 'right' });
    o.header.cells.forEach((t, c) => {
      if (!t) return;
      els.push({ text: t, role: 'small', size: 24, color: 'dim', at: o.at + 2 + c * 1.5, y: y + (o.header!.h - 24 * ROLE.small.lineHeight) / 2,
        x0: left[c] + padX, x1: right[c] - padX });
    });
    y += o.header.h;
  }

  o.rows.forEach((row, r) => {
    const at = row.at ?? o.at + 6 + r * 10;
    els.push({ kind: 'rule', y, at, from: 'right' });
    row.cells.forEach((cell, c) => {
      if (!cell) return;
      const list = Array.isArray(cell) ? cell : [cell];
      let cy = 0;
      const heights = list.map((k) => Math.round((k.size ?? 40) * ROLE[k.role].lineHeight));
      const total = heights.reduce((a, b) => a + b, 0);
      cy = y + (row.h - total) / 2;
      list.forEach((k, j) => {
        const { dy, delay, ...rest } = k;
        els.push({ ...rest, at: at + 3 + c * 3 + j * 4 + (delay ?? 0), y: cy + (dy ?? 0), x0: left[c] + padX, x1: right[c] - padX });
        cy += heights[j];
      });
    });
    y += row.h;
  });
  els.push({ kind: 'rule', y, at: (o.rows[o.rows.length - 1]?.at ?? o.at) + 6, from: 'right' });
  if (o.vRules) {
    for (let c = 1; c < o.cols.length; c++) {
      els.push({ kind: 'rule', vertical: true, x: right[c], y: o.y, y1: y, at: o.at + 4 + c * 2 });
    }
  }
  return els;
};

/** x-extent of a column (right → left index), for placing papers etc. */
export const columnBox = (cols: number[], c: number) => {
  let x = W - PAD;
  for (let i = 0; i < c; i++) x -= cols[i];
  return { x0: x - cols[c], x1: x };
};
