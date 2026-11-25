// Real exam pages: page 1 of each official subject (session June 2026), rendered to JPEG.
// Source: Office National des Examens et Concours (ONEC), files as published on eddirasa.com.
export const PAPERS: Record<'bacMath' | 'bacPhys' | 'bacEng' | 'bemMath' | 'bemPhys', string | null> = {
  bacMath: 'papers/bac-math.jpg', // BAC 2026 · sciences expérimentales · mathématiques
  bacPhys: 'papers/bac-physique.jpg', // BAC 2026 · sciences expérimentales · sciences physiques
  bacEng: 'papers/bac-anglais.jpg', // BAC 2026 · filières scientifiques · anglais
  bemMath: 'papers/bem-math.jpg', // BEM 2026 · mathématiques
  bemPhys: 'papers/bem-physique.jpg', // BEM 2026 · sciences physiques et technologie
};

// Gold callout on each page's exam header (fractions of the page)
export const BAC_HEADER = { x: 0.06, y: 0.163, w: 0.88, h: 0.095 };
export const BEM_HEADER = { x: 0.06, y: 0.115, w: 0.88, h: 0.08 };
