import { continueRender, delayRender } from 'remotion';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource/schibsted-grotesk/900.css';
import '@fontsource/amiri/400-italic.css';
import '@fontsource/cairo/900.css';

// Block rendering until every face (Latin + Arabic subsets) is actually loaded,
// otherwise text measurement (fit / strips) would use fallback metrics.
const handle = delayRender('fonts');
Promise.all([
  document.fonts.load('italic 400 100px "Instrument Serif"', 'abc'),
  document.fonts.load('900 100px "Schibsted Grotesk"', 'abc'),
  document.fonts.load('italic 400 100px "Amiri"', 'عنبر'),
  document.fonts.load('900 100px "Cairo"', 'عنبر'),
])
  .then(() => document.fonts.ready)
  .then(() => continueRender(handle))
  .catch((e) => {
    console.error(e);
    continueRender(handle);
  });
