// Rakib Hasan - Portfolio v2 (Editorial Ink + Noir)
// Vanilla JS. No libraries. Respects prefers-reduced-motion.

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// ===== Footer year =====
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===== Top progress hairline + nav scrolled state =====
const progress = document.getElementById('progress');
const nav = document.getElementById('nav');
function onScroll() {
  const y = window.scrollY;
  if (progress) {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (scrollable > 0 ? (y / scrollable) * 100 : 0) + '%';
  }
  if (nav) nav.classList.toggle('is-scrolled', y > 20);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ===== Masked word reveals on section titles =====
(function maskTitles() {
  if (!('IntersectionObserver' in window)) return;
  const heads = document.querySelectorAll('.sec-head');

  function wrapWords(el, baseDelay) {
    const words = el.textContent.split(/\s+/).filter(Boolean);
    el.textContent = '';
    words.forEach((w, i) => {
      const mask = document.createElement('span');
      mask.className = 'mask';
      const inner = document.createElement('span');
      inner.className = 'mask__i';
      inner.textContent = w;
      inner.style.setProperty('--d', (baseDelay + i * 0.06) + 's');
      mask.appendChild(inner);
      el.appendChild(mask);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
  }

  heads.forEach(head => {
    const title = head.querySelector('.sec-title');
    if (title && !reduced) wrapWords(title, 0.08);
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-inview'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.35, rootMargin: '0px 0px -30px 0px' });
  heads.forEach(h => obs.observe(h));
})();

// ===== Generic reveal on scroll (with per-sibling stagger) =====
(function reveals() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || !els.length) return;

  // stagger siblings that share a parent
  const groups = new Map();
  els.forEach(el => {
    const parent = el.parentElement;
    if (!groups.has(parent)) groups.set(parent, 0);
    const idx = groups.get(parent);
    el.style.setProperty('--rd', Math.min(idx * 0.08, 0.4) + 's');
    groups.set(parent, idx + 1);
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
  els.forEach(el => obs.observe(el));
})();

// ===== Active nav tracking =====
(function activeNav() {
  const map = new Map();
  document.querySelectorAll('.nav__links a[data-nav]').forEach(a => map.set(a.dataset.nav, a));
  const ids = ['work', 'about', 'experience', 'contact'];
  const sections = ids.map(id => document.getElementById(id)).filter(Boolean);
  if (!('IntersectionObserver' in window) || !sections.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      map.forEach(a => a.classList.remove('is-active'));
      const link = map.get(e.target.id);
      if (link) link.classList.add('is-active');
    });
  }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
  sections.forEach(s => obs.observe(s));
})();

// ===== Hero stat count-up (fires once, on scroll into view) =====
(function statCountUp() {
  const el = document.querySelector('[data-countup]');
  if (!el || reduced || !('IntersectionObserver' in window)) return;
  const target = parseInt(el.dataset.countup, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 900;
  let started = false;

  function animate() {
    if (started) return;
    started = true;
    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = Math.round(target * eased);
      el.textContent = val.toLocaleString('en-US') + suffix;
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = target.toLocaleString('en-US') + suffix;
    }
    requestAnimationFrame(tick);
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { animate(); obs.unobserve(e.target); }
    });
  }, { threshold: 0.6 });
  obs.observe(el);
})();

// ===== Copy email icon with feedback =====
(function copyEmail() {
  const btn = document.getElementById('copyBtn');
  const flash = document.getElementById('copiedFlash');
  if (!btn) return;
  let timer;
  btn.addEventListener('click', async () => {
    let ok = true;
    try {
      await navigator.clipboard.writeText(btn.dataset.email);
    } catch (e) { ok = false; }
    btn.classList.add('is-copied');
    btn.setAttribute('aria-label', ok ? 'Email address copied' : 'Copy failed');
    if (flash) {
      flash.textContent = ok ? 'Copied to clipboard' : ('Press Ctrl/Cmd+C: ' + btn.dataset.email);
      flash.classList.add('is-on');
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      btn.classList.remove('is-copied');
      btn.setAttribute('aria-label', 'Copy email address');
      if (flash) flash.classList.remove('is-on');
    }, 1800);
  });
})();

// ===== Magnetic primary buttons (desktop only) =====
if (finePointer && !reduced) {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.12}px, ${y * 0.2}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}
