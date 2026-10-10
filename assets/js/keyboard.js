(function () {
  'use strict';
  const input = document.getElementById('typing-input');
  const host = document.getElementById('virtual-keyboard');
  if (!input || !host) return;

  // Keys are grouped for convenient practice; the physical layout depends on the OS keyboard setting.
  const rows = [
    ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'چ'],
    ['ش', 'س', 'ی', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ک', 'ګ', 'پ'],
    ['ظ', 'ط', 'ز', 'ر', 'ړ', 'د', 'ډ', 'و', 'ږ', 'ژ', 'ښ', 'څ'],
    ['ځ', 'ټ', 'ذ', 'ؤ', 'ئ', 'ې', 'ۍ', 'ڼ', 'آ', 'ء', 'ي']
  ];
  const keyButtons = [];
  function makeKey(label, value, className, accessible) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'virtual-key' + (className ? ' ' + className : '');
    button.textContent = label;
    button.setAttribute('aria-label', accessible || label);
    button.title = accessible || label;
    if (value !== null) button.dataset.char = value;
    button.addEventListener('mousedown', event => event.preventDefault());
    button.addEventListener('click', () => insertValue(value));
    keyButtons.push(button);
    return button;
  }
  rows.forEach(row => {
    const line = document.createElement('div'); line.className = 'keyboard-row';
    row.forEach(letter => line.appendChild(makeKey(letter, letter, '', 'توری ' + letter)));
    host.appendChild(line);
  });
  const utility = document.createElement('div'); utility.className = 'keyboard-row';
  utility.appendChild(makeKey('فاصله', ' ', 'spacebar', 'فاصله داخل کړئ'));
  utility.appendChild(makeKey('← پاکول', 'BACKSPACE', 'wide-key', 'مخکینی توری پاک کړئ'));
  utility.appendChild(makeKey('نوی کرښه', '\n', 'wide-key', 'نوې کرښه داخل کړئ'));
  host.appendChild(utility);

  function insertValue(value) {
    if (value === null) return;
    input.focus();
    const start = input.selectionStart == null ? input.value.length : input.selectionStart;
    const end = input.selectionEnd == null ? start : input.selectionEnd;
    if (value === 'BACKSPACE') {
      if (start !== end) input.setRangeText('', start, end, 'end');
      else if (start > 0) {
        const before = input.value.slice(0, start);
        let graphemeStart = start - 1;
        if (typeof Intl !== 'undefined' && Intl.Segmenter) {
          try {
            const segments = Array.from(new Intl.Segmenter('ps', { granularity: 'grapheme' }).segment(before));
            if (segments.length) graphemeStart = segments[segments.length - 1].index;
          } catch (error) { /* fallback below */ }
        } else if (start >= 2 && /[\uD800-\uDBFF]/.test(before.slice(-2, -1))) graphemeStart = start - 2;
        input.setRangeText('', graphemeStart, start, 'end');
      }
    } else input.setRangeText(value, start, end, 'end');
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
  function clearActive() { keyButtons.forEach(button => button.classList.remove('is-active')); }
  function activate(key) {
    clearActive();
    if (!key) return;
    const found = keyButtons.find(button => button.dataset.char === key);
    if (found) found.classList.add('is-active');
    else if (key === ' ') { const space = keyButtons.find(button => button.classList.contains('spacebar')); if (space) space.classList.add('is-active'); }
  }
  input.addEventListener('keydown', event => {
    if (event.key === 'Backspace') activate('BACKSPACE');
    else if (event.key === ' ') activate(' ');
    else if (event.key && Array.from(event.key).length === 1) activate(event.key.normalize('NFC'));
  });
  input.addEventListener('keyup', clearActive);
  input.addEventListener('blur', clearActive);
  window.KhaksarKeyboard = { insertValue, clearActive };
})();
