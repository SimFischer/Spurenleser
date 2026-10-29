import { test } from 'node:test';
import assert from 'node:assert/strict';
import adventure from '../data/taschenuhr.js';
import { start, enter } from '../js/engine.js';
import { entries } from '../js/notebook.js';

test('Personenakten zeigen nur bereits ermittelte Informationen', () => {
  const state = start(adventure);
  assert.equal(entries(adventure, state, 'people').length, 1);
  assert.ok(!entries(adventure, state, 'people')[0].text.includes('Schlüssel'));
  enter(adventure, state, 'jonas');
  let jonas = entries(adventure, state, 'people').find(person => person.name === 'Jonas Berger');
  assert.equal(jonas.role, 'Museumsmitarbeiter');
  assert.ok(jonas.text.includes('kaum angesehen'));
  assert.ok(!jonas.text.includes('Familie'));
  assert.ok(!jonas.text.includes('Kompass'));
  enter(adventure, state, 'kinship');
  jonas = entries(adventure, state, 'people').find(person => person.name === 'Jonas Berger');
  assert.ok(jonas.text.includes('Familie'));
  assert.ok(!jonas.text.includes('Geständnis'));
});
test('Orte und Inventar erscheinen erst nach Freischaltung; Journal verändert nichts', () => {
  const state = start(adventure);
  assert.deepEqual(entries(adventure, state, 'inventory'), []);
  assert.deepEqual(entries(adventure, state, 'locations').map(place => place.name), ['Küstenmuseum']);
  enter(adventure, state, 'vitrine');
  const before = structuredClone(state);
  assert.equal(entries(adventure, state, 'inventory')[0].name, 'Kleiner Messingspan');
  for (const tab of ['clues', 'people', 'insights', 'locations', 'inventory']) entries(adventure, state, tab);
  assert.deepEqual(state, before);
});
