export const WORLD_EVENT_TYPES = [
  { id: 'economic-boom', name: 'Economic Boom', impact: { economy: 1.15, stocks: 1.08 }, duration: 30, headline: 'Global markets surge on economic optimism' },
  { id: 'recession', name: 'Recession', impact: { economy: 0.85, stocks: 0.88 }, duration: 45, headline: 'Recession fears grip global markets' },
  { id: 'inflation', name: 'Inflation Spike', impact: { economy: 0.95, costs: 1.1 }, duration: 20, headline: 'Inflation reaches multi-year highs' },
  { id: 'market-crash', name: 'Market Crash', impact: { stocks: 0.7 }, duration: 15, headline: 'Stock markets plunge in sudden sell-off' },
  { id: 'tech-breakthrough', name: 'Tech Breakthrough', impact: { tech: 1.2 }, duration: 25, headline: 'Major technology breakthrough announced' },
  { id: 'election', name: 'Government Election', impact: { regulations: 1.1 }, duration: 10, headline: 'Election results shift corporate policy landscape' },
  { id: 'trade-deal', name: 'Trade Agreement', impact: { economy: 1.05, trade: 1.1 }, duration: 20, headline: 'Major trade agreement signed between nations' },
  { id: 'cyber-attack', name: 'Cyber Attack', impact: { tech: 0.9, security: 1.15 }, duration: 7, headline: 'Massive cyber attack disrupts global commerce' },
  { id: 'natural-disaster', name: 'Natural Disaster', impact: { economy: 0.92, insurance: 1.1 }, duration: 14, headline: 'Natural disaster causes widespread economic damage' },
  { id: 'scandal', name: 'Corporate Scandal', impact: { reputation: 0.85 }, duration: 12, headline: 'Major corporate scandal rocks business world' },
  { id: 'housing-bubble', name: 'Housing Bubble', impact: { realestate: 1.15 }, duration: 30, headline: 'Property prices soar in housing bubble fears' },
  { id: 'banking-crisis', name: 'Banking Crisis', impact: { banks: 0.8, economy: 0.88 }, duration: 25, headline: 'Banking sector faces liquidity crisis' },
  { id: 'currency-crisis', name: 'Currency Crisis', impact: { forex: 1.2, economy: 0.9 }, duration: 18, headline: 'Currency volatility spikes amid crisis' },
  { id: 'award', name: 'Industry Awards', impact: { media: 1.1 }, duration: 5, headline: 'Annual business excellence awards announced' },
  { id: 'supply-chain', name: 'Supply Chain Disruption', impact: { manufacturing: 0.85 }, duration: 20, headline: 'Global supply chains face major disruption' },
];

export const NEWS_TEMPLATES = [
  '{company} reports record quarterly earnings',
  '{company} announces expansion into {city}',
  '{ai} acquires stake in {company}',
  'Analysts upgrade {company} stock rating',
  '{company} faces regulatory investigation',
  'Hostile takeover bid launched for {company}',
  '{company} IPO oversubscribed by investors',
  'New CEO appointed at {company}',
  '{event} impacts global business landscape',
  'Merger talks between {company} and rival collapse',
  '{company} dividend increased by board',
  'Tech sector rallies on {event}',
  'Real estate prices {direction} in major markets',
  '{ai} launches aggressive expansion strategy',
  'Central bank adjusts interest rates amid {event}',
];

export function generateNewsItem(state, event = null) {
  let template = NEWS_TEMPLATES[Math.floor(Math.random() * NEWS_TEMPLATES.length)];
  const companies = [...(state.companies || []), ...(state.market?.listings || [])];
  const company = companies[Math.floor(Math.random() * companies.length)];
  const ai = state.aiCompetitors?.[Math.floor(Math.random() * (state.aiCompetitors?.length || 1))];
  const city = state.cities?.[Math.floor(Math.random() * (state.cities?.length || 1))];

  template = template
    .replace('{company}', company?.name || 'Major Corp')
    .replace('{ai}', ai?.name || 'Rival entrepreneur')
    .replace('{city}', city?.name || 'global markets')
    .replace('{event}', event?.name || 'market conditions')
    .replace('{direction}', Math.random() > 0.5 ? 'surge' : 'decline');

  return {
    id: `news-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    headline: template,
    timestamp: Date.now(),
    impact: event ? (event.impact?.economy > 1 ? 'positive' : event.impact?.economy < 1 ? 'negative' : 'neutral') : 'neutral',
    read: false,
  };
}

export function rollWorldEvent(state) {
  if (state.activeEvents?.length >= 3) return null;
  if (Math.random() > 0.08) return null;
  const type = WORLD_EVENT_TYPES[Math.floor(Math.random() * WORLD_EVENT_TYPES.length)];
  return {
    ...type,
    instanceId: `evt-${Date.now()}`,
    startedAt: state.date,
    ticksRemaining: type.duration,
  };
}

export function tickEvents(state) {
  const active = (state.activeEvents || [])
    .map((e) => ({ ...e, ticksRemaining: e.ticksRemaining - 1 }))
    .filter((e) => e.ticksRemaining > 0);
  return active;
}

export function getEventMultiplier(state, key) {
  let mult = 1;
  for (const e of state.activeEvents || []) {
    if (e.impact?.[key]) mult *= e.impact[key];
  }
  if (state.economy?.phase === 'boom') mult *= 1.05;
  if (state.economy?.phase === 'recession') mult *= 0.92;
  if (state.economy?.phase === 'depression') mult *= 0.85;
  return mult;
}
