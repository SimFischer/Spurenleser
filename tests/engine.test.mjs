import { test } from 'node:test';
import assert from 'node:assert/strict';
import a from '../data/taschenuhr.js';
import { start, choose, availableChoices, accuse, enter, meets, unlockInsights } from '../js/engine.js';
import { createState } from '../js/state.js';
import { save, load, clear, SAVE_KEY } from '../js/save.js';
const reached = new Set();
function record(state) { reached.add(state.currentScene); return state; }
function go(state, to) {
  const i = a.scenes[state.currentScene].choices.findIndex(choice => choice.to === to && meets(state, choice));
  assert.ok(i >= 0, `Kein freier Weg ${state.currentScene} → ${to}`);
  choose(a, state, i); return record(state);
}
function walk(state, ...ids) { for (const id of ids) go(state, id); return state; }
function investigate(family = false) {
  const state = record(start(a));
  walk(state, 'vitrine', 'winter', 'loose', 'hall', 'lea', 'jonas', 'contradiction', 'hall', 'side', 'petersen', 'portrait', 'review', 'archive', 'inventoryBook', 'history');
  if (family) walk(state, 'kinship', 'grandma', 'archiveExit', 'archive', 'photo');
  else go(state, 'photo');
  walk(state, 'archiveExit', 'workshop');
  return state;
}
function follow(state) { return walk(state, 'gaze', 'map', 'directory', 'magazine', 'emptyDesk', 'winterPlan'); }
const strong = ['leaSaw', 'contradiction', 'foundCompass'];
test('Bedingungen: alle, mindestens eine und Ausschlüsse', () => {
  const state = start(a); state.clues.push('intact', 'keys');
  assert.equal(meets(state, { requiresAll: ['intact', 'keys'] }), true);
  assert.equal(meets(state, { requiresAny: ['loose', 'keys'] }), true);
  assert.equal(meets(state, { excludes: ['keys'] }), false);
  assert.equal(meets(state, { requiresAll: ['loose'] }), false);
  assert.equal(meets(state, { requiresAny: ['loose', 'brass'] }), false);
});
test('Beobachten erst nach konkreten Rückkehrspuren', () => {
  const state = investigate();
  assert.ok(!state.insights.includes('returnLikely'));
  assert.ok(!availableChoices(a, state).some(c => c.to === 'observe'));
  follow(state);
  assert.ok(state.insights.includes('destination'));
  assert.ok(state.insights.includes('returnLikely'));
  assert.ok(availableChoices(a, state).some(c => c.to === 'observe'));
});
test('Vollständig gelöst mit selbst ermittelter Familiengeschichte', () => {
  const state = follow(investigate(true));
  walk(state, 'cabinetOpen', 'box', 'accusation');
  assert.equal(accuse(a, state, 'jonas', strong, 'family').success, true); record(state);
  assert.equal(state.ending, 'complete');
  assert.ok(state.insights.includes('innocence'));
  assert.ok(state.inventory.includes('watch'));
  assert.throws(() => choose(a, state, 0));
});
test('Familiengeschichte nach Kästchenfund und optionaler Suchweg', () => {
  const state = investigate();
  walk(state, 'gaze', 'map', 'directory', 'magazine', 'emptyDesk', 'search', 'winterPlan', 'cabinetOpen', 'box', 'familyLate', 'accusation');
  accuse(a, state, 'jonas', strong, 'family'); record(state);
  assert.equal(state.ending, 'complete');
});
test('Konfrontation, falsches Motiv und Beobachtung ergeben eigene Enden', () => {
  for (const motive of ['unknown', 'family', 'sale']) {
    const state = investigate(); go(state, 'accusation');
    accuse(a, state, 'jonas', strong, motive); record(state);
    assert.equal(state.ending, motive === 'sale' ? 'wrongMotive' : 'solved');
    assert.ok(state.clues.includes('confession'));
  }
  const state = follow(investigate()); go(state, 'observe');
  assert.equal(state.ending, 'caught'); assert.ok(state.inventory.includes('box'));
  const second = follow(investigate()); walk(second, 'cabinetOpen', 'observe');
  assert.equal(second.ending, 'caught');
});
test('Früher Verdacht und schwache Beweise erlauben Weiterermitteln', () => {
  const state = start(a); walk(state, 'winter', 'hall', 'jonas', 'accusation');
  assert.equal(state.act, 1);
  accuse(a, state, 'winter', ['keys'], 'unknown'); record(state);
  assert.equal(state.ending, null); assert.equal(state.currentScene, 'insufficient');
  walk(state, 'resume', 'hall', 'review', 'accusation');
  accuse(a, state, 'jonas', ['keys', 'keys', 'foundCompass'], 'family');
  assert.equal(state.ending, null); // Unbekannte und doppelte Beweise zählen nicht.
  walk(state, 'resume', 'hall', 'review', 'accusation');
  accuse(a, state, 'lea', ['keys'], 'sale'); record(state);
  assert.equal(state.currentScene, 'warning');
  const continuation = structuredClone(state); walk(continuation, 'resume', 'hall');
  assert.equal(continuation.ending, null);
  go(state, 'unresolved'); assert.equal(state.ending, 'unresolved');
});
test('Erkenntnisse genau einmal, unabhängig von Fundreihenfolge', () => {
  const state = createState(a); state.clues = ['jonasClaim', 'leaSaw', 'double', 'loose'];
  assert.deepEqual(unlockInsights(a, state).sort(), ['discrepancy', 'secret']);
  assert.deepEqual(unlockInsights(a, state), []);
  enter(a, state, 'lea'); enter(a, state, 'lea');
  assert.equal(state.clues.filter(id => id === 'leaSaw').length, 1);
});
test('Versteckte Entscheidungen und unpassende Beschuldigungen gesperrt', () => {
  const state = start(a); enter(a, state, 'review');
  assert.throws(() => choose(a, state, 0));
  assert.throws(() => accuse(a, state, 'jonas', [], 'family'));
  enter(a, state, 'accusation');
  assert.throws(() => accuse(a, state, 'fremd', [], 'family'));
});
test('Speichern/Laden, kaputte Daten und gesperrter Speicher', () => {
  const map = new Map();
  const storage = { setItem: (k,v) => map.set(k,v), getItem: k => map.get(k) ?? null, removeItem: k => map.delete(k) };
  const state = investigate(true);
  assert.equal(save(state, storage), true); assert.deepEqual(load(a, storage), state);
  const round = load(a, storage); go(round, 'gaze'); assert.equal(round.currentScene, 'gaze');
  for (const bad of ['{', '{}', JSON.stringify({ ...state, currentScene: 'missing' }), JSON.stringify({ ...state, clues: ['missing'] }), JSON.stringify({ ...state, people: [] })]) {
    map.set(`${SAVE_KEY}.${a.id}`, bad); assert.equal(load(a, storage), null);
  }
  const blocked = { setItem() { throw Error(); }, getItem() { throw Error(); }, removeItem() { throw Error(); } };
  assert.equal(save(state, blocked), false); assert.equal(load(a, blocked), null); assert.equal(clear(a, blocked), false);
  save(state, storage); clear(a, storage); assert.equal(load(a, storage), null);
});
test('Alle Szenen, Ziele, Daten-IDs und finale Zustände konsistent', () => {
  for (const [id, scene] of Object.entries(a.scenes)) {
    assert.ok(scene.text.length > 250, `${id}: fehlender Lesetext`);
    assert.ok(scene.choices.length || scene.effects.ending, `${id}: Sackgasse`);
    assert.ok(scene.choices.length <= 4, `${id}: zu viele Entscheidungen`);
    for (const choice of scene.choices) assert.ok(a.scenes[choice.to], `${id} → ${choice.to}`);
    for (const field of ['clues','inventory','locations']) for (const key of scene.effects[field] || []) {
      assert.ok(a[field === 'inventory' ? 'items' : field][key], `${id}: ${key}`);
    }
  }
});
test('Alle Storyszenen in den gültigen Testspielwegen erreicht', () => {
  for (const id of Object.keys(a.scenes)) assert.ok(reached.has(id), `Nicht erreicht: ${id}`);
});
