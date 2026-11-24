import type { CoverConfig, El } from './types';

// Anber School — winter holiday courses, editorial-cover version.
// One cover per voice-over line; scene starts follow script.md (0, 3, 7, 13, 20, 25 s).
// small = Cairo 900 / Schibsted Grotesk Black · huge = Amiri Italic / Instrument Serif Italic.
// Every row ends above y = 1536 (bottom fifth empty).
// Huge Amiri words are set without shadda: Amiri Italic stacks it far above tall letters at display sizes.

const masthead: El = { text: 'anber school', role: 'small', motion: 'cut', at: 0, y: 200, align: 'left' };

const subjects: [string, string][] = [
  ['الرياضيات', 'mathématiques'],
  ['الفيزياء', 'physique'],
  ['العلوم', 'sciences'],
  ['العربية', 'arabe'],
  ['الفرنسية', 'français'],
  ['الإنجليزية', 'anglais'],
  ['الفلسفة', 'philosophie'],
];
const SUB_START = 20, SUB_STEP = 22;
const subjectEls: El[] = subjects.flatMap(([ar, fr], i): El[] => {
  const at = SUB_START + i * SUB_STEP;
  const until = i < subjects.length - 1 ? at + SUB_STEP : undefined;
  return [
    { text: ar, role: 'huge', motion: 'rise', at, until, y: 500, max: 380, align: 'center' },
    { text: `0${i + 1} / 07`, role: 'small', motion: 'cut', at, until, y: 1000, align: 'left' },
    { text: fr, role: 'small', motion: 'cut', at, until, y: 1000, align: 'right' },
  ];
});

