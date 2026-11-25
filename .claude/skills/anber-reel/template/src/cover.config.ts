import { calendar } from './data/calendar';
import { columnBox, table } from './data/table';
import { BAC_HEADER, PAPERS } from './papers';
import { PAD, W } from './theme';
import type { CoverConfig, El, PaperEl } from './types';

// Anber School — winter courses, final (calm tempo; real 2026 papers; the client's recorded voice).
// Navy cover (intro / outro) → cream "inside pages" (data, real exam papers) → navy back cover.
// Every scene is timed to its voice clip (public/vo/vo1..vo7.wav): clip starts 6 frames into the
// scene, the next scene starts 6 frames after it ends. Every row ends above y = 1536.
// Huge Amiri words are set without shadda (Amiri Italic stacks it far above tall letters).

const NAVY = '#0F1421'; // sampled from the school's logo card
const GOLD = '#D4A23A'; // flat logo gold
const CREAM = '#F4EEE1';

// ── calendar: the courses run through the whole official winter break 2026/2027 (decision no. 41) ──
const CAL = { y: 520, start: '2026-11-29', weeks: 6, cellH: 100, headH: 60 };
const legendY = 1210;
const legend: El[] = [
  { kind: 'rect', x: W - PAD - 34, y: legendY + 10, w: 34, h: 34, at: 148, dur: 8 },
  { text: 'طوال عطلة الشتاء: من مساء 17 ديسمبر إلى صباح 3 جانفي', role: 'small', size: 34, at: 148, y: legendY, x1: W - PAD - 52 },
  { text: 'المصدر: وزارة التربية الوطنية · الرزنامة المدرسية 2026/2027', role: 'small', size: 22, color: 'dim', at: 172, y: legendY + 80 },
];

// ── levels table with the real BEM / BAC 2026 first pages ─────────────────────────
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

// ── subjects list + real BAC 2026 (sciences expérimentales) papers ──────────────
const sheet = (src: string | null, label: string, at: number, x: number, y: number, rot: number, from: 'left' | 'right'): PaperEl => ({
  kind: 'paper', src, label, at, x, y, rot, from, w: 500, callout: { ...BAC_HEADER, at: at + 18 },
});
const SUBJ_SIZE = 118, SUBJ_ROW = Math.round(SUBJ_SIZE * 1.12);
const subject = (text: string, y: number, at: number): El[] => [
  { kind: 'rule', y: y + Math.round(SUBJ_ROW * 0.82), at: at + 6, from: 'left' }, // crosses the word
  { text, role: 'huge', size: SUBJ_SIZE, at, y, align: 'right' },
];

// ── five real sheets fanned out (reading order: right → left) ────────────────
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
  kind: 'paper', src: p.src, label: p.label, tag: p.tag, tagSide: 'right', at: 52 + i * 7, x: fanX[i], y: fanY[i], w: 300, rot: fanR[i], from: 'bottom',
}));

