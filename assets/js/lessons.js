(function () {
  'use strict';
  const stats = window.KhaksarStats;
  const lessons = Array.isArray(window.KhaksarLessons) ? window.KhaksarLessons : [];
  const grid = document.getElementById('lesson-grid');
  const filter = document.getElementById('lesson-filter');
  const search = document.getElementById('lesson-search');
  if (!stats || !grid) return;
  const levelNames = { 1: 'پیل کوونکي', 2: 'منځنۍ کچه', 3: 'پرمختللې کچه' };
  function render() {
    const completed = stats.getCompletedLessons();
    const level = filter ? filter.value : 'all';
    const query = (search ? search.value : '').trim().toLocaleLowerCase();
    const chosen = lessons.filter(lesson => (level === 'all' || String(lesson.level) === level) && (!query || (lesson.title + ' ' + lesson.description + ' ' + lesson.text).toLocaleLowerCase().includes(query)));
    grid.replaceChildren();
    chosen.forEach(lesson => {
      const card = document.createElement('article'); card.className = 'lesson-card';
      const top = document.createElement('div'); top.className = 'lesson-card-top';
      const art = document.createElement('div'); art.className = 'lesson-art level-' + lesson.level; art.textContent = lesson.glyph; art.setAttribute('aria-hidden', 'true');
      const badge = document.createElement('span'); badge.className = 'lesson-badge'; badge.textContent = levelNames[lesson.level] || 'تمرین';
      top.append(art, badge);
      const title = document.createElement('h2'); title.textContent = lesson.title;
      const desc = document.createElement('p'); desc.textContent = lesson.description;
      const meta = document.createElement('div'); meta.className = 'lesson-card-meta';
      const time = document.createElement('span'); time.textContent = '◷ ' + lesson.minutes + ' دقیقې';
      const length = document.createElement('span'); length.textContent = '▤ ' + stats.formatNumber(stats.splitGraphemes(lesson.text).length) + ' توري';
      meta.append(time, length);
      const foot = document.createElement('div'); foot.className = 'lesson-card-footer';
      const state = document.createElement('span'); state.className = 'done-label';
      const isDone = completed.includes(lesson.id); state.textContent = isDone ? '✓ بشپړ شوی' : '○ لا پاتې';
      const link = document.createElement('a'); link.className = 'button ' + (isDone ? 'button-secondary' : 'button-primary'); link.href = 'practice.html?lesson=' + encodeURIComponent(lesson.id); link.textContent = isDone ? 'بیا تمرین' : 'درس پیل کړئ';
      foot.append(state, link); card.append(top, title, desc, meta, foot); grid.appendChild(card);
    });
    const empty = document.getElementById('lesson-empty'); if (empty) empty.hidden = chosen.length > 0;
    const count = document.getElementById('lessons-completed'); if (count) count.textContent = stats.formatNumber(completed.filter(id => lessons.some(lesson => lesson.id === id)).length) + ' / ' + stats.formatNumber(lessons.length);
    const validCompleted = completed.filter(id => lessons.some(lesson => lesson.id === id)).length;
    const percentage = lessons.length ? Math.round(validCompleted / lessons.length * 100) : 0;
    const label = document.getElementById('lesson-progress-label'); if (label) label.textContent = stats.formatNumber(percentage) + '٪';
    const bar = document.getElementById('lesson-progress-bar'); if (bar) bar.style.width = percentage + '%';
  }
  if (filter) filter.addEventListener('change', render);
  if (search) search.addEventListener('input', render);
  render();
})();
