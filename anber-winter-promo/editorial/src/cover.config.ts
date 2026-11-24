import { calendar } from './data/calendar';
import { columnBox, table } from './data/table';
import { PAPERS } from './papers';
import { PAD, W } from './theme';
import type { CoverConfig, El, PaperEl } from './types';

// Anber School — winter courses, v3.
// Navy cover (intro / outro) → cream "inside pages" (data, real exam papers) → navy back cover.
// Timings follow script.md v2. Every row ends above y = 1536 (bottom fifth stays empty).
// Huge Amiri words are set without shadda (Amiri Italic stacks it far above tall letters).

const NAVY = '#0F1421'; // sampled from the school's logo card
const GOLD = '#D4A23A'; // flat logo gold
const CREAM = '#F4EEE1';

// ── 3–8 s · calendar: official winter break 2026/2027 (ministerial decision no. 41) ──────────
const CAL = { y: 520, start: '2026-11-29', weeks: 6, cellH: 100, headH: 60 };
const legendY = 1205;
const legend: El[] = [
  { kind: 'rect', x: W - PAD - 34, y: legendY + 9, w: 34, h: 34, at: 100, dur: 6 },
  { text: 'عطلة الشتاء: من مساء 17 ديسمبر إلى صباح 3 جانفي', role: 'small', size: 32, at: 100, y: legendY, x1: W - PAD - 52 },
  { kind: 'box', x: W - PAD - 32, y: legendY + 64, w: 30, h: 30, at: 108, width: 3, dur: 8 },
  { text: 'اختبارات الفصل الأول: 6 – 10 ديسمبر', role: 'small', size: 32, at: 108, y: legendY + 54, x1: W - PAD - 52 },
  { kind: 'box', x: W - PAD - 32, y: legendY + 118, w: 30, h: 30, at: 116, width: 3, dur: 8, stroke: 'accent' },
  { text: 'دورات عنبر: ابتداءً من [التاريخ]', role: 'small', size: 32, at: 116, y: legendY + 108, x1: W - PAD - 52 },
  { text: 'المصدر: وزارة التربية الوطنية · الرزنامة المدرسية 2026/2027', role: 'small', size: 22, color: 'dim', at: 124, y: legendY + 180 },
];

// ── 8–14 s · levels table with the real BEM / BAC 2026 first pages ─────────────────────────
const COLS = [380, 312, 260]; // right → left: level | certificate | paper
const TBL_Y = 650, HEAD_H = 56, ROW_H = 330;
const paperCol = columnBox(COLS, 2);
const thumb = (src: string | null, label: string, tag: string, row: number, at: number, rot: number): PaperEl => ({
  kind: 'paper', src, label, tag, at, rot, from: 'left', w: 200,
  x: paperCol.x0 + (paperCol.x1 - paperCol.x0 - 200) / 2, y: TBL_Y + HEAD_H + row * ROW_H + (ROW_H - 283) / 2,
});
const levelBand = (row: number, at: number): El => ({
  kind: 'rect', x: W - PAD - COLS[0] + 6, y: TBL_Y + HEAD_H + row * ROW_H + 6, w: COLS[0] - 12, h: ROW_H - 12, at, dur: 10,
});

// ── 14–18.5 s · subjects = real BAC 2026 (sciences expérimentales) papers ───────────────────
const sheet = (src: string | null, label: string, tag: string, at: number, x: number, y: number, rot: number, from: 'left' | 'right'): PaperEl => ({
  kind: 'paper', src, label, at, x, y, rot, from, w: 560, callout: { x: 0.05, y: 0.02, w: 0.9, h: 0.15, at: at + 16 },
});

// ── 18.5–23.5 s · five real sheets fanned out (reading order: right → left) ────────────────
const FAN = [
  { src: PAPERS.bacMath, label: 'bac 2026 · رياضيات', tag: 'bac 2026\nmaths' },
  { src: PAPERS.bacPhys, label: 'bac 2026 · فيزياء', tag: 'bac 2026\nphysique' },
  { src: PAPERS.bacEng, label: 'bac 2026 · إنجليزية', tag: 'bac 2026\nanglais' },
  { src: PAPERS.bemMath, label: 'bem 2026 · رياضيات', tag: 'bem 2026\nmaths' },
  { src: PAPERS.bemPhys, label: 'bem 2026 · فيزياء', tag: 'bem 2026\nphysique' },
];
const fanX = [710, 550, 390, 230, 70];
const fanY = [830, 800, 785, 800, 830];
const fanR = [9, 4.5, 0, -4.5, -9];
const fan: El[] = FAN.map((p, i) => ({
  kind: 'paper', src: p.src, label: p.label, tag: p.tag, tagSide: 'right', at: 44 + i * 7, x: fanX[i], y: fanY[i], w: 300, rot: fanR[i], from: 'bottom',
}));

