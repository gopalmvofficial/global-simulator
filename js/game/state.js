import { WORLD_CITIES } from '../data/cities.js';
import { BUSINESS_TYPES, generateExecutivePool, generateCompanyName, getBusinessType } from '../data/businessTypes.js';
import { generateNewsItem, rollWorldEvent } from '../data/worldEvents.js';
import { uid, pick } from '../core/utils.js';

const AI_NAMES = [
  'Viktor Sterling', 'Yuki Tanaka', 'Amara Osei', 'Lucien Dubois', 'Priya Sharma',
  'Marcus Blackwood', 'Elena Vasquez', 'Hans Mueller', 'Fatima Al-Rashid', 'James Whitmore',
  'Sophia Laurent', 'Chen Wei', 'Olivia Hart', 'Raj Mehta', 'Isabelle Moreau',
  'Thomas Berg', 'Nadia Petrova', 'Kwame Asante', 'Li Mei', 'Carlos Mendez',
  'Aisha Khan', 'Robert Chase', 'Ingrid Solberg', 'Diego Santos', 'Hannah Brooks',
  'Akira Yamamoto', 'Victoria Cross', 'Omar Hassan', 'Grace Sullivan', 'Nikolai Petrov',
];

export function createFreshState(playerName) {
  const listings = generateInitialMarket();
  const aiCompetitors = generateAICompetitors(100);
  return {
    version: 1,
    playerName,
    createdAt: Date.now(),
    date: { year: 2026, month: 0, day: 1, tick: 0 },
    cash: 250000,
    personalCash: 250000,
    prestige: 10,
    reputation: 0,
    netWorth: 250000,
    netWorthHistory: [250000],
    companies: [],
    properties: [],
    luxuryAssets: [],
    sportsClubs: [],
    stockHoldings: {},
    bankAccounts: { personal: { balance: 250000, type: 'current' } },
    ownedBanks: [],
    loans: [],
    deposits: 0,
    executivePool: generateExecutivePool(48),
    market: { listings, index: 1000, indexHistory: [1000], phase: 'neutral' },
    economy: { inflation: 2.5, interestRate: 4.5, gdpGrowth: 2.1, phase: 'neutral', commodityIndex: 100 },
    cities: WORLD_CITIES.map((c) => ({ ...c })),
    activeEvents: [],
    news: [generateNewsItem({ companies: listings, aiCompetitors })],
    notifications: [],
    auctions: generateInitialAuctions(),
    legalCases: [],
    research: { ai: 0, robotics: 0, quantum: 0, medicine: 0, renewable: 0, aerospace: 0, biotech: 0 },
    aiCompetitors,
    log: [{ t: Date.now(), msg: `Welcome, ${playerName}. Your empire begins with $250,000 in seed capital.` }],
    settings: { autoApproveMinor: true, riskTolerance: 'moderate' },
    paused: false,
    speed: 1,
  };
}

function generateInitialMarket() {
  const listings = [];
  for (let i = 0; i < 40; i++) {
    const type = BUSINESS_TYPES[i % BUSINESS_TYPES.length];
    const price = 10 + Math.random() * 90;
    const shares = Math.floor(1000000 + Math.random() * 9000000);
    listings.push({
      id: `npc-${i}`,
      symbol: generateSymbol(type.name, i),
      name: generateCompanyName(type, pick(['Global', 'United', 'Pacific', 'Atlantic'])),
      typeId: type.id,
      category: type.category,
      price,
      sharesOutstanding: shares,
      float: Math.floor(shares * (0.3 + Math.random() * 0.5)),
      marketCap: price * shares,
      dividend: Math.random() > 0.6 ? 0.02 + Math.random() * 0.03 : 0,
      isPlayer: false,
      isPublic: true,
      priceHistory: Array(30).fill(price).map((p, j) => p * (1 + (Math.random() - 0.5) * 0.02 * (30 - j))),
    });
  }
  return listings;
}

function generateSymbol(name, idx) {
  const words = name.split(' ');
  let sym = words.map((w) => w[0]).join('').toUpperCase().slice(0, 3);
  if (sym.length < 3) sym = (sym + 'XX').slice(0, 3);
  return sym + (idx % 10);
}

