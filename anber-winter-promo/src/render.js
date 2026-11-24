// usage: node src/render.js stills <outdir> t1 t2 ...   |   node src/render.js frames <outdir> [fps]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const [mode, outDir, ...rest] = process.argv.slice(2);
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('console', m => console.log('[page]', m.text()));
  page.on('pageerror', e => console.log('[err]', e.message));
  await page.goto('file://' + path.resolve(__dirname, 'index.html'));
  await page.evaluate(() => window.ready);
  const dur = await page.evaluate(() => window.DUR);
  fs.writeFileSync(path.join(outDir, 'cues.json'), JSON.stringify(await page.evaluate(() => window.CUES)));
  const shot = async (t, file) => { await page.evaluate(t => window.seek(t), t); await page.screenshot({ path: file, type: 'jpeg', quality: 93 }); };
  if (mode === 'stills') {
    for (const t of rest) await shot(+t, path.join(outDir, `t_${(+t).toFixed(2)}.jpg`));
  } else {
    const fps = +(rest[0] || 30), n = Math.round(dur * fps);
    for (let i = 0; i < n; i++) {
      await shot(i / fps, path.join(outDir, `f_${String(i).padStart(5, '0')}.jpg`));
      if (i % 150 === 0) console.log('frame', i, '/', n);
    }
  }
  await browser.close();
})();
