export function drawLineChart(container, data, options = {}) {
  const { color = '#c9a227', fill = true, height = 200 } = options;
  container.innerHTML = '';
  if (!data || data.length < 2) {
    container.innerHTML = '<div class="empty-state"><div class="icon">📈</div><p>Not enough data yet</p></div>';
    return;
  }

  const w = container.clientWidth || 400;
  const h = height;
  const pad = { t: 10, r: 10, b: 20, l: 50 };
  const min = Math.min(...data) * 0.98;
  const max = Math.max(...data) * 1.02;
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = pad.l + (i / (data.length - 1)) * (w - pad.l - pad.r);
    const y = pad.t + (1 - (v - min) / range) * (h - pad.t - pad.b);
    return `${x},${y}`;
  }).join(' ');

  const fillPoints = `${pad.l},${h - pad.b} ${points} ${w - pad.r},${h - pad.b}`;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.style.width = '100%';
  svg.style.height = `${h}px`;

  if (fill) {
    const fp = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    fp.setAttribute('points', fillPoints);
    fp.setAttribute('fill', color);
    fp.setAttribute('opacity', '0.12');
    svg.appendChild(fp);
  }

  const pl = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  pl.setAttribute('points', points);
  pl.setAttribute('fill', 'none');
  pl.setAttribute('stroke', color);
  pl.setAttribute('stroke-width', '2');
  pl.setAttribute('stroke-linejoin', 'round');
  svg.appendChild(pl);

  // Y axis labels
  for (let i = 0; i <= 3; i++) {
    const val = min + (range * i) / 3;
    const y = pad.t + (1 - i / 3) * (h - pad.t - pad.b);
    const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt.setAttribute('x', '4');
    txt.setAttribute('y', y + 4);
    txt.setAttribute('fill', '#8b95a5');
    txt.setAttribute('font-size', '9');
    txt.textContent = formatShort(val);
    svg.appendChild(txt);
  }

  container.appendChild(svg);
}

function formatShort(n) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${Math.round(n)}`;
}

export function drawSparkline(data, color = '#3d8b7a') {
  if (!data || data.length < 2) return '';
  const w = 60, h = 20;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');
  return `<svg width="${w}" height="${h}"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.5"/></svg>`;
}
