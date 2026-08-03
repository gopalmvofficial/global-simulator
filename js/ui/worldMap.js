import { el } from './dom.js';

export function renderWorldMap(container, cities, selectedCityId, onCityClick) {
  container.innerHTML = '';
  const w = container.clientWidth || 800;
  const h = 420;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.style.width = '100%';

  // Simplified world background
  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bg.setAttribute('width', w);
  bg.setAttribute('height', h);
  bg.setAttribute('fill', '#111820');
  svg.appendChild(bg);

  // Grid
  for (let i = 0; i < 12; i++) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', (i / 12) * w);
    line.setAttribute('y1', 0);
    line.setAttribute('x2', (i / 12) * w);
    line.setAttribute('y2', h);
    line.setAttribute('stroke', '#2a3544');
    line.setAttribute('stroke-width', '0.5');
    svg.appendChild(line);
  }

  // Map dots for cities
  const lngMin = -180, lngMax = 180, latMin = -60, latMax = 70;

  for (const city of cities) {
    const x = ((city.lng - lngMin) / (lngMax - lngMin)) * w;
    const y = ((latMax - city.lat) / (latMax - latMin)) * h;
    const size = 3 + Math.log10(city.population) * 0.5;
    const isSelected = city.id === selectedCityId;
    const color = city.economy > 70 ? '#5cb87a' : city.economy > 40 ? '#c9a227' : '#d4655a';

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', isSelected ? size + 2 : size);
    circle.setAttribute('fill', color);
    circle.setAttribute('opacity', isSelected ? '1' : '0.7');
    circle.setAttribute('class', 'city-dot');
    circle.style.cursor = 'pointer';

    circle.addEventListener('click', () => onCityClick?.(city));
    circle.addEventListener('mouseenter', (e) => showTooltip(e, city, container));
    circle.addEventListener('mouseleave', hideTooltip);

    svg.appendChild(circle);
  }

  container.appendChild(svg);
}

let tooltip = null;

function showTooltip(e, city, container) {
  hideTooltip();
  tooltip = el('div', {
    className: 'panel',
    style: 'position:absolute;z-index:50;padding:10px 14px;font-size:12px;pointer-events:none;max-width:220px;',
  });
  tooltip.innerHTML = `<strong>${city.name}</strong><br/>
    <span class="muted">${city.region}</span><br/>
    Pop: ${(city.population / 1e6).toFixed(1)}M · GDP: $${(city.gdp / 1e9).toFixed(1)}B<br/>
    Economy: ${city.economy.toFixed(0)} · Tech: ${city.techLevel.toFixed(0)}`;
  container.style.position = 'relative';
  const rect = container.getBoundingClientRect();
  tooltip.style.left = `${e.clientX - rect.left + 10}px`;
  tooltip.style.top = `${e.clientY - rect.top - 10}px`;
  container.appendChild(tooltip);
}

function hideTooltip() {
  tooltip?.remove();
  tooltip = null;
}

export function renderCityDetail(city) {
  if (!city) return el('p', { className: 'muted' }, 'Select a city on the map.');
  const metrics = [
    ['Population', `${(city.population / 1e6).toFixed(2)}M`],
    ['GDP', `$${(city.gdp / 1e9).toFixed(1)}B`],
    ['Economy', `${city.economy.toFixed(0)}/100`],
    ['Employment', `${city.employment.toFixed(1)}%`],
    ['Crime Rate', `${city.crimeRate.toFixed(0)}/100`],
    ['Infrastructure', `${city.infrastructure.toFixed(0)}/100`],
    ['Political Stability', `${city.politicalStability.toFixed(0)}/100`],
    ['Property Demand', `${city.propertyDemand.toFixed(0)}/100`],
    ['Tourism', `${city.tourism.toFixed(0)}/100`],
    ['Education', `${city.education.toFixed(0)}/100`],
    ['Transportation', `${city.transportation.toFixed(0)}/100`],
    ['Tech Level', `${city.techLevel.toFixed(0)}/100`],
    ['Tax Rate', `${city.taxRate.toFixed(1)}%`],
    ['Regulations', `${city.regulations.toFixed(0)}/100`],
  ];
  const grid = el('div', { className: 'company-metrics' });
  for (const [label, value] of metrics) {
    grid.appendChild(el('div', {}, el('div', { className: 'metric-label' }, label), el('div', { className: 'metric-value' }, value)));
  }
  return el('div', {}, el('h4', {}, city.name), el('p', { className: 'muted' }, city.region), grid);
}
