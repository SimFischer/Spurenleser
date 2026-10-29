import { adventures } from '../data/adventures.js';
import { start, choose, accuse, meets } from './engine.js';
import { save, load, clear } from './save.js';
import { entries } from './notebook.js';
import { teacherContent } from './teacher.js';
let adventure = adventures.find(item => load(item)) || adventures[0];
let state = load(adventure);
let settings = { large: false, ruler: false };
try { Object.assign(settings, JSON.parse(localStorage.getItem('spurenleser.settings') || '{}')); } catch { /* Settings are optional. */ }
const main = document.querySelector('#main');
const drawer = document.querySelector('#drawer');
const nav = document.querySelector('#nav');
let route = 'home', notebookTab = 'clues', noticeTimer, lastFocus;
export const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const button = (label, action, cls = '') => `<button class="button ${cls}" data-action="${action}">${label}</button>`;
function applySettings() {
  document.body.classList.toggle('large-text', !!settings.large);
  document.body.classList.toggle('reading-ruler', !!settings.ruler);
}
applySettings();
function persist() {
  const success = save(state);
  if (!success) notify('Automatisches Speichern ist hier nicht möglich. Euer Fortschritt bleibt nur erhalten, solange diese Seite geöffnet ist.');
  return success;
}
function notify(message) {
  clearTimeout(noticeTimer);
  const node = document.querySelector('#notifications');
  node.replaceChildren();
  const p = document.createElement('p'); p.textContent = message; node.append(p);
  noticeTimer = setTimeout(() => node.replaceChildren(), 12000);
}
function render(focus = false) {
  nav.innerHTML = route === 'game' && state
    ? `<button data-action="notebook" aria-label="Notizbuch öffnen">▤ <span>Notizbuch</span><b>${state.clues.length}</b></button><button data-action="inventory" aria-label="Inventar öffnen">◈ <span>Inventar</span></button><button data-action="menu" aria-label="Menü öffnen">☰ <span>Menü</span></button>`
    : `<a href="#adventures">Abenteuer</a><a href="#teacher">Für Lehrkräfte</a>`;
  if (route === 'home') renderHome();
  else if (route === 'adventures') renderAdventures();
  else if (route === 'teacher') main.innerHTML = teacherContent(adventure, escape);
  else if (route === 'game' && state) renderGame();
  else { route = 'home'; renderHome(); }
  if (focus) { window.scrollTo({ top: 0, behavior: 'instant' }); main.focus({ preventScroll: true }); }
}
function renderHome() {
  main.innerHTML = `<section class="hero"><div class="hero-copy"><span class="eyebrow"><span class="gold-line"></span> DEIN NÄCHSTER FALL WARTET</span><h1>Jede Geschichte<br>hinterlässt <em>Spuren.</em></h1><p class="hero-lead">Lies genau. Sammle Hinweise.<br>Löse den Fall.</p><p class="hero-description">Werde Teil der Geschichte. Entdecke verborgene Hinweise und finde heraus, was wirklich passiert ist.</p><div class="hero-actions">${button('Abenteuer starten <span aria-hidden="true">↗</span>', 'adventures', 'primary')}${state ? button('Fortsetzen →', 'continue', 'secondary') : ''}</div><a class="teacher-link" href="#teacher">Für Lehrkräfte <span aria-hidden="true">→</span></a><div class="hero-meta"><span>Ab Klasse 5</span><span>In deinem Tempo</span><span>Ohne Anmeldung</span></div></div><div class="hero-art"><img src="assets/backgrounds/harbor.svg" alt="Illustriertes Backsteinmuseum am Hafen mit Leuchtturm im warmen Abendlicht"><div class="case-stamp"><span>FALLAKTE 01</span><strong>Eine Uhr fehlt.<br>Ein Geheimnis wartet.</strong><small>KÜSTENMUSEUM · NORDSEEKÜSTE</small></div></div></section>
  <section class="home-bottom"><div class="section-heading"><div><span class="eyebrow">AUFSCHLAGEN & LOSLEGEN</span><h2>Dein erstes Leseabenteuer</h2></div><a href="#adventures">Alle Abenteuer <span aria-hidden="true">→</span></a></div>${caseCard()}</section><section class="steps" aria-label="So spielst du"><div><span>01</span><h3>Lies zwischen den Zeilen.</h3><p>Jede Aussage kann wichtig sein.</p></div><div><span>02</span><h3>Verbinde die Hinweise.</h3><p>Dein Notizbuch denkt mit.</p></div><div><span>03</span><h3>Finde deine Lösung.</h3><p>Entscheide mit guten Gründen.</p></div></section>`;
}
function caseCard(adventure = adventures[0]) {
  return `<article class="adventure-card"><div class="card-art"><img src="assets/objects/watch.svg" alt="Silberne Taschenuhr mit Kette auf einer alten Seekarte"><span class="case-number">${String(adventures.indexOf(adventure) + 1).padStart(2, '0')}</span></div><div class="card-copy"><div class="tags"><span>${adventure.level}</span><span>${adventure.genre}</span><span>◷ ${adventure.duration}</span></div><h3>${adventure.title}</h3><p>${adventure.teaser}</p><div class="card-foot"><span>Genau lesen · Kombinieren · Schlussfolgern</span><button class="button secondary" data-action="open-case" data-adventure="${escape(adventure.id)}">Den Fall öffnen →</button></div></div></article>`;
}
function renderAdventures() {
  main.innerHTML = `<section class="page-intro"><span class="eyebrow">DIE FALLAKTEN</span><h1>Welche Spur verfolgst du?</h1><p>Nimm dir Zeit. Eine gute Beobachtung ist mehr wert als eine schnelle Vermutung.</p></section><section class="case-list" aria-label="Abenteuer">${adventures.map(item => caseCard(item)).join('')}<p class="muted">Die erste Fallakte ist geöffnet. Hier finden später weitere Geschichten ihren Platz.</p></section>`;
}
function renderGame() {
  const original = adventure.scenes[state.currentScene];
  const variant = original.variants?.find(item => meets(state, item));
  const scene = variant ? { ...original, text: variant.text } : original;
  const ending = state.ending && adventure.endings[state.ending];
  main.innerHTML = `<section class="game-heading"><div><span class="eyebrow">FALLAKTE ${String(adventures.indexOf(adventure) + 1).padStart(2, '0')}</span><p>${escape(adventure.title)}</p></div><span class="save-status">◌ Lokal gespeichert*</span></section><div class="game-layout"><aside class="scene-side"><img src="assets/backgrounds/harbor.svg" alt="Das Küstenmuseum am Hafen"><div class="scene-side-copy"><span class="eyebrow">EURE ERMITTLUNG</span><ol class="act-list">${adventure.acts.map((act, index) => `<li class="${state.act === index + 1 ? 'active' : ''}" ${state.act === index + 1 ? 'aria-current="step"' : ''}><span>${String(index + 1).padStart(2, '0')}</span>${act}</li>`).join('')}</ol><blockquote>„Ein Verdacht ist der Anfang einer Frage.“</blockquote><p class="muted">*Automatisch auf diesem Gerät. Kein Zurückspulen von Entscheidungen.</p></div></aside><article class="story-paper"><div class="scene-kicker"><span class="eyebrow">AKT ${state.act} · ${escape(scene.place)}</span><button class="text-size" data-action="text-size" aria-pressed="${!!settings.large}" aria-label="Große Schrift umschalten">A<span>A</span></button></div><h1>${escape(scene.title)}</h1>${ending ? `<div class="ending-label">Fallabschluss · ${escape(ending.name)}</div>` : ''}<div class="story-text">${scene.text.split('\n\n').map(p => `<p${settings.ruler ? ' tabindex="0"' : ''}>${escape(p)}</p>`).join('')}</div>${scene.accusation && !ending ? accusationForm() : ''}<div class="choices" aria-label="Nächste Handlung">${ending ? `<div class="end-reflection"><h2>${escape(ending.name)}</h2><p>${escape(ending.text)}</p><p>Welche Spur hat eure Meinung verändert? Besprecht eure Begründung miteinander.</p></div>${button('Eure Notizen ansehen', 'notebook', 'secondary')}${button('Einen neuen Versuch beginnen', 'restart', 'primary')}${button('Zur Abenteuerübersicht', 'adventures', 'quiet')}` : scene.choices.map((choice, index) => meets(state, choice) ? `<button class="choice" data-choice="${index}"><span>${escape(choice.label)}</span><span aria-hidden="true">→</span></button>` : '').join('')}</div></article></div>`;
  if (scene.accusation) document.querySelector('#evidence-form').addEventListener('submit', submitAccusation);
  updateSaveLabel();
}
function updateSaveLabel() {
  const label = document.querySelector('.save-status');
  if (label) label.textContent = load(adventure) ? '◌ Auf diesem Gerät gespeichert' : '◌ Spielstand nur in dieser Sitzung';
}
function accusationForm() {
  const evidence = state.clues.filter(id => Object.hasOwn(adventure.evidence, id));
  return `<form id="evidence-form" class="evidence-form"><fieldset><legend>Wen verdächtigt ihr?</legend><div class="suspects">${adventure.suspects.map(id => `<label><input type="radio" name="suspect" value="${id}" required><span>${escape(adventure.people[id].name)}</span></label>`).join('')}</div></fieldset><fieldset><legend>Welche bekannten Hinweise stützen das?</legend>${evidence.length ? evidence.map(id => `<label class="evidence-option"><input type="checkbox" name="evidence" value="${id}"><span><strong>${escape(adventure.clues[id].name)}</strong><small>${escape(adventure.clues[id].text)}</small></span></label>`).join('') : '<p>Ihr habt noch keine passenden Hinweise gesammelt. Ermittelt zuerst weiter.</p>'}</fieldset><fieldset><legend>Welches Motiv vermutet ihr?</legend>${adventure.accusation.motives.map(item => `<label class="radio-line"><input type="radio" name="motive" value="${escape(item.id)}" required> ${escape(item.label)}</label>`).join('')}</fieldset><button class="button primary" type="submit">Verdacht mit Beweisen begründen →</button></form>`;
}
function submitAccusation(event) {
  event.preventDefault();
  document.querySelector('#notifications').replaceChildren();
  const data = new FormData(event.currentTarget);
  const result = accuse(adventure, state, data.get('suspect'), data.getAll('evidence'), data.get('motive'));
  persist(); render(true); if (result.message) notify(result.message);
}
function openDialog(title, content) {
  lastFocus = document.activeElement;
  document.querySelector('#drawer-title').textContent = title;
  document.querySelector('#drawer-content').innerHTML = content;
  if (!drawer.open) drawer.showModal();
}
function closeDialog() { drawer.close(); lastFocus?.focus(); }
function showNotebook(tab = 'clues') {
  notebookTab = tab;
  const tabs = { clues: 'Hinweise', people: 'Personen', insights: 'Erkenntnisse', locations: 'Orte' };
  const list = entries(adventure, state, tab);
  openDialog('Euer Notizbuch', `<p class="muted">Beobachtungen festhalten. Zusammenhänge entdecken.</p><nav class="notebook-tabs" aria-label="Notizbuchbereiche">${Object.entries(tabs).map(([id, title]) => `<button data-tab="${id}" aria-pressed="${id === tab}">${title}</button>`).join('')}</nav><div class="notes-list">${list.length ? list.map(item => `<article class="note"><h3>${escape(item.name)}</h3><p>${escape(item.text)}</p></article>`).join('') : '<p class="empty-note">Hier ist noch Platz für eure ersten Entdeckungen.</p>'}</div>`);
}
function showMenu() {
  openDialog('Eine kleine Lesepause', `<div class="menu-actions">${button('Weiterlesen', 'close', 'primary')}${button('Zur Startseite', 'home', 'secondary')}${button(settings.large ? 'Normale Schrift verwenden' : 'Schrift vergrößern', 'text-size', 'secondary')}${button(settings.ruler ? 'Leselineal ausschalten' : 'Leselineal einschalten', 'ruler', 'secondary')}${button('Lehrkräftebereich', 'teacher', 'secondary')}${button('Fall neu beginnen', 'restart', 'quiet')}${button('Spielstand von diesem Gerät löschen', 'delete-save', 'quiet')}</div><p class="muted">Das Leselineal folgt Maus oder Finger über dem Text. Tastatur: Textabsätze werden beim Fokussieren hervorgehoben.</p>`);
}
function confirmRestart() {
  openDialog('Den Fall neu beginnen?', `<p>Eure bisherigen Hinweise und Entscheidungen werden durch einen neuen Spielstand ersetzt.</p><div class="menu-actions">${button('Bisherigen Spielstand behalten', 'close', 'secondary')}${button('Ja, neu beginnen', 'confirm-restart', 'primary')}</div>`);
}
function navigate(target) {
  document.querySelector('#notifications').replaceChildren();
  if (drawer.open) closeDialog();
  if (location.hash === `#${target}`) { route = target; render(true); }
  else location.hash = target;
}
document.addEventListener('click', event => {
  const target = event.target.closest('[data-action], [data-choice], [data-tab]');
  if (!target) return;
  if (target.dataset.tab) { showNotebook(target.dataset.tab); drawer.querySelector(`[data-tab="${notebookTab}"]`).focus(); return; }
  if (target.hasAttribute('data-choice')) {
    document.querySelector('#notifications').replaceChildren();
    const fresh = choose(adventure, state, Number(target.dataset.choice));
    const saved = persist(); render(true);
    if (fresh.length) notify(`Neue Erkenntnis: ${fresh.map(id => adventure.insights[id].text).join(' ')}${saved ? '' : ' Achtung: Speichern ist hier nicht möglich.'}`);
    return;
  }
  switch (target.dataset.action) {
    case 'adventures': navigate('adventures'); break;
    case 'home': navigate('home'); break;
    case 'teacher': navigate('teacher'); break;
    case 'continue': navigate('game'); break;
    case 'open-case':
      adventure = adventures.find(item => item.id === target.dataset.adventure) || adventures[0];
      if (!state || state.adventure !== adventure.id) state = load(adventure);
      if (state) openDialog('Die Fallakte öffnen', `<p>Für diesen Fall liegt ein Spielstand vor. Ihr könnt eure Ermittlung fortsetzen oder neu beginnen.</p><div class="menu-actions">${button('Fortsetzen', 'continue', 'primary')}${button('Neu beginnen', 'restart', 'secondary')}</div>`);
      else { state = start(adventure); persist(); navigate('game'); } break;
    case 'restart': confirmRestart(); break;
    case 'confirm-restart': state = start(adventure); persist(); navigate('game'); break;
    case 'notebook': showNotebook(); break;
    case 'inventory': {
      const items = entries(adventure, state, 'inventory');
      openDialog('Euer Inventar', items.length ? items.map(item => `<article class="note"><h3>${escape(item.name)}</h3><p>${escape(item.text)}</p></article>`).join('') : '<p>Noch keine gesicherten Gegenstände.'); break;
    }
    case 'menu': showMenu(); break;
    case 'close': closeDialog(); break;
    case 'text-size': case 'ruler': {
      const key = target.dataset.action === 'ruler' ? 'ruler' : 'large'; settings[key] = !settings[key];
      try { localStorage.setItem('spurenleser.settings', JSON.stringify(settings)); } catch { /* Optional. */ }
      applySettings(); render(); if (drawer.open) showMenu(); break;
    }
    case 'delete-save': openDialog('Spielstand löschen?', `<p>Damit werden alle Fortschritte dieses Falls auf diesem Gerät gelöscht.</p><div class="menu-actions">${button('Behalten', 'close', 'secondary')}${button('Spielstand endgültig löschen', 'confirm-delete', 'primary')}</div>`); break;
    case 'confirm-delete': if (clear(adventure)) { state = null; navigate('home'); notify('Der Spielstand wurde gelöscht.'); } else notify('Der Browser erlaubt das Löschen gerade nicht.'); break;
    case 'print': window.print(); break;
  }
});
drawer.querySelector('#close-drawer').addEventListener('click', closeDialog);
drawer.addEventListener('click', event => { if (event.target === drawer && event.clientX < drawer.getBoundingClientRect().left) closeDialog(); });
window.addEventListener('hashchange', () => {
  // URL routes never contain scene IDs: browser navigation cannot rewind decisions.
  route = ['home', 'game', 'teacher', 'adventures'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'home';
  if (drawer.open) closeDialog(); render(true);
});
document.addEventListener('pointermove', event => {
  if (settings.ruler) document.documentElement.style.setProperty('--ruler-y', `${event.clientY}px`);
});
route = ['game', 'teacher', 'adventures'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'home';
render();

let printDetails = [];
window.addEventListener('beforeprint', () => { printDetails = [...document.querySelectorAll('.paper details:not([open])')]; printDetails.forEach(item => item.open = true); });
window.addEventListener('afterprint', () => { printDetails.forEach(item => item.open = false); printDetails = []; });
