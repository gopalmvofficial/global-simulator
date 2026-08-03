import { createPlayerCompany, pushLog } from './state.js';
import { getBusinessType, generateExecutive } from '../data/businessTypes.js';

export function foundCompany(state, typeId, cityId, customName) {
  const type = getBusinessType(typeId);
  if (!type) return { ok: false, msg: 'Invalid business type.' };
  const city = state.cities.find((c) => c.id === cityId);
  if (!city) return { ok: false, msg: 'Invalid city.' };
  const cost = Math.floor(type.baseCost * (0.8 + city.economy / 200));
  if (state.personalCash < cost) return { ok: false, msg: `Need $${cost.toLocaleString()} to found this company.` };

  const company = createPlayerCompany(typeId, cityId, customName, state);
  company.bookValue = cost;
  company.valuation = cost;

  return {
    ok: true,
    state: {
      ...state,
      personalCash: state.personalCash - cost,
      companies: [...state.companies, company],
      log: pushLog(state, `Founded ${company.name} in ${city.name} for $${cost.toLocaleString()}.`),
    },
    msg: `${company.name} founded successfully.`,
  };
}

export function hireExecutive(state, companyId, role, executiveId) {
  const co = state.companies.find((c) => c.id === companyId);
  if (!co) return { ok: false, msg: 'Company not found.' };
  const exec = state.executivePool.find((e) => e.id === executiveId);
  if (!exec) return { ok: false, msg: 'Executive not found.' };
  if (exec.role !== role && role !== 'CEO') {
    // Allow hiring if role matches or flexible for CEO slot
  }
  if (state.personalCash < exec.salary * 0.1) return { ok: false, msg: 'Need signing bonus funds.' };

  const pool = state.executivePool.filter((e) => e.id !== executiveId);
  const newExec = { ...exec, role, hiredAt: { ...state.date }, loyalty: exec.loyalty };

  return {
    ok: true,
    state: {
      ...state,
      personalCash: state.personalCash - exec.salary * 0.1,
      executivePool: [...pool, generateExecutive(role, exec.tier)],
      companies: state.companies.map((c) =>
        c.id === companyId ? { ...c, executives: { ...c.executives, [role]: newExec } } : c
      ),
      log: pushLog(state, `Hired ${exec.name} as ${role} at ${co.name}.`),
    },
    msg: `${exec.name} hired as ${role}.`,
  };
}

export function fireExecutive(state, companyId, role) {
  const co = state.companies.find((c) => c.id === companyId);
  if (!co?.executives?.[role]) return { ok: false, msg: 'No executive in that role.' };
  const exec = co.executives[role];
  const execs = { ...co.executives };
  delete execs[role];
  return {
    ok: true,
    state: {
      ...state,
      executivePool: [...state.executivePool, { ...exec, id: `exec-${Date.now()}` }],
      companies: state.companies.map((c) => c.id === companyId ? { ...c, executives: execs } : c),
      log: pushLog(state, `Dismissed ${exec.name} from ${co.name}.`),
    },
    msg: `${exec.name} dismissed.`,
  };
}

export function acquireNPCCompany(state, listingId) {
  const listing = state.market.listings.find((l) => l.id === listingId && !l.isPlayer);
  if (!listing) return { ok: false, msg: 'Company not available.' };
  const premium = 1.25;
  const cost = listing.marketCap * premium;
  if (state.personalCash < cost * 0.2) return { ok: false, msg: 'Need 20% cash for acquisition.' };

  const company = createPlayerCompany(listing.typeId, state.cities[0]?.id, listing.name, state);
  company.valuation = listing.marketCap;
  company.bookValue = listing.marketCap;
  company.isPublic = listing.isPublic;
  company.symbol = listing.symbol;

  return {
    ok: true,
    state: {
      ...state,
      personalCash: state.personalCash - cost * 0.2,
      companies: [...state.companies, company],
      market: { ...state.market, listings: state.market.listings.filter((l) => l.id !== listingId) },
      log: pushLog(state, `Acquired ${listing.name} for $${(cost * 0.2).toLocaleString()} upfront.`),
    },
    msg: `Acquired ${listing.name}.`,
  };
}

export function setCompanyPolicy(state, companyId, policies) {
  return {
    ok: true,
    state: {
      ...state,
      companies: state.companies.map((c) => c.id === companyId ? { ...c, policies: { ...c.policies, ...policies } } : c),
    },
    msg: 'Policy updated.',
  };
}

export function investResearch(state, field, amount) {
  if (state.personalCash < amount) return { ok: false, msg: 'Insufficient funds.' };
  const research = { ...state.research, [field]: (state.research[field] || 0) + amount };
  return {
    ok: true,
    state: { ...state, personalCash: state.personalCash - amount, research },
    msg: `Invested $${amount.toLocaleString()} in ${field} research.`,
  };
}
