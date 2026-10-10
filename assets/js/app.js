(function () {
  'use strict';
  const stats = window.KhaksarStats;
  const body = document.body;
  const base = body.dataset.base || './';
  const page = body.dataset.page || 'home';
  const paths = [
    { id: 'home', label: 'کور', href: base + 'index.html' },
    { id: 'practice', label: 'تمرین', href: base + 'pages/practice.html', icon: true },
    { id: 'lessons', label: 'درسونه', href: base + 'pages/lessons.html' },
    { id: 'results', label: 'پایلې', href: base + 'pages/results.html' },
    { id: 'about', label: 'په اړه', href: base + 'pages/about.html' }
  ];
  const header = document.getElementById('site-header');
  if (header) {
    header.className = 'site-header';
    header.innerHTML = '<div class="container header-inner">' +
      '<a class="brand" href="' + base + 'index.html" aria-label="د Khaksar Pashto Typing کورپاڼه"><span class="brand-mark" aria-hidden="true"><img class="brand-mark-icon" src="' + base + 'assets/icons/keyboard.svg" alt=""></span><span class="brand-copy"><strong>Khaksar Pashto Typing</strong><span><img class="typing-icon" src="' + base + 'assets/icons/keyboard.svg" alt="" aria-hidden="true"> د پښتو ټایپ تمرین</span></span></a>' +
      '<nav class="main-nav" id="main-nav" aria-label="اصلي لېنکونه">' + paths.map(item => '<a class="nav-link" href="' + item.href + '"' + (item.id === page ? ' aria-current="page"' : '') + '>' + (item.icon ? '<img class="typing-icon" src="' + base + 'assets/icons/keyboard.svg" alt="" aria-hidden="true"> ' : '') + item.label + '</a>').join('') + '</nav>' +
      '<div class="header-actions"><button class="theme-toggle" id="theme-toggle" type="button" aria-label="د رنګ حالت بدل کړئ" title="روښانه/تیاره حالت">◐</button><button class="menu-toggle" id="menu-toggle" type="button" aria-label="مینو خلاصه کړئ" aria-expanded="false" aria-controls="main-nav">☰</button></div></div>';
  }
  const footer = document.getElementById('site-footer');
  if (footer) {
    footer.className = 'site-footer';
    footer.innerHTML = '<div class="container footer-inner"><a class="footer-brand" href="' + base + 'index.html"><span class="brand-mark" aria-hidden="true"><img class="brand-mark-icon" src="' + base + 'assets/icons/keyboard.svg" alt=""></span><span>Khaksar Pashto Typing</span></a><span><img class="typing-icon" src="' + base + 'assets/icons/keyboard.svg" alt="" aria-hidden="true"> د پښتو ټایپ تمرین · د زده کړې لپاره جوړ شوی</span><div class="footer-links"><a href="' + base + 'pages/lessons.html">درسونه</a><a href="' + base + 'pages/results.html">پایلې</a><a href="' + base + 'pages/about.html">په اړه</a></div><span>© <span id="footer-year"></span></span></div>';
    const year = document.getElementById('footer-year'); if (year) year.textContent = String(new Date().getFullYear());
  }
  const settings = stats ? stats.getSettings() : {};
  const theme = settings.theme === 'dark' ? 'dark' : 'light';
  body.dataset.theme = theme;
  const themeToggle = document.getElementById('theme-toggle');
  function updateThemeButton() {
    if (!themeToggle) return;
    const dark = body.dataset.theme === 'dark';
    themeToggle.textContent = dark ? '☼' : '◐';
    themeToggle.setAttribute('aria-label', dark ? 'روښانه حالت فعال کړئ' : 'تیاره حالت فعال کړئ');
    themeToggle.title = dark ? 'روښانه حالت' : 'تیاره حالت';
    const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.setAttribute('content', dark ? '#101916' : '#f5f7f8');
  }
  updateThemeButton();
  if (themeToggle) themeToggle.addEventListener('click', function () {
    body.dataset.theme = body.dataset.theme === 'dark' ? 'light' : 'dark';
    const next = stats ? stats.getSettings() : {}; next.theme = body.dataset.theme;
    if (stats) stats.saveSettings(next);
    updateThemeButton();
  });
  const menuToggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('main-nav');
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', function () {
      const open = nav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? 'مینو بنده کړئ' : 'مینو خلاصه کړئ');
      menuToggle.textContent = open ? '×' : '☰';
    });
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) { nav.classList.remove('is-open'); menuToggle.setAttribute('aria-expanded', 'false'); menuToggle.textContent = '☰'; }
    });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape') { nav.classList.remove('is-open'); menuToggle.setAttribute('aria-expanded', 'false'); menuToggle.textContent = '☰'; } });
  }
})();
