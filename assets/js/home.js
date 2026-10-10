(function () {
  'use strict';
  const stats = window.KhaksarStats;
  if (!stats) return;
  const results = stats.getResults();
  const best = results.reduce((max, item) => Math.max(max, Number(item.wpm) || 0), 0);
  const avgAcc = results.length ? Math.round(results.reduce((sum, item) => sum + (Number(item.accuracy) || 0), 0) / results.length) : 0;
  const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = stats.formatNumber(value); };
  set('home-best-wpm', best); set('home-average-accuracy', avgAcc); set('home-session-count', results.length);
  const today = stats.localDateKey();
  const todayCount = results.filter(item => stats.localDateKey(item.date) === today).length;
  const count = Math.min(3, todayCount); set('daily-count', count); set('daily-percent', Math.round((count / 3) * 100) + '٪');
  const progress = document.getElementById('daily-progress'); if (progress) progress.setAttribute('aria-valuenow', String(count));
  const bar = document.getElementById('daily-progress-bar'); if (bar) bar.style.width = (count / 3 * 100) + '%';
  const message = document.getElementById('daily-message'); if (message) message.textContent = count >= 3 ? 'عالي! د نن ورځې هدف مو بشپړ کړ.' : 'د نن ورځې هدف ته د رسېدو لپاره ' + stats.formatNumber(3 - count) + ' تمرینونه پاتې دي.';
  const lessons = Array.isArray(window.KhaksarLessons) ? window.KhaksarLessons : [];
  const completed = stats.getCompletedLessons();
  const recommended = lessons.find(item => !completed.includes(item.id)) || lessons[0];
  if (recommended) {
    const title = document.getElementById('recommended-title'); if (title) title.textContent = recommended.title;
    const description = document.getElementById('recommended-description'); if (description) description.textContent = recommended.description;
    const link = document.getElementById('recommended-link'); if (link) { link.href = 'pages/practice.html?lesson=' + encodeURIComponent(recommended.id); link.innerHTML = 'درس ته لاړ شئ <span aria-hidden="true">←</span>'; }
  }
})();
