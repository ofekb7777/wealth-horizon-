/*
 * גוזר מ-`dist-demo/index.html` גרסה בלי מעטפת המסמך, ל-`dist-demo/artifact.html`.
 *
 * שירות פרסום הדפים עוטף כל קובץ בשלד `<!doctype html><head>…</head><body>`
 * משלו. קובץ שכבר מכיל מעטפת כזאת יוצר מסמך מקונן — הדפדפן אמנם מתאושש,
 * אבל תוכן ה-head הפנימי נדחף לתוך ה-body וזה שביר בלי סיבה.
 *
 * ⚠️ **לא לחפש `</head>` או `<body>` סתם.** הבאנדל מכיל את שתי המחרוזות
 * האלה כטקסט בתוך קוד ספרייה — נפלתי בזה כבר פעם בפרויקט הזה. העיגון
 * הוא על רצף הירידות-שורה וההזחה המדויק של `index.html`, שלא יכול
 * להופיע בתוך JS או CSS ממוזערים. הסקריפט נופל אם הוא לא מוצא בדיוק
 * התאמה אחת, במקום לנחש.
 *
 * הרצה:  npm run build:demo && node scripts/build-artifact-html.mjs
 */
import fs from 'node:fs';

const SRC = 'dist-demo/index.html';
const OUT = 'dist-demo/artifact.html';

const html = fs.readFileSync(SRC, 'utf-8');

const HEAD_OPEN = '<html lang="en" dir="ltr">\n  <head>\n';
const HEAD_TO_BODY = '\n  </head>\n  <body>\n';
const BODY_CLOSE = '\n  </body>\n</html>';

for (const anchor of [HEAD_OPEN, HEAD_TO_BODY, BODY_CLOSE]) {
  const hits = html.split(anchor).length - 1;
  if (hits !== 1) {
    console.error(`ציפיתי להתאמה אחת ל-${JSON.stringify(anchor)}, מצאתי ${hits}. הבנייה השתנתה?`);
    process.exit(1);
  }
}

const headOpen = html.indexOf(HEAD_OPEN) + HEAD_OPEN.length;
const headClose = html.indexOf(HEAD_TO_BODY);
const bodyOpen = headClose + HEAD_TO_BODY.length;
const bodyClose = html.indexOf(BODY_CLOSE);

const head = html.slice(headOpen, headClose);
const body = html.slice(bodyOpen, bodyClose);

// ה-<title> חייב להופיע בתחילת הקובץ: השירות סורק רק את 8KB הראשונים,
// ורצף ה-base64 של ה-WASM דוחף אותו הרבה מעבר לזה.
const withoutTitle = head.replace(/<title>[\s\S]*?<\/title>/, '');

fs.writeFileSync(OUT, `<title>Wealth Horizon</title>\n${withoutTitle.trim()}\n${body.trim()}\n`, 'utf-8');

const size = fs.statSync(OUT).size;
console.log(`נכתב ${OUT} — ${(size / 1024 / 1024).toFixed(2)}MB`);
if (/<!doctype|<html|<\/html>|<body|<\/body>/i.test(fs.readFileSync(OUT, 'utf-8').slice(0, 2000))) {
  console.error('נשארה מעטפת מסמך בתחילת הקובץ');
  process.exit(1);
}
