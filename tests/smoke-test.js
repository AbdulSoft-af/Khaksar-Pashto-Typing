'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const htmlFiles = ['index.html', 'pages/practice.html', 'pages/lessons.html', 'pages/results.html', 'pages/about.html'];
const jsFiles = fs.readdirSync(path.join(root, 'assets/js')).filter(file => file.endsWith('.js')).map(file => path.join('assets/js', file));
let checks = 0;
function check(label, assertion) { assertion(); checks += 1; console.log('PASS ' + label); }

check('all expected HTML pages exist and declare Pashto RTL', () => {
  for (const relative of htmlFiles) {
    const file = path.join(root, relative);
    assert.ok(fs.existsSync(file), 'missing ' + relative);
    const html = fs.readFileSync(file, 'utf8');
    assert.match(html, /<html\b[^>]*lang="ps"[^>]*dir="rtl"/i, relative + ' must declare Pashto RTL');
    assert.match(html, /name="viewport"/i, relative + ' needs a viewport meta');
    assert.match(html, /<h1\b/i, relative + ' needs a page heading');
  }
});

check('local script and stylesheet references resolve', () => {
  for (const relative of htmlFiles) {
    const html = fs.readFileSync(path.join(root, relative), 'utf8');
    const refs = [...html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="([^"]+)"[^>]*>/gi)].map(m => m[1]);
    for (const ref of refs) {
      if (/^(?:https?:|data:|#|\/\/)/i.test(ref)) continue;
      const resolved = path.resolve(root, path.dirname(relative), ref.split(/[?#]/)[0]);
      assert.ok(fs.existsSync(resolved), relative + ' contains missing local reference: ' + ref);
    }
  }
});

check('bundled Pashto font files and keyboard icon are available offline', () => {
  const fontDir = path.join(root, 'assets/fonts');
  for (const file of ['NotoSansArabic-Regular.ttf', 'NotoSansArabic-Medium.ttf', 'NotoSansArabic-SemiBold.ttf', 'NotoSansArabic-Bold.ttf', 'OFL-NotoSansArabic.txt']) {
    const full = path.join(fontDir, file);
    assert.ok(fs.existsSync(full) && fs.statSync(full).size > 1000, 'missing or empty font asset: ' + file);
  }
  const icon = path.join(root, 'assets/icons/keyboard.svg');
  assert.ok(fs.existsSync(icon), 'keyboard SVG is missing');
  assert.match(fs.readFileSync(icon, 'utf8'), /<svg\b[\s\S]*<rect\b/i, 'keyboard SVG should be a complete local vector');
  const css = fs.readFileSync(path.join(root, 'assets/css/style.css'), 'utf8');
  assert.match(css, /font-family:\"Khaksar Noto Arabic\"/, 'local font face should be declared');
  for (const file of ['NotoSansArabic-Regular.ttf', 'NotoSansArabic-Medium.ttf', 'NotoSansArabic-SemiBold.ttf', 'NotoSansArabic-Bold.ttf']) {
    assert.ok(css.includes('../fonts/' + file), 'CSS must reference bundled font ' + file);
  }
  for (const relative of htmlFiles) {
    const html = fs.readFileSync(path.join(root, relative), 'utf8');
    assert.match(html, /assets\/icons\/keyboard\.svg/, relative + ' should include the typing icon');
  }
});

check('all JavaScript files pass Node syntax checks', () => {
  for (const relative of jsFiles) {
    const result = spawnSync(process.execPath, ['--check', path.join(root, relative)], { encoding: 'utf8' });
    assert.equal(result.status, 0, relative + ': ' + result.stderr);
  }
});

check('Unicode grapheme splitting and accuracy calculations work', () => {
  const store = new Map();
  const context = {
    window: {}, Intl, Date, Math, Number, String, Array, JSON,
    localStorage: {
      getItem: key => store.has(key) ? store.get(key) : null,
      setItem: (key, value) => store.set(key, String(value)),
      removeItem: key => store.delete(key)
    }
  };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'assets/js/statistics.js'), 'utf8'), context);
  const stats = context.window.KhaksarStats;
  assert.equal(stats.splitGraphemes('پښتو').length, 4);
  assert.equal(stats.splitGraphemes('ا\u0654').length, 1, 'NFC normalization should combine a diacritic');
  const passage = 'پښتو '.repeat(10);
  const exact = stats.calculateStats(passage, passage, 60);
  assert.equal(exact.correct, 50); assert.equal(exact.accuracy, 100); assert.equal(exact.wpm, 10); assert.equal(exact.cpm, 50);
  const wrong = stats.calculateStats('abcde', 'abXde', 60);
  assert.equal(wrong.correct, 4); assert.equal(wrong.errors, 1); assert.equal(wrong.accuracy, 80);
});

check('lesson dataset includes nine unique lessons with text', () => {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'assets/js/lessons-data.js'), 'utf8'), context);
  const lessons = context.window.KhaksarLessons;
  assert.equal(lessons.length, 9);
  assert.equal(new Set(lessons.map(item => item.id)).size, 9);
  assert.ok(lessons.every(item => item.title && item.text && item.description));
});

console.log('\n' + checks + ' smoke checks passed.');
