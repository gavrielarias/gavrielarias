'use strict';

// ═══════════════════════════════════════════════════
//  TAREAS DATA
// ═══════════════════════════════════════════════════
const TAREAS = [
  { id: 'tareas',    emoji: '📚', titulo: 'Hizo tareas / estudió con tiempo',                           meta: 5, puntos: 2 },
  { id: 'platos',    emoji: '🍽️', titulo: 'Lavó los platos y ordenó la cocina',                          meta: 4, puntos: 2 },
  { id: 'cama',      emoji: '🛏️', titulo: 'Cama, cuarto ordenado y piso limpio',                          meta: 2, puntos: 3 },
  { id: 'ropa',      emoji: '👕', titulo: 'Ropa sucia en la canasta',                                   meta: 6, puntos: 1 },
  { id: 'zapatos',   emoji: '👟', titulo: 'Zapatos en la zapatera',                                     meta: 6, puntos: 2 },
  { id: 'basura',    emoji: '🗑️', titulo: 'Sacó la basura',                                             meta: 2, puntos: 3 },
  { id: 'moto',      emoji: '🏍️', titulo: 'Limpió moto y casco',                                        meta: 1, puntos: 3 },
  { id: 'night',     emoji: '🐕', titulo: 'Paseó a Night',                                              meta: 2, puntos: 2 },
  { id: 'banio',     emoji: '🚿', titulo: 'No dejó ropa en el baño',                                    meta: 6, puntos: 1 },
  { id: 'pano',      emoji: '🪣', titulo: 'Colgó bien el paño',                                         meta: 4, puntos: 1 },
  { id: 'tutorias',  emoji: '⏰', titulo: 'Listo 15 min antes en tutorías',                              meta: 2, puntos: 1 },
  { id: 'celular',   emoji: '📵', titulo: 'Comió sin ver el celular',                                   meta: 3, puntos: 2 },
  { id: 'uniforme',  emoji: '👔', titulo: 'Lavó su uniforme',                                           meta: 3, puntos: 2 },
  { id: 'barrer',    emoji: '🧹', titulo: 'Barrer todo el piso de abajo',                               meta: 5, puntos: 3 },
  { id: 'reporte',   emoji: '📝', titulo: 'Dio reporte detallado a papá y tutorías de pendientes del cole', meta: 5, puntos: 2 },
];

const OBJETIVO = TAREAS.reduce((sum, t) => sum + t.meta * t.puntos, 0);

// ═══════════════════════════════════════════════════
//  FIREBASE INIT
// ═══════════════════════════════════════════════════
const FIREBASE_CONFIG = {
  apiKey:            'YOUR_API_KEY',
  authDomain:        'YOUR_PROJECT.firebaseapp.com',
  projectId:         'YOUR_PROJECT_ID',
  storageBucket:     'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId:             'YOUR_APP_ID',
};

let db = null;
let useFirebase = false;

try {
  firebase.initializeApp(FIREBASE_CONFIG);
  db = firebase.firestore();
  useFirebase = FIREBASE_CONFIG.apiKey !== 'YOUR_API_KEY';
} catch (e) {
  console.warn('Firebase not configured — using localStorage fallback');
}

// ═══════════════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════════════
let state = {
  weekId:    getMondayId(new Date()),
  counts:    Object.fromEntries(TAREAS.map(t => [t.id, 0])),
  coins:     0,
  deudas:    0,
  cerrada:   false,
  historial: [],
};

let viewingWeekId = getMondayId(new Date());
let isCurrentWeek = true;

