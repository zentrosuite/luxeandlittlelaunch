import { silk } from './silk.js';
import { ink } from './ink.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

silk($('#silk'));

/*
 * Soft blur-in words — after AnimatedWebs "Soft Blur-In Words" (Sereno, free template):
 * words drift up out of a blur into focus, 95 ms apart, with a breath after every 4th word.
 */
$$('[data-blur]').forEach((el) => {
  const words = el.textContent.trim().split(/\s+/);
  el.setAttribute('aria-label', el.textContent.trim());
  el.textContent = '';
  words.forEach((w, i) => {
    const s = document.createElement('span');
    s.className = 'w'; s.textContent = w; s.setAttribute('aria-hidden', 'true');
    s.style.setProperty('--i', i); s.style.setProperty('--breath', Math.floor(i / 4));
    el.append(s, ' ');
  });
});
const reveal = (el) => el.classList.add('in');
const io = 'IntersectionObserver' in window
  ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' })
  : null;

// Hero sequence: emblem unveils, the name inks in, then the tagline and the rest breathe in.
const hero = $('.hero');
const lift = () => $$('.veil', hero).forEach(reveal);
setTimeout(lift, reduce ? 0 : 250);
ink($('#ink'), {
  onDone: () => {
    $$('[data-blur], .countdown, .ctas, .scroll-cue', hero).forEach((el, i) => setTimeout(() => reveal(el), reduce ? 0 : i * 260));
  },
});

// Everything below the hero reveals as it scrolls into view (lace veils, words, cards).
$$('main > section:not(.hero) [data-blur], main > section:not(.hero) .veil, .reveal').forEach((el) => (io ? io.observe(el) : reveal(el)));

/* Countdown to the opening (approximate: 1 December 2026, 10:00 IST). */
const target = new Date('2026-12-01T10:00:00+05:30').getTime();
const cd = $('.countdown');
const cells = Object.fromEntries($$('[data-unit]', cd).map((c) => [c.dataset.unit, c]));
let prev = {};
const tick = () => {
  let s = Math.max(0, Math.floor((target - Date.now()) / 1000));
  const v = { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
  for (const k in v) {
    const txt = k === 'd' ? String(v[k]) : String(v[k]).padStart(2, '0');
    if (prev[k] !== txt) {
      const el = cells[k];
      el.textContent = txt;
      if (!reduce && prev[k] !== undefined) { el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick'); }
    }
  }
  prev = Object.fromEntries(Object.entries(v).map(([k, n]) => [k, k === 'd' ? String(n) : String(n).padStart(2, '0')]));
  $('#cd-label').textContent = s ? `${v.d} days to go` : 'We are open';
};
tick();
setInterval(tick, 1000);

$('#year').textContent = new Date().getFullYear();
