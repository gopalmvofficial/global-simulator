// ===========================================================================
// ENGINE — one tick of simulated time. Pure function: (state) => new state.
// ===========================================================================

import {
  COMPANY_TEMPLATES, STOCKS, WORLD_EVENTS, BANK_PRODUCTS, LEGAL_EVENTS, DIFFICULTIES,
  REAL_ESTATE_TEMPLATES,
} from './data.js'
import { byId, pushNews } from './state.js'

function economyMultiplier(state) {
  return state.activeEvent ? state.activeEvent.economyMult : 1
}

function fmtLocal(n) {
  return '$' + Math.round(n).toLocaleString('en-US')
}

function advanceTick(prevState) {
  let state = { ...prevState, tickCount: prevState.tickCount + 1 }
  let cash = state.cash
  let news = state.news
  let reputation = state.reputation
  let heat = Math.max(0, state.heat - 0.3)
  // rapid expansion and heavy leverage draw regulatory scrutiny over time
  heat += state.companies.length * 0.15 + state.bank.loans.length * 0.6

  const diff = DIFFICULTIES[state.difficulty] || DIFFICULTIES.normal
  const mult = economyMultiplier(state)

  // ---- world events: expire current, maybe trigger a new one ----
  let activeEvent = state.activeEvent
  if (activeEvent) {
    activeEvent = { ...activeEvent, ticksLeft: activeEvent.ticksLeft - 1 }
    if (activeEvent.ticksLeft <= 0) {
      news = pushNews({ news }, `The effects of "${activeEvent.label}" have faded.`)
      activeEvent = null
    }
  } else if (Math.random() < 0.1) {
    const template = WORLD_EVENTS[Math.floor(Math.random() * WORLD_EVENTS.length)]
    activeEvent = { ...template, ticksLeft: template.duration }
    news = pushNews({ news }, `\u26A0 ${template.news}`)
    if (template.reputationHit) reputation = Math.max(0, reputation - template.reputationHit * 0.3)
  }

  // ---- companies: income minus wages, executives boost performance ----
  const companies = state.companies.map((c) => ({ ...c }))
  companies.forEach((c) => {
    const tpl = byId(COMPANY_TEMPLATES, c.templateId)
    if (!tpl) return
    const execCount = Object.values(c.executives || {}).filter(Boolean).length
    const sectorBoosted = activeEvent && activeEvent.sectorBoost === tpl.sector
    const perf = 1 + execCount * 0.09 + (sectorBoosted ? 0.25 : 0)
    c.performance = perf
    const wages = tpl.wageBase * execCount
    const income = tpl.income * perf * mult - wages
    cash += income
    c.lastIncome = income
  })

  // ---- real estate: rent + slow appreciation ----
  const realEstate = state.realEstate.map((r) => ({ ...r }))
  realEstate.forEach((r) => {
    const tpl = byId(REAL_ESTATE_TEMPLATES, r.templateId)
    if (!tpl) return
    cash += tpl.rent * mult
    r.valueMultiplier = (r.valueMultiplier || 1) * (1 + tpl.appreciation / 20)
  })

  // ---- bank: savings interest, fixed deposits maturing, loan interest ----
  const bank = { savings: state.bank.savings, fixedDeposits: [...state.bank.fixedDeposits], loans: [...state.bank.loans] }
  bank.savings += bank.savings * BANK_PRODUCTS.savingsRate
  const maturedPayouts = []
  bank.fixedDeposits = bank.fixedDeposits
    .map((d) => ({ ...d, ticksLeft: d.ticksLeft - 1, amount: d.amount * (1 + BANK_PRODUCTS.fixedDepositRate) }))
    .filter((d) => {
      if (d.ticksLeft <= 0) {
        maturedPayouts.push(d.amount)
        return false
      }
      return true
    })
  maturedPayouts.forEach((amt) => {
    cash += amt
    news = pushNews({ news }, `A fixed deposit matured, paying out ${fmtLocal(amt)}.`)
  })
  bank.loans = bank.loans.map((l) => ({ ...l, amount: l.amount * (1 + l.rate) }))

  // ---- stock prices: random walk, event & dividend effects ----
  const stockPrices = { ...state.stockPrices }
  STOCKS.forEach((s) => {
    const cur = stockPrices[s.symbol]
    let drift = (Math.random() - 0.48) * s.vol * cur
    if (activeEvent && activeEvent.stockShock) drift += activeEvent.stockShock * cur * 0.1
    if (activeEvent && activeEvent.sectorBoost === s.sector) drift += cur * 0.02
    stockPrices[s.symbol] = Math.max(1, cur + drift)
  })
  // dividends on held shares
  Object.entries(state.stockHoldings).forEach(([symbol, qty]) => {
    if (!qty) return
    const s = byId(STOCKS, symbol, 'symbol')
    if (s) cash += qty * stockPrices[symbol] * (s.dividendYield / 12)
  })

  // ---- player-issued stocks (IPO'd companies) drift with company performance ----
  const playerStocks = state.playerStocks.map((ps) => {
    const trend = (reputation - 50) / 4000
    const drift = (Math.random() - 0.47 + trend) * 0.04 * ps.price
    return { ...ps, price: Math.max(0.5, ps.price + drift) }
  })

  // ---- AI rivals grow their net worth ----
  const aiRivals = state.aiRivals.map((r) => ({
    ...r,
    netWorth: r.netWorth * (1 + r.growth * diff.aiSpeed * mult) + (Math.random() - 0.5) * r.netWorth * 0.01,
  }))

  // ---- legal exposure: heat can trigger a legal case ----
  let legalCases = state.legalCases
  if (heat > 40 && Math.random() < 0.05) {
    const tpl = LEGAL_EVENTS[Math.floor(Math.random() * LEGAL_EVENTS.length)]
    legalCases = [...legalCases, { instanceId: `case-${Date.now()}`, templateId: tpl.id, resolved: false }]
    news = pushNews({ news }, `\u2696 ${tpl.news}`)
    heat = Math.max(0, heat - 10)
  }

  return {
    ...state,
    cash,
    reputation,
    heat,
    activeEvent,
    companies,
    realEstate,
    bank,
    stockPrices,
    playerStocks,
    aiRivals,
    legalCases,
    news,
  }
}

export { advanceTick, economyMultiplier }
