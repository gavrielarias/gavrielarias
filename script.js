/* =====================================================
   GAVRIEL ARIAS — interactions
   ===================================================== */

/* ---------- Mobile menu ---------- */
const burgerBtn  = document.getElementById('burgerBtn');
const closeBtn   = document.getElementById('closeBtn');
const mobileMenu = document.getElementById('mobileMenu');

function openMenu() {
  mobileMenu.classList.add('open');
  mobileMenu.setAttribute('aria-hidden', 'false');
  burgerBtn.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}
function closeMenu() {
  mobileMenu.classList.remove('open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  burgerBtn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}
burgerBtn?.addEventListener('click', openMenu);
closeBtn?.addEventListener('click', closeMenu);
document.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMenu();
});

/* ---------- Duplicate marquee tracks for seamless infinite loop ---------- */
document.querySelectorAll('.marquee__track').forEach(track => {
  track.innerHTML += track.innerHTML;
});

/* ---------- Reveal on scroll ---------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); io.unobserve(entry.target); }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* ---------- Testimonials slideshow ---------- */
const track    = document.getElementById('slidesTrack');
const slides    = track ? Array.from(track.children) : [];
const prevBtn   = document.getElementById('prevBtn');
const nextBtn   = document.getElementById('nextBtn');
const dotsWrap  = document.getElementById('dots');
let index = 0;
let autoTimer = null;

if (track && slides.length) {
  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
    d.addEventListener('click', () => goTo(i, true));
    dotsWrap.appendChild(d);
  });
  const dots = Array.from(dotsWrap.children);

  function goTo(i, manual) {
    index = (i + slides.length) % slides.length;
    track.style.transform = 'translateX(-' + (index * 100) + '%)';
    dots.forEach((d, di) => d.classList.toggle('active', di === index));
    if (manual) restartAuto();
  }
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  nextBtn?.addEventListener('click', () => goTo(index + 1, true));
  prevBtn?.addEventListener('click', () => goTo(index - 1, true));

  function startAuto() { autoTimer = setInterval(next, 4500); }
  function restartAuto() { clearInterval(autoTimer); startAuto(); }
  startAuto();

  const shell = document.getElementById('slideshow');
  shell.addEventListener('mouseenter', () => clearInterval(autoTimer));
  shell.addEventListener('mouseleave', startAuto);

  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) (dx < 0 ? next() : prev());
    restartAuto();
  }, { passive: true });
}

/* ---------- Cal.com inline embed ---------- */
(function (C, A, L) {
  let p = function (a, ar) { a.q.push(ar); };
  let d = C.document;
  C.Cal = C.Cal || function () {
    let cal = C.Cal; let ar = arguments;
    if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; }
    if (ar[0] === L) {
      const api = function () { p(api, arguments); };
      const namespace = ar[1]; api.q = api.q || [];
      if (typeof namespace === "string") { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ["initNamespace", namespace]); }
      else p(cal, ar);
      return;
    }
    p(cal, ar);
  };
})(window, "https://app.cal.com/embed/embed.js", "init");

Cal("init", "15min", { origin: "https://app.cal.com" });
Cal.ns["15min"]("inline", {
  elementOrSelector: "#my-cal-inline-15min",
  config: { "layout": "month_view", "useSlotsViewOnSmallScreen": "true" },
  calLink: "gavrielarias/15min",
});
Cal.ns["15min"]("ui", {
  "cssVarsPerTheme": { "light": { "cal-brand": "#1f242f" }, "dark": { "cal-brand": "#fafafa" } },
  "hideEventTypeDetails": false,
  "layout": "month_view"
});
