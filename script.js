/* Progressive enhancement: all content remains readable without JavaScript. */
'use strict';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
// Respect the OS default; a visitor can explicitly opt into motion on this site.
const motionPreference = document.querySelector('.motion-preference');
let allowMotion = false;
try { allowMotion = localStorage.getItem('gavriel-motion') === 'on'; } catch {}
function applyMotionPreference() {
  if (allowMotion) document.documentElement.dataset.motion = 'on';
  else delete document.documentElement.dataset.motion;
  if (motionPreference) {
    motionPreference.textContent = allowMotion ? 'Use reduced motion' : 'Enable animations';
    motionPreference.setAttribute('aria-pressed', String(allowMotion));
  }
}
applyMotionPreference();
motionPreference?.addEventListener('click', () => {
  allowMotion = !allowMotion;
  try { localStorage.setItem('gavriel-motion', allowMotion ? 'on' : 'off'); } catch {}
  applyMotionPreference();
});

// A normal-flow disclosure, deliberately not an overlay or scroll lock.
const menuButton = document.querySelector('.menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
mobileMenu.inert = true;
function setMenu(open, returnFocus = false) {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  mobileMenu.classList.toggle('is-open', open);
  mobileMenu.inert = !open;
  if (returnFocus) menuButton.focus({ preventScroll: true });
}
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  setMenu(false);
  // Focus the destination after the normal-flow panel has collapsed.
  const target = document.querySelector(link.hash);
  if (target) {
    window.setTimeout(() => {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      target.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    }, reducedMotion.matches ? 0 : 510);
  }
}));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') setMenu(false, true);
});
window.matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) setMenu(false); });

// Exact duplicate groups prevent a seam. Duplicates are decorative and unfocusable.
document.querySelectorAll('[data-marquee]').forEach(marquee => {
  const track = marquee.querySelector('[data-track]');
  const group = track.querySelector('[data-group]');
  const initialItems = [...group.children];
  while (group.getBoundingClientRect().width < marquee.clientWidth && initialItems.length) {
    initialItems.forEach(item => { const clone = item.cloneNode(true); clone.setAttribute('aria-hidden', 'true'); group.appendChild(clone); });
  }
  const duplicate = group.cloneNode(true);
  duplicate.setAttribute('aria-hidden', 'true');
  duplicate.inert = true;
  duplicate.querySelectorAll('img').forEach(img => { img.alt = ''; });
  track.appendChild(duplicate);

});

// Warm all images in a moving strip shortly before it enters view, so off-screen
// cards are ready before the continuous animation brings them onto the screen.
if ('IntersectionObserver' in window) {
  const mediaObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('img[loading="lazy"]').forEach(img => { img.loading = 'eager'; });
      mediaObserver.unobserve(entry.target);
    }
  }), { rootMargin: '400px' });
  document.querySelectorAll('.work-marquee, .tools-marquee, .quote-carousel').forEach(el => mediaObserver.observe(el));
}

// YouTube makes no request until the visitor chooses to play.
document.querySelector('.reel-play').addEventListener('click', () => {
  const iframe = document.createElement('iframe');
  iframe.src = 'https://www.youtube-nocookie.com/embed/9jNRsr2kPPM?autoplay=1&rel=0';
  iframe.title = 'Gavriel Arias — Showreel';
  iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen';
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  document.getElementById('reel').replaceChildren(iframe);
  iframe.focus();
});