export const config: CoverConfig = {
  durationInFrames: 900,
  palettes: {
    cover: { bg: NAVY, huge: GOLD, small: '#FFFFFF', rule: 'rgba(212,162,58,0.55)', accent: GOLD, onAccent: NAVY, dim: 'rgba(255,255,255,0.55)' },
    inside: { bg: CREAM, huge: NAVY, small: NAVY, rule: 'rgba(15,20,33,0.55)', accent: GOLD, onAccent: NAVY, dim: 'rgba(15,20,33,0.5)' },
  },
  scenes: [
    // 0–3 s · «لا تُضيّع العطلة… استغلّها!» — cover
    {
      from: 0, duration: 90, theme: 'cover', drift: 14,
      els: [
        { text: 'لا تضيع العطلة', role: 'small', motion: 'snap', at: 0, hold: 30, hugeY: 760, y: 200, align: 'right' },
        { kind: 'rule', y: 300, at: 34, from: 'right' },
        { text: 'anber school', role: 'small', at: 36, y: 200, align: 'left' },
        { text: 'استغلها!', role: 'huge', motion: 'rise', at: 42, y: 340, max: 470, align: 'right' },
        { kind: 'rule', y: 770, at: 50, from: 'left' },
        { text: 'winter courses 2026/27', role: 'small', at: 58, y: 900, align: 'left' },
        { kind: 'rule', y: 1000, at: 62, from: 'right' },
      ],
    },
    // 3–8 s · «مدرسة عنبر تُعلن عن انطلاق دورات الشتاء، ابتداءً من [التاريخ]» — calendar page
    {
      from: 90, duration: 150, theme: 'inside', transitionIn: 'slideUp', drift: 10,
      els: [
        { text: 'مدرسة عنبر تعلن عن انطلاق', role: 'small', at: 14, y: 150, align: 'right' },
        { text: '2026 / 2027', role: 'small', at: 18, y: 150, align: 'left' },
        { text: 'دورات الشتاء', role: 'huge', motion: 'wipe', at: 46, y: 225, max: 250, align: 'right' },
        ...calendar({
          ...CAL, at: 20, month: 11, monthNames: { 11: 'ديسمبر', 0: 'جانفي' },
          outline: { from: '2026-12-06', to: '2026-12-10', at: 70 },
          band: { from: '2026-12-18', to: '2027-01-02', at: 82, dur: 22 },
        }),
        ...legend,
      ],
    },
    // 8–14 s · «استعدّ لشهادة التعليم المتوسط والبكالوريا… للسنة الرابعة متوسط والثالثة ثانوي، بجميع الشُّعب»
    {
      from: 240, duration: 180, theme: 'inside', transitionIn: 'push', drift: 8,
      els: [
        { text: 'المستويات', role: 'small', at: 14, y: 150, align: 'right' },
        { text: 'bem · bac', role: 'small', at: 16, y: 150, align: 'left' },
        { text: 'استعد', role: 'huge', motion: 'rise', at: 16, y: 215, max: 300, align: 'right' },
        { text: 'لشهادة التعليم المتوسط والبكالوريا', role: 'small', size: 38, at: 30, y: 560, align: 'right' },
        levelBand(0, 84),
        levelBand(1, 117),
        ...table({
          at: 34, y: TBL_Y, cols: COLS, vRules: true,
          header: { h: HEAD_H, cells: ['المستوى', 'الشهادة', 'موضوع 2026'] },
          rows: [
            { h: ROW_H, at: 40, cells: [
              [{ text: 'الرابعة', role: 'huge', size: 96 }, { text: 'متوسط', role: 'huge', size: 96 }],
              [{ text: 'شهادة التعليم', role: 'small', size: 34 }, { text: 'المتوسط', role: 'small', size: 34 }, { text: 'bem', role: 'small', size: 34, align: 'right' }],
              null,
            ] },
            { h: ROW_H, at: 64, cells: [
              [{ text: 'الثالثة', role: 'huge', size: 96 }, { text: 'ثانوي', role: 'huge', size: 96 }],
              [{ text: 'البكالوريا', role: 'small', size: 34 }, { text: 'bac', role: 'small', size: 34, align: 'right' }],
              null,
            ] },
          ],
        }),
        thumb(PAPERS.bemMath, 'bem 2026 · رياضيات', 'bem 2026', 0, 50, -3),
        thumb(PAPERS.bacMath, 'bac 2026 · رياضيات', 'bac 2026', 1, 74, 2),
        { text: 'بجميع الشعب', role: 'small', motion: 'wipe', at: 144, y: 1392, align: 'right' },
      ],
    },
    // 14–18.5 s · «الرياضيات، الفيزياء، اللغات… وجميع المواد الأخرى» — real BAC 2026 papers
    {
      from: 420, duration: 135, theme: 'inside', transitionIn: 'push', push: 0.035,
      els: [
        { text: 'المواد', role: 'small', at: 14, y: 120, align: 'right' },
        { text: 'bac 2026 · sciences exp.', role: 'small', at: 16, y: 120, align: 'left' },
        { text: 'الرياضيات', role: 'huge', motion: 'rise', at: 12, out: 36, y: 255, max: 280, align: 'right' },
        { text: 'الفيزياء', role: 'huge', motion: 'rise', at: 42, out: 66, y: 255, max: 280, align: 'right' },
        { text: 'اللغات', role: 'huge', motion: 'rise', at: 72, y: 255, max: 280, align: 'right' },
        { kind: 'rule', y: 585, at: 14, from: 'left' },
        sheet(PAPERS.bacMath, 'bac 2026 · رياضيات', 'bac 2026 · maths', 14, 230, 622, -4, 'right'),
        sheet(PAPERS.bacPhys, 'bac 2026 · فيزياء', 'bac 2026 · physique', 44, 270, 618, 3, 'left'),
        sheet(PAPERS.bacEng, 'bac 2026 · إنجليزية', 'bac 2026 · anglais', 74, 250, 626, -1.5, 'right'),
        { text: 'وجميع المواد الأخرى', role: 'small', motion: 'wipe', at: 96, y: 1428, align: 'right' },
      ],
    },
    // 18.5–23.5 s · «مراجعة شاملة، حلّ مواضيع السنوات السابقة، وامتحانات تجريبية»
    {
      from: 555, duration: 150, theme: 'inside', transitionIn: 'push', drift: 8,
      els: [
        { text: 'طريقتنا', role: 'small', at: 14, y: 150, align: 'right' },
        { text: 'anber school', role: 'small', at: 16, y: 150, align: 'left' },
        ...table({
          at: 12, y: 220, cols: [782, 170], vRules: true,
          rows: [
            { h: 150, at: 14, cells: [{ text: 'مراجعة شاملة', role: 'huge', size: 84, max: 84 }, { text: '01', role: 'huge', size: 96, align: 'left' }] },
            { h: 150, at: 38, cells: [{ text: 'حل مواضيع السنوات السابقة', role: 'huge', size: 84, max: 84 }, { text: '02', role: 'huge', size: 96, align: 'left' }] },
            { h: 150, at: 88, cells: [{ text: 'امتحانات تجريبية', role: 'huge', size: 84, max: 84 }, { text: '03', role: 'huge', size: 96, align: 'left' }] },
          ],
        }),
        ...fan,
        { text: 'المواضيع: الديوان الوطني للامتحانات والمسابقات · دورة جوان 2026', role: 'small', size: 22, color: 'dim', at: 110, y: 1330 },
      ],
    },
    // 23.5–30 s · «سجّل الآن في مدرسة عنبر بسيدي محمد بن علي… اصنع المجد لنفسك» — back cover, 1.5 s hold
    {
      from: 705, duration: 195, theme: 'cover', transitionIn: 'diagonal',
      els: [
        { kind: 'image', src: 'anber-logo-gold.png', at: 10, y: 90, height: 210, align: 'center' },
        { kind: 'rule', y: 330, at: 18, from: 'right' },
        { text: 'الأماكن محدودة', role: 'small', size: 44, at: 22, y: 352, align: 'right' },
        { text: 'inscriptions ouvertes', role: 'small', size: 38, at: 26, y: 357, align: 'left' },
        { text: 'سجل الآن', role: 'huge', motion: 'rise', at: 28, y: 430, max: 330, align: 'center' },
        { kind: 'rule', y: 745, at: 36, from: 'left' },
        { text: '0792 19 94 29', role: 'small', at: 48, y: 830, align: 'left' },
        { text: '0772 07 80 41', role: 'small', at: 54, y: 830, align: 'right' },
        { text: 'سيدي محمد بن علي', role: 'small', at: 62, y: 905, align: 'right' },
        { text: 'اصنع المجد لنفسك', role: 'small', at: 72, y: 905, align: 'left' },
        { kind: 'rule', y: 1000, at: 96, from: 'right', kick: 122 },
        { text: 'عنبر', role: 'huge', motion: 'slices', at: 100, lock: 22, y: 1020, max: 430, align: 'center' },
        // slices lock at 122, settle by ~135 → hold to 195 (≥ 1.5 s)
      ],
    },
  ],
  cues: [], // SFX pass comes next
};
