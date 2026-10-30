import { adventures } from '../data/adventures.js';
import { start, choose, accuse, meets } from './engine.js';
import { save, load, clear } from './save.js';
import { entries } from './notebook.js';
import { teacherContent } from './teacher.js';
import { createTeacherAccess } from './teacher-access.js';
import { archivePresentation } from '../data/presentation.js';
import { icon, choiceKind } from './ui.js';
const teacherAccess = createTeacherAccess();
let adventure = adventures.find(item => load(item)) || adventures[0];
let state = load(adventure);
let settings = { large: false, ruler: false };
try { Object.assign(settings, JSON.parse(localStorage.getItem('spurenleser.settings') || '{}')); } catch { /* Settings are optional. */ }
const main = document.querySelector('#main');
const drawer = document.querySelector('#drawer');
const nav = document.querySelector('#nav');
let route = 'home', notebookTab = 'clues', noticeTimer, lastFocus;
export const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const button = (label, action, cls = '') => `<button class="button ${cls}" data-action="${action}"><span class="button-label">${label}</span></button>`;
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
  const p = document.createElement('p');
  if (message.startsWith('Neue Erkenntnis: ')) {
    const title = document.createElement('strong'); title.textContent = 'Neue Erkenntnis';
    const text = document.createElement('span'); text.textContent = message.slice('Neue Erkenntnis: '.length);
    p.classList.add('insight-notice'); p.append(title, text);
  } else p.textContent = message;
  node.append(p);
  noticeTimer = setTimeout(() => node.replaceChildren(), 12000);
}
function render(focus = false) {
  if (route === 'game' && !state) route = 'home';
  document.body.dataset.view = route;
  nav.innerHTML = route === 'game' && state
    ? `<button class="nav-tool" data-action="notebook" aria-label="Notizbuch öffnen">${icon('journal')}<span>Notizbuch</span><b>${state.clues.length}</b></button><button class="nav-tool" data-action="inventory" aria-label="Inventar öffnen">${icon('inventory')}<span>Inventar</span></button><button class="nav-tool" data-action="menu" aria-label="Menü öffnen">${icon('menu')}<span>Menü</span></button>`
    : `<a href="#adventures">Abenteuer</a><a href="#teacher">Für Lehrkräfte</a>`;
  if (route === 'home') renderHome();
  else if (route === 'adventures') renderAdventures();
  else if (route === 'teacher') renderTeacher();
  else if (route === 'game' && state) renderGame();
  else { route = 'home'; renderHome(); }
  if (focus) { window.scrollTo({ top: 0, behavior: 'instant' }); main.focus({ preventScroll: true }); }
}
function renderHome() {
  main.innerHTML = `
    <section class="library-entrance" aria-label="Willkommen im Geschichtenarchiv">
      <img class="library-backdrop" src="assets/library/story-archive.webp" alt="" fetchpriority="high">
      <div class="entrance-shade"></div>
      <div class="library-welcome">
        <span class="eyebrow entrance-eyebrow">Das Archiv der unentdeckten Geschichten</span>
        <img class="entrance-compass" src="assets/ui/compass.svg" alt="" width="64" height="64">
        <div class="title-engraving"><h1>SPURENLESER</h1></div>
        <p class="entrance-subtitle">Interaktive Leseabenteuer</p>
        ${icon('flourish', 'ornament')}
        <p class="entrance-claim">Lies genau. Sammle Hinweise.<br>Löse den Fall.</p>
        <div class="entrance-actions lectern-controls">
          ${button(`Abenteuer starten ${icon('arrow')}`, 'adventures', 'primary')}
          ${state ? button('Fortsetzen', 'continue', 'secondary') : ''}
        </div>
        <a class="teacher-link" href="#teacher">Lehrkräftebereich <span aria-hidden="true">↗</span></a>
        <p class="entrance-meta">Ab Klasse 5 · In deinem Tempo · Ohne Anmeldung</p>
      </div>
      <a class="entrance-signpost" href="#adventures"><span>Die erste Fallakte wartet</span><strong>Eine Uhr fehlt.<br>Ein Geheimnis erwacht.</strong><span aria-hidden="true">↓</span></a>
    </section>
    <section class="archive-preview">
      <div class="section-heading"><div><span class="eyebrow">Aus dem Geschichtenarchiv</span><h2>Schlag ein neues Kapitel auf.</h2></div><a href="#adventures">Zum Archiv →</a></div>
      ${caseCard()}
    </section>
    <section class="steps" aria-label="So spielst du">
      <div><span>I</span><h3>Lies zwischen den Zeilen.</h3><p>Jede Aussage kann wichtig sein.</p></div>
      <div><span>II</span><h3>Verbinde die Hinweise.</h3><p>Dein Ermittlungsjournal bewahrt die Spuren.</p></div>
      <div><span>III</span><h3>Finde deine Lösung.</h3><p>Entscheide mit guten Gründen.</p></div>
    </section>`;
}
function caseCard(item = adventures[0]) {
  const number = String(adventures.indexOf(item) + 1).padStart(2, '0');
  const art = archivePresentation[item.id];
  return `<article class="archive-volume">
    <div class="book-cover"><span class="book-series">SPURENLESER · BAND ${number}</span>
      ${art ? `<img src="${escape(art.cover)}" alt="${escape(art.coverAlt)}" loading="lazy">` : '<span class="book-emblem" aria-hidden="true">◇</span>'}
      <span class="book-cover-title">${escape(item.title)}</span>${icon('flourish', 'book-cover-rule')}
    </div>
    <div class="volume-description"><span class="file-clip" aria-hidden="true"></span><span class="archive-label">Fallakte № ${number} · Zum Lesen bereit</span>
      <h2>${escape(item.title)}</h2>
      <dl class="archive-facts"><div><dt>Lesestufe</dt><dd>${escape(item.level)}</dd></div><div><dt>Abteilung</dt><dd>${escape(item.genre)}</dd></div><div><dt>Lesezeit</dt><dd>ca. ${escape(item.duration)}</dd></div></dl>
      <p>${escape(item.teaser)}</p><p class="volume-skills">Genau lesen · Kombinieren · Schlussfolgern</p>
      <button class="button primary" data-action="open-case" data-adventure="${escape(item.id)}"><span class="button-label">Die Fallakte aufschlagen ${icon('arrow')}</span></button>
    </div></article>`;
}
function renderAdventures() {
  main.innerHTML = `<section class="page-intro archive-intro"><span class="eyebrow">Das Geschichtenarchiv</span><h1>Welches Buch öffnest du?</h1><p>Manche Geschichten warten darauf, dass jemand ihre Spuren liest.<br>Such dir eine Fallakte aus und beginne deine Ermittlung.</p></section>
    <section class="case-list" aria-label="Abenteuer im Archiv">${adventures.map(item => caseCard(item)).join('')}<p class="shelf-note">Das Archiv wächst. Hier ist Platz für viele weitere Geschichten.</p></section>`;
}
function renderTeacher() {
  if (teacherAccess.isUnlocked()) {
    main.innerHTML = `<div class="teacher-access-bar"><a href="#home">← Zur Startseite</a><button class="button quiet" data-action="lock-teacher">Bereich wieder schließen</button></div>${teacherContent(adventure, escape)}`;
    return;
  }
  main.innerHTML = `<section class="teacher-gate paper" aria-labelledby="gate-title">
    <span class="eyebrow">Unterlagen für Lehrkräfte</span><span class="gate-key" aria-hidden="true">${icon('lock')}</span>
    <h1 id="gate-title">Lehrkräftebereich</h1><p>Bitte gib den Zugangscode ein.</p>
    <form id="teacher-access-form"><label for="teacher-code">Zugangscode</label>
      <input id="teacher-code" name="code" type="password" required autocomplete="off" autocapitalize="off" spellcheck="false" aria-describedby="code-error">
      <p id="code-error" class="code-error" role="alert"></p><button class="button primary" type="submit"><span class="button-label">Öffnen ${icon('arrow')}</span></button>
    </form><a class="gate-home" href="#home">← Zur Startseite</a>
    <p class="gate-note">Eine einfache Zugangshürde, damit die Lösung nicht versehentlich aufgeschlagen wird.</p>
  </section>`;
  document.querySelector('#teacher-access-form').addEventListener('submit', event => {
    event.preventDefault();
    const input = document.querySelector('#teacher-code');
    if (teacherAccess.unlock(input.value)) { input.value = ''; render(true); }
    else {
      document.querySelector('#code-error').textContent = 'Der Code stimmt noch nicht. Bitte achte auf Groß- und Kleinschreibung.';
      input.setAttribute('aria-invalid', 'true'); input.select(); input.focus();
    }
  });
}
function renderGame() {
  const original = adventure.scenes[state.currentScene];
  const variant = original.variants?.find(item => meets(state, item));
  const scene = variant ? { ...original, text: variant.text } : original;
  const ending = state.ending && adventure.endings[state.ending];
  const choices = scene.choices.map((choice, index) => {
    if (!meets(state, choice)) return '';
    const kind = choiceKind(choice.label);
    return `<button class="choice choice-${kind}" data-kind="${kind}" data-choice="${index}">
      <span class="choice-emblem">${icon(kind)}</span><span class="choice-label">${escape(choice.label)}</span>${icon('arrow', 'choice-arrow')}
    </button>`;
  }).join('');
  main.innerHTML = `
    <section class="game-heading"><div><span class="eyebrow">FALLAKTE ${String(adventures.indexOf(adventure) + 1).padStart(2, '0')}</span><p>${escape(adventure.title)}</p></div><span class="save-status">Lokal gespeichert*</span></section>
    <div class="game-layout">
      <div class="book-binding" aria-hidden="true"></div>
      <aside class="scene-side">
        <div class="page-heading">${icon('flourish')}<span class="eyebrow">EURE ERMITTLUNG</span></div>
        <figure class="scene-print"><img src="assets/backgrounds/harbor.svg" alt="Das Küstenmuseum am Hafen"></figure>
        <p class="page-place">${icon('location')}<span>${escape(scene.place)}</span></p>
        <div class="scene-side-copy">
          <ol class="act-list">${adventure.acts.map((act, index) => `<li class="${state.act === index + 1 ? 'active' : ''}" ${state.act === index + 1 ? 'aria-current="step"' : ''}><span>${String(index + 1).padStart(2, '0')}</span>${act}</li>`).join('')}</ol>
          <blockquote>„Ein Verdacht ist der Anfang einer Frage.“</blockquote>
          <p class="muted">*Automatisch auf diesem Gerät. Kein Zurückspulen von Entscheidungen.</p>
        </div>
      </aside>
      <article class="story-paper">
        <div class="scene-kicker"><span class="eyebrow">AKT ${state.act} · ${escape(scene.place)}</span><button class="text-size" data-action="text-size" aria-pressed="${!!settings.large}" aria-label="Große Schrift umschalten">A<span>A</span></button></div>
        <div class="chapter-heading">${icon('flourish')}<h1>${escape(scene.title)}</h1></div>
        ${ending ? `<div class="ending-label">Fallabschluss · ${escape(ending.name)}</div>` : ''}
        <div class="story-text">${scene.text.split('\n\n').map(p => `<p${settings.ruler ? ' tabindex="0"' : ''}>${escape(p)}</p>`).join('')}</div>
        ${scene.accusation && !ending ? accusationForm() : ''}
        <div class="choices" aria-label="Nächste Handlung">${ending ? `
          <div class="end-reflection"><h2>${escape(ending.name)}</h2><p>${escape(ending.text)}</p><p>Welche Spur hat eure Meinung verändert? Besprecht eure Begründung miteinander.</p></div>
          ${button('Eure Notizen ansehen', 'notebook', 'secondary')}${button('Einen neuen Versuch beginnen', 'restart', 'primary')}${button('Zur Abenteuerübersicht', 'adventures', 'quiet')}` : choices}
        </div>
      </article>
    </div>`;
  if (scene.accusation) document.querySelector('#evidence-form').addEventListener('submit', submitAccusation);
  updateSaveLabel();
}
function updateSaveLabel() {
  const label = document.querySelector('.save-status');
  if (label) label.textContent = load(adventure) ? 'Auf diesem Gerät gespeichert' : 'Spielstand nur in dieser Sitzung';
}
function accusationForm() {
  const evidence = state.clues.filter(id => Object.hasOwn(adventure.evidence, id));
  return `<form id="evidence-form" class="evidence-form"><fieldset><legend>Wen verdächtigt ihr?</legend><div class="suspects">${adventure.suspects.map(id => `<label><input type="radio" name="suspect" value="${id}" required><span>${escape(adventure.people[id].name)}</span></label>`).join('')}</div></fieldset><fieldset><legend>Welche bekannten Hinweise stützen das?</legend>${evidence.length ? evidence.map(id => `<label class="evidence-option"><input type="checkbox" name="evidence" value="${id}"><span><strong>${escape(adventure.clues[id].name)}</strong><small>${escape(adventure.clues[id].text)}</small></span></label>`).join('') : '<p>Ihr habt noch keine passenden Hinweise gesammelt. Ermittelt zuerst weiter.</p>'}</fieldset><fieldset><legend>Welches Motiv vermutet ihr?</legend>${adventure.accusation.motives.map(item => `<label class="radio-line"><input type="radio" name="motive" value="${escape(item.id)}" required> ${escape(item.label)}</label>`).join('')}</fieldset><button class="button primary" type="submit"><span class="button-label">Verdacht mit Beweisen begründen ${icon('arrow')}</span></button></form>`;
}
function submitAccusation(event) {
  event.preventDefault();
  document.querySelector('#notifications').replaceChildren();
  const data = new FormData(event.currentTarget);
  const result = accuse(adventure, state, data.get('suspect'), data.getAll('evidence'), data.get('motive'));
  persist(); render(true); if (result.message) notify(result.message);
}
function openDialog(title, content, kind = 'menu') {
  drawer.dataset.kind = kind;
  if (!drawer.open) lastFocus = document.activeElement;
  document.querySelector('#drawer-title').textContent = title;
  document.querySelector('#drawer-content').innerHTML = content;
  if (!drawer.open) drawer.showModal();
}
function closeDialog() { drawer.close(); (lastFocus?.isConnected ? lastFocus : main).focus(); }
function showNotebook(tab = 'clues') {
  notebookTab = tab;
  const tabs = { clues: 'Hinweise', people: 'Personen', insights: 'Erkenntnisse', locations: 'Orte', inventory: 'Inventar' };
  const list = entries(adventure, state, tab);
  const notes = list.map((item, index) => {
    const initials = item.name.split(' ').map(word => word[0]).slice(0, 2).join('');
    return `<article class="note note-${tab}"><span class="note-number">${String(index + 1).padStart(2, '0')}</span>
      ${tab === 'people' ? `<span class="person-monogram" aria-hidden="true">${escape(initials)}</span>` : ''}
      <div class="note-content"><h3>${escape(item.name)}</h3>${item.role ? `<span class="person-role">${escape(item.role)}</span>` : ''}
      ${item.text.split('\n\n').map(text => `<p>${escape(text)}</p>`).join('')}</div></article>`;
  }).join('');
  openDialog('Euer Ermittlungsjournal', `<div class="journal-intro"><img src="assets/library/investigation-journal.webp" alt="" width="140" height="94"><p>Jede Spur hat ihren Platz.<br>Hier bewahrt ihr, was ihr bereits wisst.</p></div>
    <nav class="notebook-tabs" aria-label="Journalbereiche">${Object.entries(tabs).map(([id, title]) => `<button data-tab="${id}" aria-pressed="${id === tab}">${icon({ clues: 'investigate', people: 'conversation', insights: 'insight', locations: 'location', inventory: 'inventory' }[id])}<span>${title}</span></button>`).join('')}</nav>
    <div class="notes-list" aria-label="${tabs[tab]}">${list.length ? notes : '<p class="empty-note">Diese Seite wartet noch auf eure Entdeckungen.</p>'}</div>`, 'journal');
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
    case 'lock-teacher': teacherAccess.lock(); render(true); break;
    case 'continue': navigate('game'); break;
    case 'open-case':
      adventure = adventures.find(item => item.id === target.dataset.adventure) || adventures[0];
      if (!state || state.adventure !== adventure.id) state = load(adventure);
      if (state) openDialog('Die Fallakte öffnen', `<p>Für diesen Fall liegt ein Spielstand vor. Ihr könnt eure Ermittlung fortsetzen oder neu beginnen.</p><div class="menu-actions">${button('Fortsetzen', 'continue', 'primary')}${button('Neu beginnen', 'restart', 'secondary')}</div>`);
      else { state = start(adventure); persist(); navigate('game'); } break;
    case 'restart': confirmRestart(); break;
    case 'confirm-restart': state = start(adventure); persist(); navigate('game'); break;
    case 'notebook': showNotebook(); break;
    case 'inventory': showNotebook('inventory'); break;
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
document.querySelector('.skip').addEventListener('click', event => {
  event.preventDefault(); main.focus();
});
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
