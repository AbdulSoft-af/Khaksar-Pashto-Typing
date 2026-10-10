(function () {
  'use strict';
  const stats = window.KhaksarStats;
  if (!stats) return;
  const $ = id => document.getElementById(id);
  function records() { return stats.getResults(); }
  function setText(id, value) { const el = $(id); if (el) el.textContent = value; }
  function render() {
    const items = records();
    const best = items.reduce((max, item) => Math.max(max, Number(item.wpm) || 0), 0);
    const accuracy = items.length ? Math.round(items.reduce((total, item) => total + (Number(item.accuracy) || 0), 0) / items.length) : 0;
    const seconds = items.reduce((total, item) => total + Math.max(0, Number(item.elapsedSeconds) || 0), 0);
    setText('best-wpm', stats.formatNumber(best)); setText('avg-accuracy', stats.formatNumber(accuracy)); setText('total-minutes', stats.formatNumber(Math.round(seconds / 60)));
    const list = $('history-list'); const empty = $('history-empty');
    if (!list) return;
    list.replaceChildren();
    if (!items.length) { if (empty) empty.hidden = false; return; }
    if (empty) empty.hidden = true;
    items.slice(0, 100).forEach(item => {
      const row = document.createElement('article'); row.className = 'history-row';
      const date = document.createElement('div');
      const title = document.createElement('div'); title.className = 'history-date'; title.textContent = item.title || 'د پښتو ټایپ تمرین';
      const when = document.createElement('div'); when.className = 'history-sub'; when.textContent = stats.formatDate(item.date); date.append(title, when);
      const wpm = document.createElement('div'); wpm.className = 'history-number'; wpm.textContent = stats.formatNumber(item.wpm); const wpmLabel = document.createElement('small'); wpmLabel.textContent = 'WPM'; wpm.appendChild(wpmLabel);
      const acc = document.createElement('div'); acc.className = 'history-number history-accuracy'; acc.textContent = stats.formatNumber(item.accuracy) + '٪'; const accLabel = document.createElement('small'); accLabel.textContent = 'دقت'; acc.appendChild(accLabel);
      const errs = document.createElement('div'); errs.className = 'history-number'; errs.textContent = stats.formatNumber(item.errors); const errsLabel = document.createElement('small'); errsLabel.textContent = 'تېروتنې'; errs.appendChild(errsLabel);
      const remove = document.createElement('button'); remove.className = 'history-delete'; remove.type = 'button'; remove.textContent = 'لرې'; remove.setAttribute('aria-label', 'د ' + (item.title || 'تمرین') + ' پایله لرې کړئ'); remove.addEventListener('click', function () {
        const next = records().filter(result => result.id !== item.id);
        stats.safeWrite(stats.keys.results, next); render();
      });
      row.append(date, wpm, acc, errs, remove); list.appendChild(row);
    });
  }
  const clearButton = $('clear-results');
  if (clearButton) clearButton.addEventListener('click', function () {
    const items = records();
    if (!items.length) return;
    if (window.confirm('ایا ډاډه یاست چې د تمرین ټولې پایلې پاکې شي؟ دا کار بېرته نه راګرځي.')) { stats.clearResults(); render(); }
  });
  const exportButton = $('export-results');
  if (exportButton) exportButton.addEventListener('click', function () {
    const items = records();
    if (!items.length) { window.alert('د ښکته کولو لپاره لا پایلې نشته.'); return; }
    const headers = ['Date', 'Lesson or passage', 'WPM', 'CPM', 'Accuracy (%)', 'Correct characters', 'Typed characters', 'Errors', 'Elapsed seconds'];
    const quote = value => '"' + String(value == null ? '' : value).replace(/"/g, '""') + '"';
    const rows = items.map(item => [item.date, item.title, item.wpm, item.cpm, item.accuracy, item.correct, item.typedCount, item.errors, item.elapsedSeconds].map(quote).join(','));
    const csv = '\uFEFF' + [headers.map(quote).join(','), ...rows].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'khaksar-typing-results.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  });
  render();
})();
