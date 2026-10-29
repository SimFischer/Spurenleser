import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTeacherAccess } from '../js/teacher-access.js';
const memory = () => {
  const values = new Map();
  return { values, getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
};
test('Lehrkräftezugang ist gesperrt und verlangt exakt den Code', () => {
  const storage = memory(); const access = createTeacherAccess(storage);
  assert.equal(access.isUnlocked(), false);
  for (const code of ['', 'lehrkraft', 'LEHRKRAFT', 'Lehrkraft ', ' Lehrkraft']) {
    assert.equal(access.unlock(code), false);
    assert.equal(access.isUnlocked(), false);
  }
  assert.equal(storage.values.size, 0);
  assert.equal(access.unlock('Lehrkraft'), true);
  assert.equal(access.isUnlocked(), true);
  assert.ok(![...storage.values.values()].includes('Lehrkraft'));
});
test('Freischaltung gilt innerhalb der Session und lässt sich sperren', () => {
  const storage = memory(); createTeacherAccess(storage).unlock('Lehrkraft');
  const access = createTeacherAccess(storage);
  assert.equal(access.isUnlocked(), true);
  assert.equal(createTeacherAccess(memory()).isUnlocked(), false);
  access.lock(); assert.equal(access.isUnlocked(), false);
  assert.equal(createTeacherAccess(storage).isUnlocked(), false);
});
test('Ohne Session-Speicher funktioniert der Zugang nur im Arbeitsspeicher', () => {
  const blocked = { getItem() { throw Error(); }, setItem() { throw Error(); }, removeItem() { throw Error(); } };
  const access = createTeacherAccess(blocked);
  assert.equal(access.unlock('Lehrkraft'), true);
  assert.equal(access.isUnlocked(), true);
  assert.equal(createTeacherAccess(blocked).isUnlocked(), false);
  access.lock(); assert.equal(access.isUnlocked(), false);
});
