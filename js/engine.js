import { createState, meets } from './state.js';
export { meets } from './state.js';
export function applyEffects(state, effects = {}) {
  for (const field of ['clues', 'inventory', 'locations', 'flags']) {
    for (const id of effects[field] || []) if (!state[field].includes(id)) state[field].push(id);
  }
  Object.assign(state.people, effects.people || {});
  if (effects.ending) state.ending = effects.ending;
}
export function unlockInsights(adventure, state) {
  const fresh = [];
  let changed;
  do {
    changed = false;
    for (const [id, rule] of Object.entries(adventure.insights)) {
      if (!state.insights.includes(id) && meets(state, rule)) {
        state.insights.push(id); fresh.push(id); changed = true;
      }
    }
  } while (changed);
  return fresh;
}
export function enter(adventure, state, id) {
  const scene = adventure.scenes[id];
  if (!scene) throw new Error(`Unbekannte Szene: ${id}`);
  state.currentScene = id;
  if (!scene.preserveAct) state.act = scene.act;
  if (!state.visitedScenes.includes(id)) state.visitedScenes.push(id);
  applyEffects(state, scene.effects);
  return unlockInsights(adventure, state);
}
export function start(adventure) {
  const state = createState(adventure);
  enter(adventure, state, adventure.start);
  return state;
}
export function availableChoices(adventure, state) {
  return adventure.scenes[state.currentScene].choices.filter(choice => meets(state, choice));
}
export function choose(adventure, state, index) {
  if (state.ending) throw new Error('Dieser Fall ist abgeschlossen.');
  const choice = adventure.scenes[state.currentScene].choices[index];
  if (!choice || !meets(state, choice)) throw new Error('Diese Entscheidung ist noch nicht möglich.');
  applyEffects(state, choice.effects);
  return enter(adventure, state, choice.to);
}
export function accuse(adventure, state, suspect, evidence, motive) {
  if (state.ending || !adventure.scenes[state.currentScene].accusation) throw new Error('Hier ist keine Beschuldigung möglich.');
  const config = adventure.accusation;
  if (!adventure.suspects.includes(suspect) || !config.motives.some(item => item.id === motive)) throw new Error('Ungültige Auswahl.');
  const selected = [...new Set(evidence)].filter(id => state.clues.includes(id));
  const strong = selected.filter(id => adventure.evidence[id] >= config.strongWeight);
  const score = selected.reduce((total, id) => total + (adventure.evidence[id] || 0), 0);
  state.accusationAttempts++;
  if (suspect !== config.culprit || strong.length < config.minStrong || score < config.minScore) {
    state.flags = [...new Set([...state.flags, 'failedAccusation'])];
    enter(adventure, state, state.accusationAttempts >= config.warningAfter ? config.warningScene : config.retryScene);
    return { success: false, message: suspect !== config.culprit ? config.wrongPersonMessage : config.weakEvidenceMessage };
  }
  state.flags = [...new Set([...state.flags, 'proved'])];
  const result = config.results.find(rule => (!rule.motive || rule.motive === motive) && meets(state, rule));
  enter(adventure, state, result.to);
  return { success: true };
}
