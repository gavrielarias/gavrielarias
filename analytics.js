/* Free analytics, loaded on every public page.
   Paste each ID once the property exists. An empty ID loads nothing, so this file
   is safe to publish before the accounts are created. */
'use strict';
const ANALYTICS = {
  ga4: 'G-EK6JFWWL7Z', // Google Analytics 4 Measurement ID, e.g. 'G-XXXXXXXXXX'
  clarity: 'zdt0afx8b1', // Microsoft Clarity project ID, e.g. 'abcd1234ef'
  linkedin: '',   // LinkedIn Insight Tag Partner ID, e.g. '1234567'
  vercel: false   // true after enabling Web Analytics in the Vercel project
};

// European visitors get cookieless measurement until a consent banner exists.
const inEurope = (() => {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone.startsWith('Europe/'); } catch { return false; }
})();
const EEA = ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IS','IE','IT','LV','LI','LT','LU','MT','NL','NO','PL','PT','RO','SK','SI','ES','SE','CH','GB'];

function loadScript(src) {
  const script = document.createElement('script');
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

if (ANALYTICS.ga4) {
  const denied = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' };
  window.gtag('consent', 'default', { ...denied, analytics_storage: 'denied', region: EEA });
  window.gtag('consent', 'default', { ...denied, analytics_storage: 'granted' });
  loadScript(`https://www.googletagmanager.com/gtag/js?id=${ANALYTICS.ga4}`);
  window.gtag('js', new Date());
  window.gtag('config', ANALYTICS.ga4);
}

if (ANALYTICS.clarity) {
  window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
  loadScript(`https://www.clarity.ms/tag/${ANALYTICS.clarity}`);
  if (inEurope) window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' });
}

if (ANALYTICS.linkedin && !inEurope) {
  window._linkedin_partner_id = ANALYTICS.linkedin;
  window._linkedin_data_partner_ids = [ANALYTICS.linkedin];
  window.lintrk = window.lintrk || function (a, b) { window.lintrk.q.push([a, b]); };
  window.lintrk.q = window.lintrk.q || [];
  loadScript('https://snap.licdn.com/li.lms-analytics/insight.min.js');
}

if (ANALYTICS.vercel) {
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  loadScript('/_vercel/insights/script.js');
}

// One function for every conversion event on the site.
window.siteTrack = function (name, params = {}) {
  const data = { page_language: document.documentElement.lang, ...params };
  if (ANALYTICS.ga4) window.gtag('event', name, data);
  if (ANALYTICS.clarity) window.clarity('event', name);
};

// Every call to action, plus any WhatsApp, Cal.com or email link, is reported by
// what it does and where it sits on the page.
document.addEventListener('click', event => {
  const el = event.target.closest('a, button[data-track]');
  if (!el) return;
  const href = el.getAttribute('href') || '';
  let name = el.dataset.track;
  if (!name) {
    if (href.includes('wa.me')) name = 'contact_whatsapp';
    else if (href.includes('cal.com')) name = 'cta_book_call_page';
    else if (href.startsWith('mailto:')) name = 'contact_email';
    else if (/linkedin|behance|instagram|tiktok/.test(href)) name = 'social_click';
    else return;
  }
  const location = el.dataset.trackLocation || el.closest('section[id], header, footer')?.id || el.closest('header, footer')?.tagName.toLowerCase() || 'page';
  window.siteTrack(name, { location, link_text: el.textContent.trim().slice(0, 60) });
}, { capture: true });