function generateAICompetitors(count) {
  const competitors = [];
  for (let i = 0; i < count; i++) {
    const netWorth = Math.floor(1000000 + Math.random() * 50000000000);
    competitors.push({
      id: `ai-${i}`,
      name: AI_NAMES[i % AI_NAMES.length] + (i >= AI_NAMES.length ? ` ${Math.floor(i / AI_NAMES.length) + 1}` : ''),
      netWorth,
      companies: Math.floor(1 + Math.random() * 50),
      aggression: Math.random(),
      specialty: pick(['financial', 'technology', 'media', 'retail', 'energy']),
      reputation: Math.floor(20 + Math.random() * 70),
    });
  }
  return competitors.sort((a, b) => b.netWorth - a.netWorth);
}

function generateInitialAuctions() {
  return [
    { id: 'auc-1', type: 'tv-rights', name: 'Premier League TV Rights', currentBid: 50000000, minIncrement: 5000000, ticksLeft: 15, bidder: null },
    { id: 'auc-2', type: 'real-estate', name: 'Manhattan Penthouse Tower', currentBid: 80000000, minIncrement: 2000000, ticksLeft: 20, bidder: null },
    { id: 'auc-3', type: 'company', name: 'Distressed Retail Chain', currentBid: 15000000, minIncrement: 1000000, ticksLeft: 12, bidder: null },
    { id: 'auc-4', type: 'sports', name: 'Mid-Tier Football Club', currentBid: 120000000, minIncrement: 5000000, ticksLeft: 18, bidder: null },
  ];
}

export function advanceDate(date) {
  let { year, month, day, tick } = date;
  tick++;
  day++;
  if (day > 30) { day = 1; month++; }
  if (month > 11) { month = 0; year++; }
  return { year, month, day, tick };
}

export function pushLog(state, msg) {
  return [{ t: Date.now(), msg }, ...(state.log || [])].slice(0, 80);
}

export function addNotification(state, title, body, type = 'info') {
  const notif = { id: uid('notif'), title, body, type, read: false, t: Date.now() };
  return [notif, ...(state.notifications || [])].slice(0, 50);
}

export function calcNetWorth(state) {
  let total = state.personalCash || state.cash || 0;

  for (const c of state.companies || []) {
    total += c.valuation || c.bookValue || 0;
    total -= c.debt || 0;
  }

  for (const p of state.properties || []) {
    total += p.currentValue || 0;
  }

  for (const l of state.luxuryAssets || []) {
    total += l.currentValue || 0;
  }

  for (const [sym, qty] of Object.entries(state.stockHoldings || {})) {
    const listing = state.market?.listings?.find((l) => l.symbol === sym);
    if (listing) total += listing.price * qty;
  }

  for (const loan of state.loans || []) {
    total -= loan.remaining || 0;
  }

  if (state.deposits) total += state.deposits;

  return Math.max(0, total);
}

export function createPlayerCompany(typeId, cityId, name, state) {
  const type = getBusinessType(typeId);
  if (!type) return null;
  const city = state.cities.find((c) => c.id === cityId);
  const cost = Math.floor(type.baseCost * (0.8 + (city?.economy || 50) / 200));
  return {
    id: uid('co'),
    name: name || generateCompanyName(type, city?.name),
    typeId,
    category: type.category,
    cityId,
    founded: { ...state.date },
    cash: 0,
    revenue: type.baseRevenue,
    expenses: type.baseExpenses,
    employees: type.employees,
    executives: {},
    debt: 0,
    assets: cost,
    bookValue: cost,
    valuation: cost,
    marketShare: 1 + Math.random() * 3,
    reputation: 50,
    isPublic: false,
    symbol: null,
    policies: { growth: 'moderate', dividend: 0, riskAppetite: 'balanced' },
    isBank: type.isBank || false,
    isSports: type.isSports || false,
  };
}

export function mergeStateDefaults(saved) {
  const fresh = createFreshState(saved.playerName || 'Player');
  return {
    ...fresh,
    ...saved,
    cities: saved.cities?.length ? saved.cities : fresh.cities,
    market: saved.market?.listings?.length ? saved.market : fresh.market,
    aiCompetitors: saved.aiCompetitors?.length ? saved.aiCompetitors : fresh.aiCompetitors,
    executivePool: saved.executivePool?.length ? saved.executivePool : fresh.executivePool,
  };
}
