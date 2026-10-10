(function () {
  'use strict';
  const PREFIX = 'khaksar-pashto-typing:v1:';
  const keys = { results: PREFIX + 'results', completed: PREFIX + 'completed', settings: PREFIX + 'settings' };

  function safeRead(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      const value = JSON.parse(raw);
      return value == null ? fallback : value;
    } catch (error) { return fallback; }
  }
  function safeWrite(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (error) { return false; }
  }
  function getResults() {
    const value = safeRead(keys.results, []);
    return Array.isArray(value) ? value.filter(item => item && typeof item === 'object') : [];
  }
  function saveResult(record) {
    const items = getResults();
    items.unshift(record);
    return safeWrite(keys.results, items.slice(0, 250));
  }
  function clearResults() { try { localStorage.removeItem(keys.results); return true; } catch (error) { return false; } }
  function getCompletedLessons() {
    const value = safeRead(keys.completed, []);
    return Array.isArray(value) ? value.filter(id => typeof id === 'string') : [];
  }
  function completeLesson(id) {
    if (!id) return;
    const completed = getCompletedLessons();
    if (!completed.includes(id)) { completed.push(id); safeWrite(keys.completed, completed); }
  }
  function getSettings() { const v = safeRead(keys.settings, {}); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }
  function saveSettings(value) { return safeWrite(keys.settings, value); }
  function splitGraphemes(value) {
    const text = String(value == null ? '' : value).normalize('NFC');
    if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
      try { return Array.from(new Intl.Segmenter('ps', { granularity: 'grapheme' }).segment(text), item => item.segment); }
      catch (error) { /* use Unicode code points below */ }
    }
    return Array.from(text);
  }
  function calculateStats(target, typed, elapsedSeconds) {
    const targetChars = splitGraphemes(target);
    const typedChars = splitGraphemes(typed);
    let correct = 0;
    for (let i = 0; i < typedChars.length; i += 1) {
      if (i < targetChars.length && typedChars[i] === targetChars[i]) correct += 1;
    }
    const seconds = Math.max(0, Number(elapsedSeconds) || 0);
    const minutes = seconds > 0 ? seconds / 60 : 0;
    const wpm = minutes ? Math.round((correct / 5) / minutes) : 0;
    const cpm = minutes ? Math.round(correct / minutes) : 0;
    const accuracy = typedChars.length ? Math.round((correct / typedChars.length) * 100) : 100;
    return { correct, typedCount: typedChars.length, errors: Math.max(0, typedChars.length - correct), accuracy, wpm, cpm, elapsedSeconds: Math.round(seconds), targetCount: targetChars.length };
  }
  function formatNumber(value, decimals) {
    const number = Number(value) || 0;
    return number.toLocaleString('ps-AF', { maximumFractionDigits: decimals == null ? 0 : decimals });
  }
  function formatClock(seconds) {
    const n = Math.max(0, Math.ceil(Number(seconds) || 0));
    const mins = Math.floor(n / 60); const secs = n % 60;
    return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
  }
  function localDateKey(dateLike) {
    const d = dateLike ? new Date(dateLike) : new Date();
    if (Number.isNaN(d.getTime())) return '';
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
  }
  function formatDate(dateLike) {
    const date = new Date(dateLike);
    if (Number.isNaN(date.getTime())) return 'نامعلوم وخت';
    try { return new Intl.DateTimeFormat('ps-AF', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date); }
    catch (error) { return date.toLocaleString(); }
  }
  function escapeHTML(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  }
  window.KhaksarStats = { keys, safeRead, safeWrite, getResults, saveResult, clearResults, getCompletedLessons, completeLesson, getSettings, saveSettings, splitGraphemes, calculateStats, formatNumber, formatClock, localDateKey, formatDate, escapeHTML };
})();
