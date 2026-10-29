import { STATE_VERSION } from './state.js';
export const SAVE_KEY = 'spurenleser.save.v1';
export function save(state, storage) {
  try { (storage ?? globalThis.localStorage).setItem(`${SAVE_KEY}.${state.adventure}`, JSON.stringify(state)); return true; } catch { return false; }
}
export function load(adventure, storage) {
  try {
    const s = JSON.parse((storage ?? globalThis.localStorage).getItem(`${SAVE_KEY}.${adventure.id}`));
    if (!s || s.version !== STATE_VERSION || s.adventure !== adventure.id || !adventure.scenes[s.currentScene]) return null;
    for (const field of ['clues', 'insights', 'inventory', 'locations', 'visitedScenes', 'flags']) {
      if (!Array.isArray(s[field]) || !s[field].every(id => typeof id === 'string')) return null;
    }
    if (!s.people || typeof s.people !== 'object' || Array.isArray(s.people) ||
      !Number.isInteger(s.accusationAttempts) || s.accusationAttempts < 0 ||
      !(s.ending === null || adventure.endings[s.ending])) return null;
    if (s.clues.some(id => !adventure.clues[id]) || s.insights.some(id => !adventure.insights[id]) ||
      s.inventory.some(id => !adventure.items[id]) || s.locations.some(id => !adventure.locations[id]) ||
      Object.keys(s.people).some(id => !adventure.people[id]) || s.visitedScenes.some(id => !adventure.scenes[id])) return null;
    if (!adventure.scenes[s.currentScene].preserveAct) s.act = adventure.scenes[s.currentScene].act;
    else if (![1, 2, 3, 4].includes(s.act)) return null;
    return s;
  } catch { return null; }
}
export function clear(adventure, storage) {
  try { (storage ?? globalThis.localStorage).removeItem(`${SAVE_KEY}.${adventure.id}`); return true; } catch { return false; }
}
