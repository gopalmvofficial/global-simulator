// ===========================================================================
// STATE — fresh game state factory + pure derived-value helpers.
// ===========================================================================

import {
  DIFFICULTIES, CITIES, STOCKS, AI_RIVAL_NAMES, COMPANY_TEMPLATES,
  REAL_ESTATE_TEMPLATES, LUXURY_ITEMS, EXECUTIVE_POOL,
} from './data.js'

let counter = 1
function nextId(prefix) {
  counter += 1
  return `${prefix}-${counter}-${Date.now().toString(36)}`
}

function byId(list, id, key = 'id') {
  return list.find((x) => x[key] === id)
}

function freshState(profile, difficultyId) {
  const diff = DIFFICULTIES[difficultyId] || DIFFICULTIES.normal
  const stockPrices = {}
  STOCKS.forEach((s) => (stockPrices[s.symbol] = s.basePrice))
  const aiRivals = AI_RIVAL_NAMES.map((name, i) => ({
    name,
    netWorth: 1_500_000 + i * 400000 + Math.random() * 900000,
    growth: 0.01 + Math.random() * 0.015,
  }))
  return {
    profile,
    difficulty: difficultyId,
    createdAt: Date.now(),
    tickCount: 0,
    cash: diff.startCash,
    reputation: 50,
    heat: 0,
    prestige: 0,
    bank: { savings: 0, fixedDeposits: [], loans: [] },
    companies: [],
    realEstate: [],
    luxury: [],
    stockHoldings: {},
    stockPrices,
    playerStocks: [],
    activeEvent: null,
    aiRivals,
    legalCases: [],
    news: [{ t: Date.now(), msg: `You take the reins with ${fmt(diff.startCash)} in starting capital.` }],
  }
}

function fmt(n) {
  const sign = n < 0 ? '-' : ''
  n = Math.abs(Math.round(n))
  if (n >= 1_000_000_000) return sign + '$' + (n / 1_000_000_000).toFixed(2) + 'B'
  if (n >= 1_000_000) return sign + '$' + (n / 1_000_000).toFixed(2) + 'M'
  return sign + '$' + n.toLocaleString('en-US')
}

function fmtFull(n) {
  const sign = n < 0 ? '-' : ''
  return sign + '$' + Math.abs(Math.round(n)).toLocaleString('en-US')
}

function pushNews(state, msg) {
  return [{ t: Date.now(), msg }, ...state.news].slice(0, 100)
}

function companyValuation(instance) {
  const tpl = byId(COMPANY_TEMPLATES, instance.templateId)
  if (!tpl) return 0
  const execBonus = Object.values(instance.executives || {}).filter(Boolean).length * 0.08
  return tpl.valuation * (1 + execBonus) * (instance.performance || 1)
}

function realEstateValue(instance) {
  const tpl = byId(REAL_ESTATE_TEMPLATES, instance.templateId)
  if (!tpl) return 0
  return tpl.cost * (instance.valueMultiplier || 1)
}

function luxuryValue(instance) {
  const tpl = byId(LUXURY_ITEMS, instance.itemId)
  return tpl ? tpl.cost : 0
}

function stockPortfolioValue(state) {
  return Object.entries(state.stockHoldings).reduce((sum, [symbol, qty]) => {
    return sum + qty * (state.stockPrices[symbol] || 0)
  }, 0)
}

function bankDepositsTotal(state) {
  const fixed = state.bank.fixedDeposits.reduce((s, d) => s + d.amount, 0)
  return state.bank.savings + fixed
}

function loansTotal(state) {
  return state.bank.loans.reduce((s, l) => s + l.amount, 0)
}

function netWorth(state) {
  const companies = state.companies.reduce((s, c) => s + companyValuation(c), 0)
  const realEstate = state.realEstate.reduce((s, r) => s + realEstateValue(r), 0)
  const luxury = state.luxury.reduce((s, l) => s + luxuryValue(l), 0)
  return (
    state.cash +
    bankDepositsTotal(state) -
    loansTotal(state) +
    companies +
    realEstate +
    luxury +
    stockPortfolioValue(state)
  )
}

function prestigeTotal(state) {
  return state.luxury.reduce((s, l) => {
    const tpl = byId(LUXURY_ITEMS, l.itemId)
    return s + (tpl ? tpl.prestige : 0)
  }, 0)
}

const LOAN_LIMIT_MULTIPLIER = { AAA: 6, AA: 4.5, A: 3.2, BBB: 2, BB: 1.1, CCC: 0.4 }

function loanLimit(state) {
  const rating = creditRating(state)
  return 500000 * (LOAN_LIMIT_MULTIPLIER[rating.grade] || 1)
}

function creditRating(state) {
  const nw = netWorth(state)
  const debtRatio = loansTotal(state) / Math.max(1, nw)
  let score = 100 - debtRatio * 120 + (state.reputation - 50) * 0.6 - state.heat * 0.3
  score = Math.max(10, Math.min(100, score))
  if (score >= 80) return { grade: 'AAA', score }
  if (score >= 65) return { grade: 'AA', score }
  if (score >= 50) return { grade: 'A', score }
  if (score >= 35) return { grade: 'BBB', score }
  if (score >= 20) return { grade: 'BB', score }
  return { grade: 'CCC', score }
}

export {
  nextId, byId, freshState, fmt, fmtFull, pushNews,
  companyValuation, realEstateValue, luxuryValue,
  stockPortfolioValue, bankDepositsTotal, loansTotal, netWorth, prestigeTotal, creditRating, loanLimit,
}
