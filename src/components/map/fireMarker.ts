import type { Fire } from '#/lib/eonet';

export function formatFireSize(sizeAcres: number | null): string {
  return sizeAcres === null
    ? 'Not reported'
    : `${Math.round(sizeAcres).toLocaleString()} acres`;
}

export interface FireMarkerOptions {
  selected: boolean;
  onSelect: (id: string) => void;
}

export function buildFireMarkerButton(
  fire: Fire,
  { selected, onSelect }: FireMarkerOptions,
): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.tabIndex = 0;
  button.classList.add('fire-marker');
  if (fire.closed !== null) {
    button.classList.add('fire-marker--closed');
  }
  if (selected) {
    button.classList.add('fire-marker--selected');
  }
  button.setAttribute('aria-pressed', String(selected));
  button.setAttribute(
    'aria-label',
    `${fire.title}, ${formatFireSize(fire.geometry.magnitudeValue)}`,
  );
  button.addEventListener('click', () => onSelect(fire.id));

  const halo = document.createElement('span');
  halo.dataset.part = 'halo';
  halo.className = 'fire-marker__halo';
  button.appendChild(halo);

  const glyph = document.createElement('span');
  glyph.dataset.part = 'glyph';
  glyph.className = 'fire-marker__glyph';
  glyph.setAttribute('aria-hidden', 'true');
  glyph.innerHTML = `
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2c.5 3-1.5 4.5-2.8 6.4C8 10.2 7.2 11.7 7.2 13.5a4.8 4.8 0 0 0 9.6 0c0-1.3-.4-2.4-1-3.5-.4.7-.9 1.1-1.5 1.3.3-2.6-.4-6-2.3-9.3z"/>
      <path d="M12 22a6.5 6.5 0 0 1-3.9-11.6c.5 1.8 1.6 2.8 2.9 3.5-.2-1.9.3-3.6 1.5-5.1 2.6 2.2 4 5.2 4 8.2a6.5 6.5 0 0 1-4.5 5z"/>
    </svg>
  `;
  button.appendChild(glyph);

  return button;
}
