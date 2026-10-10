(function () {
  'use strict';
  const stats = window.KhaksarStats;
  if (!stats) return;
  const $ = id => document.getElementById(id);
  const input = $('typing-input');
  const passageDisplay = $('passage-display');
  if (!input || !passageDisplay) return;

  const durationSelect = $('duration-select');
  const levelSelect = $('level-select');
  const topicSelect = $('topic-select');
  const newPassageButton = $('new-passage');
  const finishButton = $('finish-session');
  const resetButton = $('reset-session');
  const lessonList = Array.isArray(window.KhaksarLessons) ? window.KhaksarLessons : [];
  const passages = Array.isArray(window.KhaksarPassages) ? window.KhaksarPassages : [];
  const params = new URLSearchParams(window.location.search);
  const requestedLesson = params.get('lesson');

  let activeLesson = lessonList.find(item => item.id === requestedLesson) || null;
  let activePassage = null;
  let targetText = '';
  let targetChars = [];
  let startedAt = 0;
  let timerHandle = null;
  let elapsedSeconds = 0;
  let durationSeconds = Number(durationSelect && durationSelect.value) || 60;
  let isRunning = false;
  let isFinished = false;

  function setText(id, text) { const el = $(id); if (el) el.textContent = text; }
  function getTypedText() { return String(input.value || '').normalize('NFC'); }
  function getTypedChars() { return stats.splitGraphemes(getTypedText()); }
  function getDuration() { return Math.max(1, Number(durationSelect && durationSelect.value) || 60); }
  function topicMatches(passage, topic) { return topic === 'all' || passage.category === topic; }
  function chooseRandomPassage() {
    const level = levelSelect ? levelSelect.value : 'all';
    const topic = topicSelect ? topicSelect.value : 'all';
    let candidates = passages.filter(item => (level === 'all' || String(item.level) === level) && topicMatches(item, topic));
    if (!candidates.length) candidates = passages.filter(item => level === 'all' || String(item.level) === level);
    if (!candidates.length) candidates = passages.slice();
    const available = candidates.filter(item => item.text !== (activePassage && activePassage.text));
    const pool = available.length ? available : candidates;
    return pool[Math.floor(Math.random() * pool.length)] || passages[0] || { level: 1, title: 'د تمرین متن', text: 'پښتو په دقت سره ولیکئ.' };
  }
  function setPassage(passage, lesson) {
    activePassage = passage;
    activeLesson = lesson || null;
    targetText = String(passage.text || '').normalize('NFC');
    targetChars = stats.splitGraphemes(targetText);
    setText('passage-title', passage.title || (lesson && lesson.title) || 'د تمرین متن');
    setText('passage-level', lesson ? ('درس: ' + lesson.title) : ({ 1: 'پیل کوونکي', 2: 'منځنۍ کچه', 3: 'پرمختللې کچه' }[passage.level] || 'تمرین'));
    passageDisplay.setAttribute('aria-label', targetText);
    renderPassage();
  }
  function randomizePassage() {
    const selected = chooseRandomPassage();
    setPassage(selected, null);
    resetSession(true);
  }
  function renderPassage() {
    const typed = getTypedChars();
    const fragment = document.createDocumentFragment();
    targetChars.forEach((character, index) => {
      const span = document.createElement('span');
      span.className = 'char' + (character === ' ' ? ' is-space' : '');
      if (index < typed.length) span.classList.add(typed[index] === character ? 'is-correct' : 'is-wrong');
      else if (index === typed.length && !isFinished) span.classList.add('is-current');
      span.textContent = character === ' ' ? '\u00A0' : character;
      fragment.appendChild(span);
    });
    passageDisplay.replaceChildren(fragment);
    if (!targetChars.length) passageDisplay.textContent = 'د تمرین متن نه شته.';
  }
  function updateStats() {
    const typed = getTypedText();
    const current = stats.calculateStats(targetText, typed, elapsedSeconds);
    setText('live-wpm', stats.formatNumber(isRunning || isFinished ? current.wpm : 0));
    setText('live-accuracy', stats.formatNumber(typed.length ? current.accuracy : 100));
    setText('live-cpm', stats.formatNumber(isRunning || isFinished ? current.cpm : 0));
    setText('live-timer', stats.formatClock(Math.max(0, durationSeconds - elapsedSeconds)));
    const typedCount = getTypedChars().length;
    setText('typed-progress', stats.formatNumber(typedCount) + ' / ' + stats.formatNumber(targetChars.length) + ' توري');
    const ratio = targetChars.length ? Math.min(100, Math.round(typedCount / targetChars.length * 100)) : 0;
    const bar = $('typing-progress-bar'); if (bar) bar.style.width = ratio + '%';
    const progress = $('typing-progress'); if (progress) progress.setAttribute('aria-valuenow', String(ratio));
    renderPassage();
  }
  function setStatus(mode, label) {
    const el = $('session-status'); if (!el) return;
    el.className = 'session-status' + (mode ? ' is-' + mode : '');
    el.replaceChildren(); const dot = document.createElement('i'); const text = document.createElement('span'); text.textContent = label; el.append(dot, text);
  }
  function startTimer() {
    if (isRunning || isFinished) return;
    isRunning = true;
    startedAt = Date.now() - (elapsedSeconds * 1000);
    setStatus('running', 'تمرین روان دی');
    setText('session-feedback', 'ښه روان یاست؛ په دقت سره لیکلو ته دوام ورکړئ.');
    if (timerHandle) clearInterval(timerHandle);
    timerHandle = window.setInterval(tick, 200);
  }
  function tick() {
    if (!isRunning) return;
    elapsedSeconds = Math.min(durationSeconds, Math.max(0, (Date.now() - startedAt) / 1000));
    updateStats();
    if (elapsedSeconds >= durationSeconds) finishSession('time');
  }
  function stopTimer() { if (timerHandle) { clearInterval(timerHandle); timerHandle = null; } }
  function exactMatch() {
    const typed = getTypedChars();
    return typed.length === targetChars.length && typed.every((character, index) => character === targetChars[index]);
  }
  function finishSession(reason) {
    if (isFinished) return;
    if (isRunning) elapsedSeconds = Math.min(durationSeconds, Math.max(0, (Date.now() - startedAt) / 1000));
    if (reason === 'time') elapsedSeconds = durationSeconds;
    stopTimer(); isRunning = false; isFinished = true;
    const typed = getTypedText();
    const computed = stats.calculateStats(targetText, typed, elapsedSeconds);
    if (typed.length > 0) {
      const record = {
        id: Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8),
        date: new Date().toISOString(),
        title: activePassage && activePassage.title ? activePassage.title : 'د پښتو ټایپ تمرین',
        lessonId: activeLesson ? activeLesson.id : null,
        wpm: computed.wpm,
        cpm: computed.cpm,
        accuracy: computed.accuracy,
        correct: computed.correct,
        typedCount: computed.typedCount,
        errors: computed.errors,
        elapsedSeconds: Math.round(elapsedSeconds * 100) / 100,
        durationSeconds,
        completedText: exactMatch()
      };
      stats.saveResult(record);
      if (activeLesson && exactMatch()) stats.completeLesson(activeLesson.id);
      setText('session-feedback', exactMatch() ? 'ډېر ښه! متن مو په سمه توګه بشپړ کړ.' : (reason === 'time' ? 'وخت پای ته ورسېد؛ پایله مو ثبت شوه.' : 'پایله مو ثبت شوه. د لا ښه دقت لپاره بیا تمرین وکړئ.'));
    } else setText('session-feedback', reason === 'time' ? 'وخت پای ته ورسېد؛ د ثبت لپاره متن مو نه و لیکلی.' : 'متن مو نه دی لیکلی؛ د پایلې لپاره لږ تر لږه یو توری ولیکئ.');
    setStatus('finished', 'تمرین پای ته ورسېد');
    input.disabled = true;
    finishButton.disabled = true;
    updateStats();
  }
  function resetSession(keepPassage) {
    stopTimer(); isRunning = false; isFinished = false; startedAt = 0; elapsedSeconds = 0;
    durationSeconds = getDuration();
    input.disabled = false; input.value = '';
    finishButton.disabled = false;
    if (!keepPassage && !activePassage) setPassage(chooseRandomPassage(), null);
    setStatus('', 'د پیل لپاره چمتو');
    setText('session-feedback', 'د وخت حساب به د لومړي توري په لیکلو پیل شي.');
    updateStats();
    input.focus({ preventScroll: true });
  }
  input.addEventListener('paste', function (event) {
    event.preventDefault();
    setText('session-feedback', 'د عادلانه تمرین لپاره متن په کیبورډ ولیکئ؛ د Paste کارول نه منل کېږي.');
  });
  input.addEventListener('drop', function (event) {
    event.preventDefault();
    setText('session-feedback', 'د ټایپ تمرین لپاره متن په کیبورډ ولیکئ.');
  });
  input.addEventListener('input', function () {
    if (isFinished) return;
    const value = getTypedText();
    if (value.length > 0 && !isRunning) startTimer();
    updateStats();
    if (exactMatch() && targetChars.length > 0) finishSession('completed');
  });
  finishButton.addEventListener('click', function () { finishSession('manual'); });
  resetButton.addEventListener('click', function () { resetSession(true); });
  newPassageButton.addEventListener('click', randomizePassage);
  if (durationSelect) durationSelect.addEventListener('change', function () { durationSeconds = getDuration(); resetSession(true); });
  if (levelSelect) levelSelect.addEventListener('change', randomizePassage);
  if (topicSelect) topicSelect.addEventListener('change', randomizePassage);
  passageDisplay.addEventListener('click', function () { if (!input.disabled) input.focus(); });
  window.addEventListener('beforeunload', stopTimer);

  durationSeconds = getDuration();
  if (activeLesson) {
    setPassage(activeLesson, activeLesson);
    if (levelSelect) levelSelect.value = String(activeLesson.level);
    if (topicSelect) topicSelect.value = activeLesson.category;
  } else setPassage(chooseRandomPassage(), null);
  resetSession(true);
})();
