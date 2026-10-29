export const STATE_VERSION = 1;
export function createState(adventure) {
  return { version: STATE_VERSION, adventure: adventure.id, currentScene: adventure.start,
    act: 1, clues: [], insights: [], inventory: [], people: {}, locations: [],
    visitedScenes: [], flags: [], accusationAttempts: 0, ending: null };
}
export function tokens(state) {
  return new Set([...state.clues, ...state.insights, ...state.inventory, ...state.locations,
    ...state.flags, ...Object.keys(state.people)]);
}
export function meets(state, condition = {}) {
  const known = tokens(state);
  return (condition.requiresAll || []).every(id => known.has(id)) &&
    (!(condition.requiresAny?.length) || condition.requiresAny.some(id => known.has(id))) &&
    !(condition.excludes || []).some(id => known.has(id));
}
