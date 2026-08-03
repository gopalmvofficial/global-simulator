export function fmt(n, decimals = 0) {
  if (n == null || Number.isNaN(n)) return '$0';
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(2)}M`;
  if (abs >= 1e4) return `${sign}$${(abs / 1e3).toFixed(1)}K`;
  return sign + '$' + abs.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function fmtPct(n, decimals = 1) {
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(decimals)}%`;
}

export function fmtNum(n) {
  return n.toLocaleString('en-US');
}

export function fmtDate(gameDate) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const m = gameDate.month % 12;
  const y = gameDate.year + Math.floor(gameDate.month / 12);
  return `${months[m]} ${gameDate.day}, ${y}`;
}

export function fmtShortDate(gameDate) {
  const m = (gameDate.month % 12) + 1;
  const y = gameDate.year + Math.floor(gameDate.month / 12);
  return `${m}/${y}`;
}
