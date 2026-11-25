---
name: anber-reel
description: Make promo reels for Anber School of Excellence (مدرسة عنبر للتميز / مدرسة عنبر لتعليم اللغات, Sidi M'Hamed Ben Ali, Relizane, Algeria) — 9:16, 30 s Remotion videos in the school's identity (logo navy #0F1421 + logo gold), editorial cover intro/outro, cream "inside pages" with tables, calendars and real exam papers, calm slow motion, ending on the gold school logo and the slogan «اصنع المجد لنفسك وتميز». Use for any Anber announcement video (holiday courses, new groups, exam prep, registrations, schedules) or to update the winter-courses reel.
---

# Anber School reel

`template/` is the finished winter-courses reel (2026/27) as a working Remotion project.
A new Anber video = copy it, rewrite `src/cover.config.ts` (and `src/papers.ts` / `public/`),
render. The engine is the editorial-cover engine with the school's palette and the calm tempo;
`.claude/skills/editorial-cover-reel/SKILL.md` documents every element and motion in detail.

## Brand kit (fixed)
| | |
|---|---|
| Names | مدرسة عنبر للتميز · مدرسة عنبر لتعليم اللغات · Anber School of Excellence · École privée |
| Slogans | **«اصنع المجد لنفسك وتميز»** (closing) · «معًا نحو التميز والنجاح» · Éduquer • Encourager • Réussir |
| Phones | 0792 19 94 29 (used on all their posts) · 0772 07 80 41 (logo card) — show both |
| Address | سيدي محمد بن علي – مدينة مركز (wilaya of Relizane / غليزان) |
| Colours | navy `#0F1421` (sampled from the logo card) · flat gold `#D4A23A` · cream `#F4EEE1` for inside pages |
| Fonts | huge: Amiri Italic (Arabic) / Instrument Serif Italic (Latin) · small: Cairo 900 / Schibsted Grotesk Black |
| Logo | `public/anber-logo-gold.png` (cleaned, transparent, 1226×1066) · `public/anber-mark-white.png` (white silhouette) |
| Their social style | black + shiny gold, gold ribbons, megaphone, books, pill-shaped info boxes |

## Client preferences (learned — keep them)
- Voice-over in **Modern Standard Arabic** (فصحى); the client records it from our script. **No music**;
  sound effects only, designed later with the client.
- Motion **simple, calm and slow** (`tempo: 'calm'`): each text line slides up once through its mask
  (~24 frames, no bounce); rules draw slowly. Page transitions and papers keep their normal speed.
- Editorial cover style only for the **intro and outro**; the middle is "inside pages" with **tables,
  data and real documents** (official calendar, real BAC/BEM papers) — never invented data.
- Close on the **gold logo assembling from 4 gentle slices + the slogan** «اصنع المجد لنفسك وتميز»,
  held ≥ 1.5 s. Latin text lowercase. No fades, no glow. Bottom fifth (y ≥ 1536) empty.
- Do not name teachers unless the teacher confirms. Keep `[التاريخ]`-style placeholders visible until
  the teacher gives the missing info.

## Structure (30 s = 900 frames, one page per voice line)
| Time | Page | Pattern from the template |
|---|---|---|
| 0–3 s | navy cover | hook: small phrase starts huge → settles as kicker (`snap`), huge gold word, gold rules |
| 3–8 s | cream page | calendar (`calendar()`), official dates as gold band, legend rows, source line |
| 8–14 s | cream page | table (`table()`): levels / certificates, real paper thumbnails, gold cell highlights |
| 14–18.5 s | cream page | 3-row list (subjects) + real paper sheets arriving on each spoken word, gold header callout |
| 18.5–23.5 s | cream page | numbered rows 01/02/03 + fanned real papers + source line |
| 23.5–30 s | navy cover | «الأماكن محدودة» · «سجل الآن» · phones · address · logo slices · slogan · 1.5 s hold |
Transitions: `slideUp` (cover → page), `push` (page → page), `diagonal` (page → cover).

## Workflow
1. **Brief** — ask the user (to relay to the teacher) whatever is missing: dates, levels and subjects,
   prices/discounts, schedule, how to register, selling points they can actually back up, deadline,
   platforms. The questionnaire used for the winter reel is in `anber-winter-promo/script.md`.
2. **Facts** — research official data with WebSearch (school calendar: وزارة التربية الوطنية;
   results/papers: ONEC). Cross-check two sources and show a source line on screen.
   Verified for 2026/27: winter break from the evening of Thu 17 Dec 2026 to the morning of
   Sun 3 Jan 2027 (decision no. 41), first-term exams 6–10 Dec 2026, spring break 18 Mar – 4 Apr 2027.
3. **Real papers** — this cloud session can't reach eddirasa.com/onec.dz: give the user the exact
   eddirasa.com links, they upload the PDFs; render page 1 with
   `pdftoppm -png -r 150 -f 1 -l 1 -singlefile in.pdf out`, resize to 1100 px wide JPEG
   (`python3 -I`, PIL) into `public/papers/`, list them in `src/papers.ts`. Header callouts:
   BAC `{x:.06,y:.163,w:.88,h:.095}`, BEM `{x:.06,y:.115,w:.88,h:.08}`. Show pages as published.
4. **Script** — one line per page, timed at ~2.3 words/s (فصحى), with performance notes and what
   is on screen; save as `script.md` beside the project.
5. **Build** — copy `template/`, `npm install`, edit `src/cover.config.ts`. Keep ~24 frames per text
   beat (calm tempo); every page's last element settles before the next transition.
   Huge Amiri words without shadda; never letter-space Arabic.
6. **Check & render**
   ```bash
   npx remotion bundle src/index.ts --out-dir /tmp/b
   npx remotion still /tmp/b Cover /tmp/f.jpg --frame=450          # settle + mid-motion frames
   npx remotion render src/index.ts Cover out/anber-reel.mp4
   python3 -I .claude/skills/anber-reel/check_safe.py out/anber-reel.mp4 --step 3 \
     --bg '#0F1421,#F4EEE1' --skip 90-105,240-255,420-435,555-570,705-720   # adjust to the scene starts
   ```
   Then `ffprobe` (1080×1920, 30 fps, 30.0 s), commit, push, send the MP4 to the user.