// ═══════════════════════════════════════════════════
//  DATE HELPERS
// ═══════════════════════════════════════════════════
function getMondayId(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function addWeeks(id, n) {
  const d = new Date(id + 'T00:00:00');
  d.setDate(d.getDate() + n * 7);
  return d.toISOString().slice(0, 10);
}

function weekLabel(id) {
  const todayId = getMondayId(new Date());
  if (id === todayId) return 'Semana actual';
  const diff = Math.round((new Date(id) - new Date(todayId)) / 86400000 / 7);
  if (diff === -1) return 'Hace 1 semana';
  if (diff < -1) return `Hace ${Math.abs(diff)} semanas`;
  if (diff === 1) return 'Próxima semana';
  return id;
}

function formatWeekRange(id) {
  const start = new Date(id + 'T00:00:00');
  const end   = new Date(start); end.setDate(start.getDate() + 6);
  const fmt = d => d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
  return `${fmt(start)} – ${fmt(end)}`;
}

// ═══════════════════════════════════════════════════
//  COMPUTE DERIVED
// ═══════════════════════════════════════════════════
function computeCoins(counts) {
  return TAREAS.reduce((sum, t) => sum + Math.min(counts[t.id] || 0, t.meta) * t.puntos, 0);
}

function computeMisionesCompletadas(counts) {
  return TAREAS.filter(t => (counts[t.id] || 0) >= t.meta).length;
}

// ═══════════════════════════════════════════════════
//  PERSISTENCE — LocalStorage fallback
// ═══════════════════════════════════════════════════
const LS_KEY = 'sigma_life_v1';

function lsLoad() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function lsSave(data) {
  try {
    if (data === null) localStorage.removeItem(LS_KEY);
    else localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch {}
}

function lsLoadHistorial() {
  try {
    const raw = localStorage.getItem(LS_KEY + '_historial');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function lsSaveHistorial(h) {
  try { localStorage.setItem(LS_KEY + '_historial', JSON.stringify(h)); } catch {}
}

// ═══════════════════════════════════════════════════
//  PERSISTENCE — Firestore
// ═══════════════════════════════════════════════════
function getWeekDoc(weekId) {
  return db.collection('weeks').doc(weekId);
}

function buildWeekDoc(counts) {
  return {
    tareas:    TAREAS.map(t => ({ id: t.id, count: counts[t.id] || 0 })),
    coins:     computeCoins(counts),
    deudas:    state.deudas,
    cerrada:   false,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  };
}

async function ensureWeek(weekId) {
  const ref = getWeekDoc(weekId);
  const snap = await ref.get();
  if (!snap.exists) {
    const fresh = Object.fromEntries(TAREAS.map(t => [t.id, 0]));
    await ref.set(buildWeekDoc(fresh));
  }
}

function subscribeWeek(weekId, cb) {
  return getWeekDoc(weekId).onSnapshot(snap => {
    if (!snap.exists) {
      cb(null);
      return;
    }
    const data = snap.data();
    const counts = Object.fromEntries((data.tareas || []).map(t => [t.id, t.count]));
    cb({ counts, coins: data.coins || 0, deudas: data.deudas || 0, cerrada: data.cerrada || false });
  });
}

async function saveCount(weekId, tareaId, count) {
  const ref = getWeekDoc(weekId);
  const snap = await ref.get();
  if (!snap.exists) return;
  const data = snap.data();
  const tareas = (data.tareas || []).map(t => t.id === tareaId ? { ...t, count } : t);
  const counts = Object.fromEntries(tareas.map(t => [t.id, t.count]));
  await ref.update({ tareas, coins: computeCoins(counts) });
}

async function closingWeek(weekId, finalCounts) {
  await getWeekDoc(weekId).update({
    cerrada:    true,
    fechaCierre: firebase.firestore.FieldValue.serverTimestamp(),
    coins:       computeCoins(finalCounts),
  });
}

async function loadHistorialFirestore() {
  const snap = await db.collection('weeks')
    .where('cerrada', '==', true)
    .orderBy('fechaCierre', 'desc')
    .limit(20)
    .get();
  return snap.docs.map(d => {
    const data = d.data();
    const counts = Object.fromEntries((data.tareas || []).map(t => [t.id, t.count]));
    return {
      weekId:  d.id,
      coins:   data.coins || 0,
      deudas:  data.deudas || 0,
      misiones: computeMisionesCompletadas(counts),
    };
  });
}

// ═══════════════════════════════════════════════════
//  DOM REFS
// ═══════════════════════════════════════════════════
const $ = id => document.getElementById(id);
const screens      = { tareas: $('screen-tareas'), premios: $('screen-premios'), resumen: $('screen-resumen') };
const navTabs      = document.querySelectorAll('.nav-tab');
const missionsList = $('missions-list');
const headerCoins  = $('header-coins');
const headerDeudas = $('header-deudas');
const progressFill = $('progress-bar-fill');
const pointsValue  = $('points-value');
const pointsCurrent = $('points-current-label');
const pointsGoal   = $('points-goal-label');
const weekLabelEl  = $('week-label');
const papaBanner   = $('papa-banner');
const modalOverlay = $('modal-overlay');
const historialList = $('historial-list');

// ═══════════════════════════════════════════════════
//  RENDER MISSIONS
// ═══════════════════════════════════════════════════
function renderMissions(counts) {
  missionsList.innerHTML = '';
  TAREAS.forEach(t => {
    const count   = counts[t.id] || 0;
    const earned  = Math.min(count, t.meta) * t.puntos;
    const isMax   = count >= t.meta;

    const row = document.createElement('div');
    row.className = 'mission-row' + (isMax ? ' completed' : '');
    row.dataset.id = t.id;

    row.innerHTML = `
      <div class="mission-emoji-wrap" data-id="${t.id}">${t.emoji}</div>
      <div class="mission-info">
        <p class="mission-title">${t.titulo}</p>
        <p class="mission-weekly">${count}/${t.meta} esta semana</p>
      </div>
      <div class="mission-right">
        <div class="mission-controls">
          <button class="ctrl-btn minus" data-id="${t.id}" aria-label="Decrementar">−</button>
          <span class="mission-count" data-id="${t.id}">${count}</span>
          <button class="ctrl-btn plus" data-id="${t.id}" aria-label="Incrementar">+</button>
        </div>
        <div class="mission-coins">
          <img src="public/assets/icons/gold-coins-3.png" alt="coins" />
          <span data-coins="${t.id}">${earned}</span> coins
        </div>
      </div>`;
    missionsList.appendChild(row);
  });
}

// single delegated listener — set once
missionsList.addEventListener('click', handleMissionClick);

// ═══════════════════════════════════════════════════
//  HANDLE MISSION CLICK
// ═══════════════════════════════════════════════════
function handleMissionClick(e) {
  const btn = e.target.closest('.ctrl-btn');
  if (!btn) return;

  const id     = btn.dataset.id;
  const tarea  = TAREAS.find(t => t.id === id);
  if (!tarea) return;

  const current = state.counts[id] || 0;
  let next;

  if (btn.classList.contains('plus')) {
    if (current >= tarea.meta) return;
    next = current + 1;
  } else {
    if (current <= 0) return;
    next = current - 1;
  }

  state.counts[id] = next;
  updateStateCoins();
  patchMissionRow(id, next, tarea);
  updateHeader();
  updatePointsCard();
  persistCounts(id);

  // emoji pop
  const emojiWrap = missionsList.querySelector(`.mission-emoji-wrap[data-id="${id}"]`);
  if (emojiWrap) {
    emojiWrap.classList.remove('pop');
    void emojiWrap.offsetWidth;
    emojiWrap.classList.add('pop');
  }
}

function patchMissionRow(id, count, tarea) {
  const row      = missionsList.querySelector(`.mission-row[data-id="${id}"]`);
  const countEl  = missionsList.querySelector(`.mission-count[data-id="${id}"]`);
  const coinsEl  = missionsList.querySelector(`[data-coins="${id}"]`);
  const weeklyEl = row.querySelector('.mission-weekly');

  if (countEl)  countEl.textContent  = count;
  if (weeklyEl) weeklyEl.textContent = `${count}/${tarea.meta} esta semana`;
  if (coinsEl)  coinsEl.textContent  = Math.min(count, tarea.meta) * tarea.puntos;

  const isMax = count >= tarea.meta;
  row.classList.toggle('completed', isMax);
}

// ═══════════════════════════════════════════════════
//  UPDATE UI HELPERS
// ═══════════════════════════════════════════════════
function updateStateCoins() {
  state.coins = computeCoins(state.counts);
}

function updateHeader() {
  animateNumber(headerCoins,  state.coins);
  animateNumber(headerDeudas, state.deudas);
  $('premios-points').textContent = state.coins;
  $('stat-coins').textContent     = state.coins;
  $('stat-deudas').textContent    = state.deudas;
  $('stat-misiones').textContent  = computeMisionesCompletadas(state.counts);
}

function animateNumber(el, val) {
  el.textContent = val;
}

function updatePointsCard() {
  const pct = Math.min(state.coins / OBJETIVO * 100, 100);
  pointsValue.textContent        = state.coins;
  pointsCurrent.textContent      = state.coins;
  pointsGoal.textContent         = `Objetivo: ${OBJETIVO}`;
  progressFill.style.width       = `${pct}%`;
}

function updateWeekNav() {
  weekLabelEl.textContent = weekLabel(viewingWeekId);
  isCurrentWeek = viewingWeekId === getMondayId(new Date());
  $('btn-next-week').style.opacity = isCurrentWeek ? '0.3' : '1';
}

function renderHistorial(list) {
  if (!list || list.length === 0) {
    historialList.innerHTML = '<p class="historial-empty">Aún no hay semanas cerradas.</p>';
    return;
  }
  historialList.innerHTML = list.map(h => `
    <div class="historial-item">
      <div>
        <p class="historial-week-label">${weekLabel(h.weekId)}</p>
        <p class="historial-meta">${formatWeekRange(h.weekId)} · ${h.misiones} misiones</p>
      </div>
      <span class="historial-coins">${h.coins} pts</span>
    </div>`).join('');
}

// ═══════════════════════════════════════════════════
//  PERSIST
// ═══════════════════════════════════════════════════
function persistCounts(changedId) {
  if (useFirebase) {
    saveCount(state.weekId, changedId, state.counts[changedId]).catch(console.error);
  } else {
    lsSave({ weekId: state.weekId, counts: state.counts, deudas: state.deudas });
  }
}

// ═══════════════════════════════════════════════════
//  SCREEN NAVIGATION
// ═══════════════════════════════════════════════════
function showScreen(name) {
  Object.entries(screens).forEach(([k, el]) => {
    el.classList.remove('active', 'hidden', 'fade-in');
    if (k === name) {
      el.classList.add('active', 'fade-in');
    } else {
      el.classList.add('hidden');
    }
  });
  navTabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.screen === name);
  });
}

navTabs.forEach(tab => {
  tab.addEventListener('click', () => showScreen(tab.dataset.screen));
});

// ═══════════════════════════════════════════════════
//  WEEK NAVIGATION
// ═══════════════════════════════════════════════════
$('btn-prev-week').addEventListener('click', () => {
  viewingWeekId = addWeeks(viewingWeekId, -1);
  loadWeek(viewingWeekId);
});

$('btn-next-week').addEventListener('click', () => {
  if (isCurrentWeek) return;
  viewingWeekId = addWeeks(viewingWeekId, 1);
  loadWeek(viewingWeekId);
});

// ═══════════════════════════════════════════════════
//  LOAD WEEK
// ═══════════════════════════════════════════════════
let unsubscribe = null;

async function loadWeek(weekId) {
  updateWeekNav();

  if (unsubscribe) { unsubscribe(); unsubscribe = null; }

  if (useFirebase) {
    await ensureWeek(weekId);
    unsubscribe = subscribeWeek(weekId, data => {
      if (!data) return;
      if (weekId === viewingWeekId) {
        state.weekId = weekId;
        state.counts = data.counts;
        state.coins  = data.coins;
        state.deudas = data.deudas;
        state.cerrada = data.cerrada;
        fullRefresh();
      }
    });
  } else {
    // localStorage
    const saved = lsLoad();
    if (saved && saved.weekId === weekId) {
      state.weekId = weekId;
      state.counts = saved.counts || Object.fromEntries(TAREAS.map(t => [t.id, 0]));
      state.deudas = saved.deudas || 0;
    } else if (weekId === getMondayId(new Date())) {
      state.weekId = weekId;
      state.counts = Object.fromEntries(TAREAS.map(t => [t.id, 0]));
      state.deudas = 0;
      lsSave({ weekId: state.weekId, counts: state.counts, deudas: state.deudas });
    } else {
      // past week — check historial
      const hist = lsLoadHistorial();
      const entry = hist.find(h => h.weekId === weekId);
      state.weekId = weekId;
      state.counts = entry ? entry.counts : Object.fromEntries(TAREAS.map(t => [t.id, 0]));
      state.deudas = entry ? entry.deudas : 0;
    }
    updateStateCoins();
    fullRefresh();
    renderHistorial(lsLoadHistorial());
  }
}

function fullRefresh() {
  renderMissions(state.counts);
  updateHeader();
  updatePointsCard();
}

// ═══════════════════════════════════════════════════
//  CERRAR SEMANA
// ═══════════════════════════════════════════════════
$('btn-cerrar-semana').addEventListener('click', () => {
  $('modal-misiones').textContent = computeMisionesCompletadas(state.counts);
  $('modal-coins').textContent    = state.coins;
  $('modal-deudas').textContent   = state.deudas;
  modalOverlay.classList.remove('hidden');
});

$('btn-nueva-semana').addEventListener('click', async () => {
  // Save to historial
  const entry = {
    weekId:   state.weekId,
    coins:    state.coins,
    deudas:   state.deudas,
    misiones: computeMisionesCompletadas(state.counts),
    counts:   { ...state.counts },
  };

  if (useFirebase) {
    await closingWeek(state.weekId, state.counts).catch(console.error);
    const hist = await loadHistorialFirestore().catch(() => []);
    renderHistorial(hist);
  } else {
    const hist = lsLoadHistorial();
    hist.unshift(entry);
    lsSaveHistorial(hist);
    renderHistorial(hist);
    lsSave(null);
  }

  modalOverlay.classList.add('hidden');

  // New week
  viewingWeekId = getMondayId(new Date());
  state.weekId  = viewingWeekId;
  state.counts  = Object.fromEntries(TAREAS.map(t => [t.id, 0]));
  state.coins   = 0;
  state.deudas  = 0;

  updateStateCoins();
  fullRefresh();
  updateWeekNav();
  if (!useFirebase) lsSave({ weekId: state.weekId, counts: state.counts, deudas: state.deudas });

  showScreen('tareas');
});

// close modal on overlay click
modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) modalOverlay.classList.add('hidden');
});

// ═══════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════
async function init() {
  // Compute and show goal
  pointsGoal.textContent = `Objetivo: ${OBJETIVO}`;

  // Load historial
  if (useFirebase) {
    const hist = await loadHistorialFirestore().catch(() => []);
    renderHistorial(hist);
    $('stat-rachas').textContent = hist.length;
  } else {
    const hist = lsLoadHistorial();
    renderHistorial(hist);
    $('stat-rachas').textContent = hist.length;
  }

  await loadWeek(viewingWeekId);
  showScreen('tareas');
}

init().catch(console.error);
