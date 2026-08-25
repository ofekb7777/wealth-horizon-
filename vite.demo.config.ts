import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

/**
 * בילד לתצוגה בלבד — אורז את כל האפליקציה לקובץ HTML יחיד שאפשר
 * לפתוח מכל מכשיר, בלי שרת ובלי התקנה.
 *
 * הבילד האמיתי נשאר `vite.config.ts`. הקובץ הזה לא משנה שום קוד
 * באפליקציה: אותו SQLite, אותה שכבת נתונים, אותם מסכים.
 */

/**
 * מטמיע את קובץ ה-WebAssembly של SQLite לתוך ה-HTML.
 *
 * `vite-plugin-singlefile` לא יודע להטמיע wasm, והוא נשאר קובץ נפרד.
 * בדף בודד אין מאיפה למשוך אותו, ולכן אנחנו מקדימים ל-bundle סקריפט
 * שמיירט את הבקשה אליו ומגיש את הבייטים המוטמעים.
 */
function inlineSqliteWasm(): Plugin {
  return {
    name: 'inline-sqlite-wasm',
    transformIndexHtml() {
      const wasm = fs.readFileSync(path.resolve(__dirname, 'public/assets/sql-wasm.wasm'));
      const base64 = wasm.toString('base64');
      return [{
        tag: 'script',
        injectTo: 'head-prepend',
        children: `
(function () {
  var BYTES = null;
  function decode() {
    if (BYTES) return BYTES;
    var bin = atob("${base64}");
    var out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    BYTES = out;
    return out;
  }
  var realFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    if (url.indexOf('sql-wasm.wasm') !== -1) {
      return Promise.resolve(new Response(decode(), {
        status: 200,
        headers: { 'Content-Type': 'application/wasm' },
      }));
    }
    return realFetch(input, init);
  };
})();`.trim(),
      }];
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), inlineSqliteWasm(), viteSingleFile()],
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
  build: {
    outDir: 'dist-demo',
    assetsInlineLimit: 100_000_000,
    chunkSizeWarningLimit: 100_000,
    cssCodeSplit: false,
  },
});
