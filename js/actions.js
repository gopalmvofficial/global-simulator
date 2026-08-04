// ===========================================================================
// ACTIONS — every player-triggered state transition lives here as a pure
// reducer: (state, ...args) => newState. main.js wires these to the UI.
// ===========================================================================

import {
  COMPANY_TEMPLATES, EXECUTIVE_POOL, REAL_ESTATE_TEMPLATES, LUXURY_ITEMS,
  STOCKS, BANK_PRODUCTS, LEGAL_EVENTS,
} from './data.js'
import { nextId, byId, pushNews } from './state.js'

function founding_notice(name) {
  return `Founded ${name}.`
}

function buyCompany(state, templateId, cityId) {
  const tpl = byId(COMPANY_TEMPLATES, templateId)
  if (!tpl || state.cash < tpl.cost) return state
  const instance = { instanceId: nextId('co'), templateId, cityId, executives: {}, performance: 1, lastIncome: 0 }
  return {
    ...state,
    cash: state.cash - tpl.cost,
    companies: [...state.companies, instance],
    news: pushNews(state, founding_notice(tpl.name)),
  }
}

function sellCompany(state, instanceId) {
  const inst = state.companies.find((c) => c.instanceId === instanceId)
  if (!inst) return state
  const tpl = byId(COMPANY_TEMPLATES, inst.templateId)
  const proceeds = tpl ? tpl.valuation * 0.8 : 0
  return {
    ...state,
    cash: state.cash + proceeds,
    companies: state.companies.filter((c) => c.instanceId !== instanceId),
    news: pushNews(state, `Sold ${tpl ? tpl.name : 'a company'} for ${Math.round(proceeds).toLocaleString()}.`),
  }
}

function hireExecutive(state, companyInstanceId, role, execId) {
  const ex = byId(EXECUTIVE_POOL, execId)
  if (!ex || ex.role !== role) return state
  const companies = state.companies.map((c) =>
    c.instanceId === companyInstanceId ? { ...c, executives: { ...c.executives, [role]: execId } } : c
  )
  return { ...state, companies, news: pushNews(state, `Hired ${ex.name} as ${role}.`) }
}

function fireExecutive(state, companyInstanceId, role) {
  const companies = state.companies.map((c) => {
    if (c.instanceId !== companyInstanceId) return c
    const executives = { ...c.executives }
    delete executives[role]
    return { ...c, executives }
  })
  return { ...state, companies }
}

// ---------------- Real estate ----------------

function buyRealEstate(state, templateId, cityId) {
  const tpl = byId(REAL_ESTATE_TEMPLATES, templateId)
  if (!tpl || state.cash < tpl.cost) return state
  const instance = { instanceId: nextId('re'), templateId, cityId, valueMultiplier: 1 }
  return {
    ...state,
    cash: state.cash - tpl.cost,
    realEstate: [...state.realEstate, instance],
    news: pushNews(state, `Purchased ${tpl.name}.`),
  }
}

function sellRealEstate(state, instanceId) {
  const inst = state.realEstate.find((r) => r.instanceId === instanceId)
  if (!inst) return state
  const tpl = byId(REAL_ESTATE_TEMPLATES, inst.templateId)
  const proceeds = tpl ? tpl.cost * (inst.valueMultiplier || 1) * 0.92 : 0
  return {
    ...state,
    cash: state.cash + proceeds,
    realEstate: state.realEstate.filter((r) => r.instanceId !== instanceId),
    news: pushNews(state, `Sold ${tpl ? tpl.name : 'a property'} for ${Math.round(proceeds).toLocaleString()}.`),
  }
}

// ---------------- Luxury ----------------

function buyLuxury(state, itemId) {
  const tpl = byId(LUXURY_ITEMS, itemId)
  if (!tpl || state.cash < tpl.cost) return state
  return {
    ...state,
    cash: state.cash - tpl.cost,
    luxury: [...state.luxury, { instanceId: nextId('lux'), itemId }],
    news: pushNews(state, `Acquired ${tpl.name}. Prestige rises.`),
  }
}

// ---------------- Bank ----------------

function depositSavings(state, amount) {
  if (state.cash < amount || amount <= 0) return state
  return { ...state, cash: state.cash - amount, bank: { ...state.bank, savings: state.bank.savings + amount } }
}

function withdrawSavings(state, amount) {
  const amt = Math.min(amount, state.bank.savings)
  if (amt <= 0) return state
  return { ...state, cash: state.cash + amt, bank: { ...state.bank, savings: state.bank.savings - amt } }
}

function openFixedDeposit(state, amount) {
  if (state.cash < amount || amount <= 0) return state
  const deposit = { instanceId: nextId('fd'), amount, ticksLeft: BANK_PRODUCTS.fixedDepositTermTicks }
  return {
    ...state,
    cash: state.cash - amount,
    bank: { ...state.bank, fixedDeposits: [...state.bank.fixedDeposits, deposit] },
    news: pushNews(state, `Opened a fixed deposit of ${Math.round(amount).toLocaleString()}.`),
  }
}