// Manual, keyboard and swipe navigation; no timer interrupts reading a long quote.
const carousel = document.querySelector('.quote-carousel');
const cards = [...carousel.querySelectorAll('.quote-card')];
const dots = carousel.querySelector('.quote-dots');
let quoteIndex = 0;
function showQuote(nextIndex) {
  quoteIndex = (nextIndex + cards.length) % cards.length;
  cards.forEach((card, i) => {
    const active = i === quoteIndex;
    card.classList.toggle('is-active', active);
    card.setAttribute('aria-hidden', String(!active));
    card.inert = !active;
    dots.children[i]?.setAttribute('aria-pressed', String(active));
  });
  document.getElementById('quote-current').textContent = String(quoteIndex + 1).padStart(2, '0');
}
cards.forEach((card, i) => {
  const dot = document.createElement('button');
  dot.type = 'button';
  dot.className = 'quote-dot';
  dot.setAttribute('aria-label', `Read testimonial by ${card.querySelector('strong').textContent}`);
  dot.setAttribute('aria-controls', card.id);
  dot.addEventListener('click', () => showQuote(i));
  dots.appendChild(dot);
});
carousel.classList.add('is-enhanced');
showQuote(0);
document.getElementById('quote-prev').addEventListener('click', () => showQuote(quoteIndex - 1));
document.getElementById('quote-next').addEventListener('click', () => showQuote(quoteIndex + 1));
carousel.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault(); showQuote(quoteIndex + (event.key === 'ArrowRight' ? 1 : -1));
  }
});
let touchStart = null;
carousel.addEventListener('touchstart', event => {
  const touch = event.touches[0]; touchStart = { x: touch.clientX, y: touch.clientY };
}, { passive: true });
carousel.addEventListener('touchend', event => {
  if (!touchStart) return;
  const dx = event.changedTouches[0].clientX - touchStart.x;
  const dy = event.changedTouches[0].clientY - touchStart.y;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) showQuote(quoteIndex + (dx < 0 ? 1 : -1));
  touchStart = null;
}, { passive: true });
carousel.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });

// Animate only when something is already entering the viewport: content is never
// left transparent if JavaScript, IntersectionObserver or an animation fails.
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-revealing'); observer.unobserve(entry.target); }
  }), { threshold: .1 });
  document.querySelectorAll('.section-heading, .service, .quote-carousel, .faq h2, .contact h2').forEach(el => observer.observe(el));
}

// Cal.com: initialize automatically near the booking section, with a permanent
// direct booking link outside the embed in case third-party scripts are blocked.
const bookingStatus = document.getElementById('calendar-status');
function loadCalendar() {
  const shell = document.getElementById('calendar-shell');
  bookingStatus.textContent = 'Loading available times…';
  shell.setAttribute('aria-busy', 'true');
  (function (C, A, L) {
    const p = (a, ar) => { a.q.push(ar); };
    const d = C.document;
    C.Cal = C.Cal || function () {
      const cal = C.Cal; const ar = arguments;
      if (!cal.loaded) {
        cal.ns = {}; cal.q = [];
        const script = d.createElement('script');
        script.src = A; script.async = true;
        script.addEventListener('error', () => {
          bookingStatus.textContent = 'The calendar could not load. Please use the booking page link below.';
          shell.removeAttribute('aria-busy');
        });
        d.head.appendChild(script); cal.loaded = true;
      }
      if (ar[0] === L) {
        const api = function () { p(api, arguments); };
        const namespace = ar[1]; api.q = [];
        if (typeof namespace === 'string') {
          cal.ns[namespace] = cal.ns[namespace] || api;
          p(cal.ns[namespace], ar); p(cal, ['initNamespace', namespace]);
        } else p(cal, ar);
        return;
      }
      p(cal, ar);
    };
  })(window, 'https://app.cal.com/embed/embed.js', 'init');
  window.Cal('init', 'let-s-connect', { origin: 'https://app.cal.com' });
  window.Cal.config = window.Cal.config || {};
  window.Cal.config.forwardQueryParams = true;
  window.Cal.ns['let-s-connect']('inline', {
    elementOrSelector: '#my-cal-inline-let-s-connect',
    config: { layout: 'month_view', useSlotsViewOnSmallScreen: 'true', theme: 'dark' },
    calLink: 'gavrielarias/let-s-connect'
  });
  window.Cal.ns['let-s-connect']('ui', {
    cssVarsPerTheme: { light: { 'cal-brand': '#1f242f' }, dark: { 'cal-brand': '#fafafa' } },
    hideEventTypeDetails: false, layout: 'month_view'
  });
  window.Cal.ns['let-s-connect']('on', {
    action: 'linkReady', callback: () => {
      bookingStatus.textContent = ''; shell.removeAttribute('aria-busy');
    }
  });
  // The iframe may not emit linkReady if a tracker blocker interrupts its scripts.
  window.setTimeout(() => {
    if (shell.hasAttribute('aria-busy')) {
      shell.removeAttribute('aria-busy');
      bookingStatus.textContent = 'If the calendar does not appear, open the booking page below.';
    }
  }, 15000);
}
if ('IntersectionObserver' in window) {
  const calendarObserver = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      calendarObserver.disconnect();
      loadCalendar();
    }
  }, { rootMargin: '600px' });
  calendarObserver.observe(document.getElementById('calendar-shell'));
} else {
  loadCalendar();
}
document.getElementById('year').textContent = new Date().getFullYear();