export const config: CoverConfig = {
  durationInFrames: 1148, // ≈ 38.3 s, set by the recorded voice
  tempo: 'calm',
  palettes: {
    cover: { bg: NAVY, huge: GOLD, small: '#FFFFFF', rule: 'rgba(212,162,58,0.55)', accent: GOLD, onAccent: NAVY, dim: 'rgba(255,255,255,0.55)' },
    inside: { bg: CREAM, huge: NAVY, small: NAVY, rule: 'rgba(15,20,33,0.55)', accent: GOLD, onAccent: NAVY, dim: 'rgba(15,20,33,0.5)' },
  },
  scenes: [
    // 0–99 · vo1 «لا تُضيّع العطلة… استغلّها!» — cover
    {
      from: 0, duration: 99, theme: 'cover', drift: 14,
      els: [
        { text: 'لا تضيع العطلة', role: 'small', motion: 'snap', at: 0, hold: 34, hugeY: 760, y: 200, align: 'right' },
        { kind: 'rule', y: 300, at: 36, from: 'right' },
        { text: 'anber school', role: 'small', at: 40, y: 200, align: 'left' },
        { text: 'استغلها!', role: 'huge', motion: 'rise', at: 52, y: 340, max: 470, align: 'right' },
        { kind: 'rule', y: 770, at: 58, from: 'left' },
        { text: 'winter courses 2026/27', role: 'small', at: 64, y: 900, align: 'left' },
        { kind: 'rule', y: 1000, at: 68, from: 'right' },
      ],
    },
    // 99–318 · vo2 «مدرسة عنبر تُعلن عن انطلاق دورات الشتاء…» — calendar: the whole winter break
    {
      from: 99, duration: 219, theme: 'inside', transitionIn: 'slideUp', drift: 10,
      els: [
        { text: 'مدرسة عنبر تعلن عن انطلاق', role: 'small', at: 10, y: 150, align: 'right' },
        { text: '2026 / 2027', role: 'small', at: 14, y: 150, align: 'left' },
        { text: 'دورات الشتاء', role: 'huge', motion: 'wipe', at: 56, y: 225, max: 250, align: 'right' },
        ...calendar({
          ...CAL, at: 18, month: 11, monthNames: { 11: 'ديسمبر', 0: 'جانفي' },
          band: { from: '2026-12-18', to: '2027-01-02', at: 110, dur: 22 },
        }),
        ...legend,
      ],
    },
    // 318–567 · vo3 «استعدّ لشهادة التعليم المتوسط والبكالوريا… الرابعة متوسط، والثالثة ثانوي، بجميع الشُّعب»
    {
      from: 318, duration: 249, theme: 'inside', transitionIn: 'push', drift: 8,
      els: [
        { text: 'المستويات', role: 'small', at: 10, y: 150, align: 'right' },
        { text: 'bem · bac', role: 'small', at: 12, y: 150, align: 'left' },
        { text: 'استعد', role: 'huge', motion: 'rise', at: 10, y: 215, max: 300, align: 'right' },
        { text: 'لشهادة التعليم المتوسط والبكالوريا', role: 'small', size: 38, at: 28, y: 560, align: 'right' },
        levelBand(0, 128),
        levelBand(1, 164),
        ...table({
          at: 34, y: TBL_Y, cols: COLS, vRules: true,
          header: { h: HEAD_H, cells: ['المستوى', 'الشهادة', 'موضوع 2026'] },
          rows: [
            { h: ROW_H, at: 44, cells: [
              [{ text: 'الرابعة', role: 'huge', size: 96 }, { text: 'متوسط', role: 'huge', size: 96 }],
              [{ text: 'شهادة التعليم', role: 'small', size: 34 }, { text: 'المتوسط', role: 'small', size: 34 }, { text: 'bem', role: 'small', size: 34, align: 'right' }],
              null,
            ] },
            { h: ROW_H, at: 74, cells: [
              [{ text: 'الثالثة', role: 'huge', size: 96 }, { text: 'ثانوي', role: 'huge', size: 96 }],
              [{ text: 'البكالوريا', role: 'small', size: 34 }, { text: 'bac', role: 'small', size: 34, align: 'right' }],
              null,
            ] },
          ],
        }),
        thumb(PAPERS.bemMath, 'bem 2026 · رياضيات', 'bem 2026', 0, 54, -3),
        thumb(PAPERS.bacMath, 'bac 2026 · رياضيات', 'bac 2026', 1, 84, 2),
        { text: 'بجميع الشعب', role: 'small', motion: 'wipe', at: 202, y: 1392, align: 'right' },
      ],
    },
    // 567–695 · vo4 «الرياضيات، الفيزياء، اللغات… وجميع المواد الأخرى» — real BAC 2026 papers
    {
      from: 567, duration: 128, theme: 'inside', transitionIn: 'push', push: 0.035,
      els: [
        { text: 'المواد', role: 'small', at: 10, y: 100, align: 'right' },
        { text: 'bac 2026 · sciences exp.', role: 'small', at: 12, y: 100, align: 'left' },
        { kind: 'rule', y: 200, at: 4, from: 'right' },
        ...subject('الرياضيات', 215, 6),
        ...subject('الفيزياء', 360, 38),
        ...subject('اللغات', 505, 65),
        sheet(PAPERS.bacMath, 'bac 2026 · رياضيات', 6, 270, 668, -3.5, 'right'),
        sheet(PAPERS.bacPhys, 'bac 2026 · فيزياء', 38, 305, 664, 2.5, 'left'),
        sheet(PAPERS.bacEng, 'bac 2026 · إنجليزية', 65, 288, 672, -1.2, 'right'),
        { text: 'وجميع المواد الأخرى', role: 'small', at: 84, y: 1412, align: 'right' },
      ],
    },
    // 695–851 · vo5 «مراجعة شاملة، حلّ مواضيع السنوات السابقة، وامتحانات تجريبية»
    {
      from: 695, duration: 156, theme: 'inside', transitionIn: 'push', drift: 8,
      els: [
        { text: 'طريقتنا', role: 'small', at: 10, y: 150, align: 'right' },
        { text: 'anber school', role: 'small', at: 12, y: 150, align: 'left' },
        ...table({
          at: 6, y: 220, cols: [782, 170], vRules: true,
          rows: [
            { h: 150, at: 8, cells: [{ text: 'مراجعة شاملة', role: 'huge', size: 84, max: 84 }, { text: '01', role: 'huge', size: 96, align: 'left' }] },
            { h: 150, at: 46, cells: [{ text: 'حل مواضيع السنوات السابقة', role: 'huge', size: 84, max: 84 }, { text: '02', role: 'huge', size: 96, align: 'left' }] },
            { h: 150, at: 106, cells: [{ text: 'امتحانات تجريبية', role: 'huge', size: 84, max: 84 }, { text: '03', role: 'huge', size: 96, align: 'left' }] },
          ],
        }),
        ...fan,
        { text: 'المواضيع: الديوان الوطني للامتحانات والمسابقات · دورة جوان 2026 · eddirasa.com', role: 'small', size: 22, color: 'dim', at: 118, y: 1330 },
      ],
    },
    // 851–1148 · vo6 «سجّل الآن حضوريًا أو عبر الهاتف، بمبلغ رمزي…» + vo7 «مدرسة عنبر، اصنع المجد لنفسك وتميّز»
    {
      from: 851, duration: 297, theme: 'cover', transitionIn: 'diagonal',
      els: [
        { text: 'سجل الآن', role: 'huge', motion: 'rise', at: 14, y: 240, max: 330, align: 'center' },
        { text: 'الأماكن محدودة', role: 'small', size: 44, at: 16, y: 120, align: 'right' },
        { kind: 'rule', y: 220, at: 18, from: 'right' },
        { kind: 'rule', y: 550, at: 24, from: 'left' },
        { text: 'التسجيل حضوريًا أو عبر الهاتف', role: 'small', size: 44, at: 34, y: 648, align: 'center' },
        { text: '0792 19 94 29', role: 'small', at: 62, y: 716, align: 'left' },
        { text: '0772 07 80 41', role: 'small', at: 68, y: 716, align: 'right' },
        { text: 'بمبلغ رمزي', role: 'small', size: 44, color: 'accent', at: 95, y: 120, align: 'left' },
        { text: 'سيدي محمد بن علي', role: 'small', size: 40, at: 112, y: 790, align: 'center' },
        { kind: 'rule', y: 860, at: 120, from: 'right' },
        // final lockup: the gold school logo rises smoothly with a gentle zoom settle, then the slogan
        { kind: 'image', src: 'anber-logo-gold.png', motion: 'rise', zoom: 1.08, dur: 30, at: 138, y: 885, height: 380, align: 'center' },
        { text: 'اصنع المجد لنفسك وتميز', role: 'huge', at: 188, y: 1300, max: 104, align: 'center' },
        // voice ends at 258; the lockup is complete from 212 and holds to the end (297)
      ],
    },
  ],
  // the client's voice-over, one clip per script line (cleaned, -16 LUFS)
  voice: [[6, 'vo1'], [105, 'vo2'], [324, 'vo3'], [573, 'vo4'], [701, 'vo5'], [857, 'vo6'], [988, 'vo7']],
  // soft sound effects (no music) — [frame, public/sfx/<name>.wav, volume]; under the voice
  cues: [
    // intro
    [34, 'swoosh_s', 0.3], [52, 'tap', 0.34],
    // page changes (in the gaps between voice lines)
    [99, 'swoosh', 0.32], [318, 'swoosh', 0.3], [567, 'swoosh', 0.3], [695, 'swoosh', 0.3], [851, 'swoosh', 0.34],
    // calendar: digits roll in, gold winter-break band
    [129, 'ticks', 0.24], [209, 'marker', 0.26],
    // levels table: paper thumbnails, gold level highlights
    [372, 'paper', 0.32], [402, 'paper', 0.32], [446, 'marker', 0.24], [482, 'marker', 0.24],
    // subjects: each real sheet slides in, then its header callout
    [573, 'paper', 0.38], [591, 'marker', 0.18], [605, 'paper', 0.38], [623, 'marker', 0.18], [632, 'paper', 0.38], [650, 'marker', 0.18],
    // method: five sheets fan out
    [747, 'paper', 0.22], [754, 'paper', 0.2], [761, 'paper', 0.2], [768, 'paper', 0.2], [775, 'paper', 0.22],
    // outro
    [865, 'tap', 0.34], [913, 'tick', 0.28], [919, 'tick', 0.28], [989, 'chime', 0.3], [1039, 'air', 0.2],
  ],
};