function takeLoan(state, amount, creditRatingFn, loanLimitFn) {
  const rating = creditRatingFn(state)
  const limit = loanLimitFn(state)
  const currentLoans = state.bank.loans.reduce((s, l) => s + l.amount, 0)
  if (currentLoans + amount > limit) return state
  const rate = BANK_PRODUCTS.baseLoanRate * (1 + (100 - rating.score) / 120)
  const loan = { instanceId: nextId('loan'), amount, rate }
  return {
    ...state,
    cash: state.cash + amount,
    bank: { ...state.bank, loans: [...state.bank.loans, loan] },
    news: pushNews(state, `Took out a loan of ${Math.round(amount).toLocaleString()} at ${(rate * 100).toFixed(2)}%/week (${rating.grade} rating).`),
  }
}

function repayLoan(state, instanceId, amount) {
  const loan = state.bank.loans.find((l) => l.instanceId === instanceId)
  if (!loan) return state
  const amt = Math.min(amount, loan.amount, state.cash)
  if (amt <= 0) return state
  const loans = state.bank.loans
    .map((l) => (l.instanceId === instanceId ? { ...l, amount: l.amount - amt } : l))
    .filter((l) => l.amount > 1)
  return { ...state, cash: state.cash - amt, bank: { ...state.bank, loans } }
}

// ---------------- Stock exchange ----------------

function buyStock(state, symbol, qty) {
  const price = state.stockPrices[symbol]
  const cost = price * qty
  if (state.cash < cost || qty <= 0) return state
  return {
    ...state,
    cash: state.cash - cost,
    stockHoldings: { ...state.stockHoldings, [symbol]: (state.stockHoldings[symbol] || 0) + qty },
  }
}

function sellStock(state, symbol, qty) {
  const held = state.stockHoldings[symbol] || 0
  const amt = Math.min(qty, held)
  if (amt <= 0) return state
  const price = state.stockPrices[symbol]
  return {
    ...state,
    cash: state.cash + amt * price,
    stockHoldings: { ...state.stockHoldings, [symbol]: held - amt },
  }
}

function acquireStock(state, symbol) {
  const s = byId(STOCKS, symbol, 'symbol')
  const held = state.stockHoldings[symbol] || 0
  if (!s || held < s.mergeThreshold) return state
  return {
    ...state,
    reputation: Math.min(100, state.reputation + 8),
    heat: state.heat + 12,
    news: pushNews(state, `Acquired majority control of ${s.name} in a hostile takeover.`),
  }
}

function ipoCompany(state, companyInstanceId, companyValuationFn) {
  const inst = state.companies.find((c) => c.instanceId === companyInstanceId)
  if (!inst || state.playerStocks.some((ps) => ps.companyInstanceId === companyInstanceId)) return state
  const tpl = byId(COMPANY_TEMPLATES, inst.templateId)
  const valuation = companyValuationFn(inst)
  const totalShares = 10000
  const founderShares = 6500
  const floatShares = totalShares - founderShares
  const price = valuation / totalShares
  const cashGain = floatShares * price * 0.9
  const symbol = (tpl.name.replace(/[^A-Za-z]/g, '').slice(0, 3) || 'IPO').toUpperCase()
  const ps = { companyInstanceId, symbol, name: tpl.name, price, totalShares, founderShares, splitCount: 0 }
  return {
    ...state,
    cash: state.cash + cashGain,
    playerStocks: [...state.playerStocks, ps],
    news: pushNews(state, `${tpl.name} goes public in an IPO, raising ${Math.round(cashGain).toLocaleString()}.`),
  }
}

function splitPlayerStock(state, symbol) {
  const playerStocks = state.playerStocks.map((ps) =>
    ps.symbol === symbol
      ? { ...ps, totalShares: ps.totalShares * 2, founderShares: ps.founderShares * 2, price: ps.price / 2, splitCount: ps.splitCount + 1 }
      : ps
  )
  return { ...state, playerStocks, news: pushNews(state, `Executed a 2-for-1 split on ${symbol}.`) }
}

// ---------------- Legal ----------------

function resolveLegalCase(state, instanceId) {
  const kase = state.legalCases.find((c) => c.instanceId === instanceId)
  if (!kase) return state
  const tpl = byId(LEGAL_EVENTS, kase.templateId)
  if (!tpl || state.cash < tpl.cost) return state
  return {
    ...state,
    cash: state.cash - tpl.cost,
    heat: Math.max(0, state.heat - tpl.heat),
    legalCases: state.legalCases.filter((c) => c.instanceId !== instanceId),
    news: pushNews(state, `Settled the ${tpl.label} for ${tpl.cost.toLocaleString()}.`),
  }
}

export {
  buyCompany, sellCompany, hireExecutive, fireExecutive,
  buyRealEstate, sellRealEstate, buyLuxury,
  depositSavings, withdrawSavings, openFixedDeposit, takeLoan, repayLoan,
  buyStock, sellStock, acquireStock, ipoCompany, splitPlayerStock,
  resolveLegalCase,
}
