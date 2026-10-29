export function entries(adventure, state, tab) {
  const source = { clues: 'clues', people: 'people', insights: 'insights', locations: 'locations', inventory: 'items' }[tab];
  const ids = tab === 'people' ? Object.keys(state.people) : state[tab];
  return ids.map(id => adventure[source][id]).filter(Boolean);
}