export const config: CoverConfig = {
  durationInFrames: 900,
  scenes: [
    // 0–3s · «العطلة الشتوية… فرصتك باش تسبق!»
    {
      from: 0, duration: 90,
      els: [
        { text: 'العطلة الشتوية', role: 'small', motion: 'snap', at: 0, hold: 24, hugeY: 760, y: 200, align: 'right' },
        { text: 'anber school', role: 'small', motion: 'rise', at: 30, y: 200, align: 'left' },
        { kind: 'rule', y: 300, at: 30, from: 'right' },
        { text: 'فرصتك', role: 'huge', motion: 'rise', at: 36, y: 330, max: 420, align: 'right' },
        { kind: 'rule', y: 700, at: 44, from: 'left' },
        { text: 'باش تسبق!', role: 'huge', motion: 'wipe', at: 54, y: 780, max: 330, align: 'left' },
        { kind: 'rule', y: 1070, at: 62, from: 'right' },
      ],
    },
    // 3–7s · «مدرسة عنبر للتميّز تفتح لكم دورات عطلة الشتاء»
    {
      from: 90, duration: 120,
      els: [
        masthead,
        { text: 'مدرسة عنبر تفتح لكم', role: 'small', motion: 'rise', at: 0, y: 200, align: 'right' },
        { kind: 'rule', y: 300, at: 4, from: 'left' },
        { text: 'دورات', role: 'huge', motion: 'rise', at: 10, y: 320, max: 460, align: 'right' },
        { kind: 'rule', y: 730, at: 18, from: 'right' },
        { text: 'عطلة الشتاء', role: 'huge', motion: 'wipe', at: 40, y: 810, max: 300, align: 'center' },
        { kind: 'rule', y: 1080, at: 46, from: 'left' },
        { text: 'الانطلاق: [التاريخ]', role: 'small', motion: 'rise', at: 70, y: 1210, align: 'right' },
        { text: 'winter 2026', role: 'small', motion: 'rise', at: 74, y: 1210, align: 'left' },
      ],
    },
    // 7–13s · «لتلاميذ الرابعة متوسط… والثالثة ثانوي، جميع الشُّعب»
    {
      from: 210, duration: 180,
      els: [
        masthead,
        { text: 'لتلاميذ', role: 'small', motion: 'rise', at: 0, y: 200, align: 'right' },
        { kind: 'rule', y: 300, at: 4, from: 'right' },
        { text: 'الرابعة متوسط', role: 'huge', motion: 'rise', at: 16, y: 330, max: 300, align: 'right' },
        { kind: 'rule', y: 610, at: 24, from: 'left' },
        { text: 'bem', role: 'small', motion: 'wipe', at: 40, y: 690, align: 'left' },
        { text: 'الثالثة ثانوي', role: 'huge', motion: 'under', at: 76, y: 780, under: 770, max: 300, align: 'left' },
        { kind: 'rule', y: 1060, at: 84, from: 'right' },
        { text: 'bac', role: 'small', motion: 'wipe', at: 100, y: 1140, align: 'right' },
        { text: 'جميع الشُّعب', role: 'small', motion: 'wipe', at: 120, y: 1230, align: 'left' },
      ],
    },
    // 13–20s · «في جميع المواد: …»
    {
      from: 390, duration: 210,
      els: [
        masthead,
        { text: 'في جميع المواد', role: 'small', motion: 'rise', at: 0, y: 200, align: 'right' },
        { kind: 'rule', y: 300, at: 4, from: 'left' },
        { kind: 'rule', y: 470, at: 10, from: 'right' },
        { kind: 'rule', y: 840, at: 14, from: 'left' },
        ...subjectEls,
        { kind: 'rule', y: 1100, at: 18, from: 'right' },
        { text: '…وغيرها', role: 'small', motion: 'wipe', at: 176, y: 1150, align: 'right' },
      ],
    },
    // 20–25s · «مراجعة مركّزة، أساتذة مختصّون، وتحضير جدّي…»
    {
      from: 600, duration: 150,
      els: [
        masthead,
        { text: 'لماذا عنبر؟', role: 'small', motion: 'rise', at: 0, y: 200, align: 'right' },
        { kind: 'rule', y: 300, at: 4, from: 'right' },
        { text: 'مراجعة مركزة', role: 'huge', motion: 'wipe', at: 24, y: 330, max: 270, align: 'right' },
        { kind: 'rule', y: 580, at: 30, from: 'left' },
        { text: 'أساتذة مختصون', role: 'huge', motion: 'wipe', at: 60, y: 650, max: 270, align: 'left' },
        { kind: 'rule', y: 900, at: 66, from: 'right' },
        { text: 'تحضير جدي', role: 'huge', motion: 'wipe', at: 96, y: 970, max: 270, align: 'right' },
        { kind: 'rule', y: 1220, at: 102, from: 'left' },
        { text: 'bem · bac', role: 'small', motion: 'rise', at: 116, y: 1320, align: 'left' },
      ],
    },
    // 25–30s · «الأماكن محدودة… سجّل الآن! مدرسة عنبر… اصنع المجد لنفسك» — last word in slices, 1.5s hold
    {
      from: 750, duration: 150,
      els: [
        { kind: 'image', src: 'anber-mark-white.png', at: 0, y: 100, height: 170, align: 'center' },
        { kind: 'rule', y: 300, at: 4, from: 'right' },
        { text: 'الأماكن محدودة', role: 'small', motion: 'rise', at: 6, y: 320, align: 'right' },
        { text: 'سجل الآن', role: 'huge', motion: 'rise', at: 14, y: 390, max: 330, align: 'center' },
        { kind: 'rule', y: 690, at: 22, from: 'left' },
        { text: '0792 19 94 29', role: 'small', motion: 'rise', at: 34, y: 790, align: 'left' },
        { text: '0772 07 80 41', role: 'small', motion: 'rise', at: 40, y: 790, align: 'right' },
        { text: 'اصنع المجد لنفسك', role: 'small', motion: 'rise', at: 48, y: 860, align: 'right' },
        { text: 'سيدي محمد بن علي', role: 'small', motion: 'rise', at: 54, y: 860, align: 'left' },
        { kind: 'rule', y: 960, at: 58, from: 'right' },
        { text: 'عنبر', role: 'huge', motion: 'slices', at: 64, lock: 22, y: 980, max: 460, align: 'center' },
        // slices lock ~frame 86, settle by ~100 → hold to 150 (≥ 1.5 s)
      ],
    },
  ],
  // reserved for the SFX pass (to be designed line by line with the user)
  cues: [],
};
