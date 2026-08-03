import { advanceDate, pushLog, addNotification, calcNetWorth } from './state.js';
import { calcExecutiveBonus, getBusinessType } from '../data/businessTypes.js';
import { tickCity } from '../data/cities.js';
import { getEventMultiplier, rollWorldEvent, generateNewsItem, tickEvents } from '../data/worldEvents.js';
import { getLuxuryItem, getRealEstateType } from '../data/assets.js';
import { tickMarket } from './stockMarket.js';
import { tickAICompetitors } from './aiCompetitors.js';
import { tickAuctions } from './auctions.js';

export function gameTick(state) {
  if (!state || state.paused) return state;

  let s = { ...state };
  s.date = advanceDate(s.date);

  const economyMult = getEventMultiplier(s, 'economy');
  const stockMult = getEventMultiplier(s, 'stocks');

  // Tick cities
  s.cities = s.cities.map((c) => tickCity(c, economyMult));

  // Company operations
  let totalRevenue = 0;
  let totalExpenses = 0;
  s.companies = s.companies.map((co) => {
    const type = getBusinessType(co.typeId);
    if (!type) return co;
    const city = s.cities.find((c) => c.id === co.cityId);
    const cityMult = city ? 0.7 + city.economy / 150 : 1;
    const eventMult = getEventMultiplier(s, type.category) * getEventMultiplier(s, 'economy');

    let execMult = 1;
    for (const exec of Object.values(co.executives || {})) {
      if (exec) execMult *= calcExecutiveBonus(exec);
    }
    execMult = Math.pow(execMult, 0.3);

    const researchBonus = 1 + (s.research?.ai || 0) * 0.001 * (type.category === 'technology' ? 1 : 0);
    const revenue = co.revenue * cityMult * eventMult * execMult * researchBonus * (1 + co.marketShare / 100);
    const execSalaries = Object.values(co.executives || {}).reduce((sum, e) => sum + (e?.salary || 0) / 365, 0);
    const expenses = co.expenses * cityMult + execSalaries + (co.debt || 0) * (s.economy.interestRate / 100 / 365);

    totalRevenue += revenue;
    totalExpenses += expenses;

    const profit = revenue - expenses;
    const newRep = Math.max(0, Math.min(100, co.reputation + (profit > 0 ? 0.1 : -0.2)));
    const valuation = Math.max(co.bookValue * 0.5, co.valuation + profit * 0.5);

    return {
      ...co,
      revenue,
      expenses,
      profit,
      cash: (co.cash || 0) + profit,
      reputation: newRep,
      valuation,
      marketShare: Math.max(0.1, co.marketShare + (profit > 0 ? 0.02 : -0.05)),
    };
  });

  // Distribute company profits to player (holding company model)
  const playerDividend = s.companies.reduce((sum, co) => {
    if (co.profit > 0) return sum + co.profit * 0.7;
    return sum;
  }, 0);
  s.personalCash = (s.personalCash || 0) + playerDividend - totalExpenses * 0;

  // Real estate income
  s.properties = (s.properties || []).map((p) => {
    const tpl = getRealEstateType(p.typeId);
    if (!tpl) return p;
    const rent = tpl.rentPerMonth / 30;
    s.personalCash += rent;
    return { ...p, currentValue: p.currentValue * (1 + tpl.appreciation * getEventMultiplier(s, 'realestate')) };
  });

  // Luxury appreciation
  s.luxuryAssets = (s.luxuryAssets || []).map((l) => {
    const tpl = getLuxuryItem(l.typeId);
    if (!tpl) return l;
    return { ...l, currentValue: l.currentValue * (1 + tpl.appreciation) };
  });

  // Loan interest
  s.loans = (s.loans || []).map((loan) => {
    const interest = loan.remaining * (loan.rate / 365);
    s.personalCash -= interest;
    return { ...loan, remaining: loan.remaining + interest * 0 };
  }).filter((l) => l.remaining > 0);

  // Stock market
  s.market = tickMarket(s.market, stockMult, s.economy);

  // Stock dividends
  for (const [sym, qty] of Object.entries(s.stockHoldings || {})) {
    const listing = s.market.listings.find((l) => l.symbol === sym);
    if (listing?.dividend) {
      s.personalCash += listing.price * qty * listing.dividend / 365;
    }
  }

  // Economy evolution
  s.economy = tickEconomy(s.economy, s.market);

  // World events
  s.activeEvents = tickEvents(s);
  const newEvent = rollWorldEvent(s);
  if (newEvent) {
    s.activeEvents = [...(s.activeEvents || []), newEvent];
    s.news = [{ ...generateNewsItem(s, newEvent), headline: newEvent.headline }, ...(s.news || [])].slice(0, 30);
    s.notifications = addNotification(s, 'World Event', newEvent.headline, 'warn');
  }

  // AI competitors
  s.aiCompetitors = tickAICompetitors(s.aiCompetitors, s.market);

  // Auctions
  s.auctions = tickAuctions(s.auctions || []);

  // Random news
  if (Math.random() < 0.15) {
    s.news = [generateNewsItem(s), ...(s.news || [])].slice(0, 30);
  }

  // Prestige from luxury
  const prestigeGain = (s.luxuryAssets || []).reduce((sum, l) => {
    const tpl = getLuxuryItem(l.typeId);
    return sum + (tpl?.prestige || 0) * 0.001;
  }, 0);
  s.prestige = Math.min(1000, (s.prestige || 0) + prestigeGain);

  s.reputation = Math.floor(s.prestige / 10 + s.companies.length * 2);
  s.netWorth = calcNetWorth(s);
  s.netWorthHistory = [...(s.netWorthHistory || []), s.netWorth].slice(-120);
  s.market.indexHistory = [...(s.market.indexHistory || []), s.market.index].slice(-120);

  if (s.date.day === 1) {
    s.log = pushLog(s, `Month end — Net worth: $${Math.round(s.netWorth).toLocaleString()}`);
  }

  return s;
}

function tickEconomy(economy, market) {
  const e = { ...economy };
  e.inflation += (Math.random() - 0.5) * 0.1;
  e.inflation = Math.max(-1, Math.min(15, e.inflation));
  e.interestRate += (Math.random() - 0.5) * 0.05;
  e.interestRate = Math.max(0.5, Math.min(12, e.interestRate));
  e.gdpGrowth += (Math.random() - 0.48) * 0.2;
  e.gdpGrowth = Math.max(-5, Math.min(8, e.gdpGrowth));

  if (market.index > 1200) e.phase = 'boom';
  else if (market.index < 800) e.phase = 'recession';
  else if (market.index < 600) e.phase = 'depression';
  else e.phase = 'neutral';

  return e;
}
