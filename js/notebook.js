import { archivePresentation } from '../data/presentation.js';
export function entries(adventure, state, tab) {
  const source = { clues: 'clues', people: 'people', insights: 'insights', locations: 'locations', inventory: 'items' }[tab];
  const ids = tab === 'people' ? Object.keys(state.people) : state[tab];
  return ids.map(id => {
    const item = adventure[source][id];
    if (!item || tab !== 'people') return item;
    const presentation = archivePresentation[adventure.id]?.people[id];
    return presentation ? { name: item.name, role: presentation.role,
      text: presentation.facts.filter(key => state.clues.includes(key)).map(key => adventure.clues[key].text).join('\n\n') || 'Weitere Beobachtungen könnt ihr im Gespräch sammeln.' } : item;
  }).filter(Boolean);
}
