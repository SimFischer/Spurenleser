// Purely visual classification. Never used for routes, conditions or state.
export function choiceKind(label) {
  if (/beweis|verdacht|schluss|vergleichen|überprüfen|begründ|wissen/i.test(label)) return 'insight';
  if (/fragen|sprechen|befragen|berichten|informieren|erzählen|konfrontieren|besuchen|beobachten/i.test(label)) return 'conversation';
  if (/gehen|zurück|aufsuchen|folgen|verlassen|weiterermitteln|weitergehen|weiterarbeiten/i.test(label)) return 'location';
  return 'investigate';
}
export function icon(name, className = '') {
  return `<svg class="ui-icon ${className}" aria-hidden="true" focusable="false"><use href="assets/ui/archive-symbols.svg#${name}"></use></svg>`;
}
