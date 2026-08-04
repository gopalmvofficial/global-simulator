// ===========================================================================
// UI — pure render functions: (state, ctx) => HTML string.
// No DOM manipulation happens here; main.js sets innerHTML and wires events
// via a single delegated click handler keyed off data-action attributes.
// ===========================================================================

import {
  CITIES, SECTORS, COMPANY_TEMPLATES, EXECUTIVE_ROLES, EXECUTIVE_POOL, STOCKS,
  REAL_ESTATE_TEMPLATES, LUXURY_ITEMS, BANK_PRODUCTS, DIFFICULTIES, LEGAL_EVENTS, MAX_SLOTS,
} from './data.js'
import {
  byId, fmt, fmtFull, companyValuation, realEstateValue, netWorth, prestigeTotal, creditRating,
  bankDepositsTotal, loansTotal, stockPortfolioValue, loanLimit as loanLimitFn,
} from './state.js'

const AVATARS = ['\u{1F454}', '\u{1F469}\u200D\u{1F4BC}', '\u{1F468}\u200D\u{1F4BC}', '\u{1F451}', '\u{1F98A}', '\u{1F989}', '\u{1F43A}', '\u{1F42F}']

// ---------------- Auth / profile screens ----------------

function renderProfilePicker(profiles) {
  const rows = profiles.length
    ? profiles.map((p) => `
        <div class="profile-row" data-action="selectProfile" data-profile="${p.name}">
          <span class="profile-avatar">${p.avatar}</span>
          <div class="profile-meta">
            <div class="profile-name">${p.name}</div>
            <div class="profile-sub">Last played ${new Date(p.lastPlayed).toLocaleDateString()}</div>
          </div>
          <span style="color:var(--text-dim);font-size:12px;">Continue &rarr;</span>
        </div>`).join('')
    : `<p class="empty-note">No profiles yet — create one below.</p>`

  return `
    <div class="screen-center">
      <div class="auth-card">
        <div class="auth-mark">Meridian Holdings</div>
        <div class="auth-title">Business Empire</div>
        <p class="auth-sub">Select a profile to continue building your empire.</p>
        <div class="profile-list">${rows}</div>
        <h3 style="margin-top:4px;">New Profile</h3>
        <input id="new-profile-name" placeholder="Your name" maxlength="18" />
        <div class="avatar-row" id="avatar-row">
          ${AVATARS.map((a, i) => `<div class="avatar-choice${i === 0 ? ' selected' : ''}" data-action="pickAvatar" data-avatar="${a}">${a}</div>`).join('')}
        </div>
        <button class="btn btn-primary btn-block" data-action="createProfile">Create Profile</button>
      </div>
    </div>`
}

function renderSlotPicker(profile, slots) {
  const rows = []
  for (let i = 1; i <= MAX_SLOTS; i++) {
    const s = slots[i - 1]
    if (s) {
      rows.push(`
        <div class="slot-card">
          <div>
            <div style="font-weight:700;font-size:13.5px;">Slot ${i}</div>
            <div class="profile-sub">Saved ${new Date(s.savedAt).toLocaleString()} \u00b7 ${fmt(s.state.cash)} cash \u00b7 Tick ${s.state.tickCount}</div>
          </div>
          <div class="btn-row" style="margin:0;">
            <button class="btn btn-primary" data-action="loadSlot" data-slot="${i}">Load</button>
            <button class="btn btn-ghost" data-action="deleteSlot" data-slot="${i}">Delete</button>
          </div>
        </div>`)
    } else {
      rows.push(`
        <div class="slot-card">
          <div class="slot-empty">Slot ${i} — empty</div>
          <button class="btn btn-secondary" data-action="newGamePrompt" data-slot="${i}">New Game</button>
        </div>`)
    }
  }
  return `
    <div class="screen-center">
      <div class="auth-card" style="max-width:520px;">
        <div class="auth-mark">${profile}</div>
        <div class="auth-title">Save Slots</div>
        <p class="auth-sub">Continue an empire or start a new one in an empty slot.</p>
        ${rows.join('')}
        <button class="btn btn-ghost btn-block" style="margin-top:10px;" data-action="switchProfile">Switch Profile</button>
      </div>
    </div>`
}

function renderNewGamePicker(profile, slot) {
  return `
    <div class="screen-center">
      <div class="auth-card">
        <div class="auth-mark">${profile} \u00b7 Slot ${slot}</div>
        <div class="auth-title">Choose Difficulty</div>
        <p class="auth-sub">Higher difficulty means less starting capital and faster, hungrier AI rivals.</p>
        ${Object.entries(DIFFICULTIES).map(([id, d]) => `
          <div class="card" style="margin-bottom:10px;cursor:pointer;" data-action="startNewGame" data-difficulty="${id}">
            <div class="card-head"><span class="card-title">${d.label}</span><span class="badge emerald">${fmt(d.startCash)} start</span></div>
            <div class="row"><span>AI rival speed</span><span>${d.aiSpeed}x</span></div>
          </div>`).join('')}
        <button class="btn btn-ghost btn-block" data-action="backToSlots">Back</button>
      </div>
    </div>`
}

// ---------------- Chrome: ticker / topbar / tabs ----------------

function renderTicker(state) {
  const items = STOCKS.map((s) => {
    const price = state.stockPrices[s.symbol]
    const dir = Math.random() > 0.5 ? 'up' : 'down'
    const arrow = dir === 'up' ? '\u25B2' : '\u25BC'
    return `<span class="ticker-item">${s.symbol} <span class="${dir}">${arrow} $${price.toFixed(2)}</span></span>`
  }).join('')
  return `<div class="ticker-bar"><div class="ticker-track">${items}${items}</div></div>`
}

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'map', label: 'World Map' },
  { id: 'businesses', label: 'Businesses' },
  { id: 'exchange', label: 'Exchange' },
  { id: 'bank', label: 'Bank' },
  { id: 'realestate', label: 'Real Estate' },
  { id: 'luxury', label: 'Luxury' },
  { id: 'legal', label: 'Legal' },
  { id: 'settings', label: 'Settings' },
]

function renderTopbar(state, ctx) {
  const nw = netWorth(state)
  const rating = creditRating(state)
  return `
    <div class="topbar">
      <div class="brand">
        <span class="brand-mark">MERIDIAN<span class="accent"> HOLDINGS</span></span>
        <span class="brand-sub">${state.profile} \u00b7 ${DIFFICULTIES[state.difficulty]?.label || ''} \u00b7 Week ${state.tickCount}</span>
      </div>
      <div class="stat-strip">
        <div class="stat-chip"><span class="stat-chip-label">Net Worth</span><span class="stat-chip-value pos">${fmt(nw)}</span></div>
        <div class="stat-chip"><span class="stat-chip-label">Cash</span><span class="stat-chip-value">${fmt(state.cash)}</span></div>
        <div class="stat-chip"><span class="stat-chip-label">Reputation</span><span class="stat-chip-value">${Math.round(state.reputation)}</span></div>
        <div class="stat-chip"><span class="stat-chip-label">Credit</span><span class="stat-chip-value">${rating.grade}</span></div>
        <div class="stat-chip"><span class="stat-chip-label">Heat</span><span class="stat-chip-value neg">${Math.round(state.heat)}</span></div>
        <div class="stat-chip"><span class="stat-chip-label">Prestige</span><span class="stat-chip-value">${Math.round(prestigeTotal(state))}</span></div>
      </div>
      <div class="topbar-actions">
        <button class="icon-btn" data-action="toggleTheme">${ctx.theme === 'light' ? '\u2600' : '\u{1F319}'}</button>
        <button class="icon-btn" data-action="manualSave">Save</button>
        <button class="icon-btn" data-action="exportSave">Export</button>
        <button class="icon-btn" data-action="quitToSlots">Quit</button>
      </div>
    </div>`
}

function renderTabs(activeTab) {
  return `<div class="tabs">${TABS.map((t) => `<button class="tab-btn${t.id === activeTab ? ' active' : ''}" data-action="setTab" data-tab="${t.id}">${t.label}</button>`).join('')}</div>`
}

function renderEventBanner(state) {
  if (!state.activeEvent) return ''
  const e = state.activeEvent
  return `<div class="event-banner ${e.kind}"><span>${e.kind === 'positive' ? '\u2728' : '\u26A0'} <strong>${e.label}</strong> — ${e.news} (${e.ticksLeft} weeks left)</span></div>`
}

function renderNews(state) {
  return `
    <section class="panel" style="margin-top:16px;">
      <h2>Global Business Wire</h2>
      <ul class="news-list">
        ${state.news.map((n) => `<li><span class="news-time">${new Date(n.t).toLocaleTimeString()}</span><span>${n.msg}</span></li>`).join('')}
      </ul>
    </section>`
}

// ---------------- Dashboard ----------------

function renderDashboard(state) {
  const nw = netWorth(state)
  const leaderboard = [...state.aiRivals.map((r) => ({ name: r.name, value: r.netWorth, you: false })), { name: state.profile, value: nw, you: true }]
    .sort((a, b) => b.value - a.value)

  return `
    <div class="grid-2">
      <section class="panel">
        <h2>Empire Overview</h2>
        <div class="row"><span>Net worth</span><span class="pos">${fmt(nw)}</span></div>
        <div class="row"><span>Cash on hand</span><span>${fmt(state.cash)}</span></div>
        <div class="row"><span>Bank deposits</span><span>${fmt(bankDepositsTotal(state))}</span></div>
        <div class="row"><span>Outstanding loans</span><span class="neg">${fmt(loansTotal(state))}</span></div>
        <div class="row"><span>Companies owned</span><span>${state.companies.length}</span></div>
        <div class="row"><span>Properties owned</span><span>${state.realEstate.length}</span></div>
        <div class="row"><span>Stock portfolio</span><span>${fmt(stockPortfolioValue(state))}</span></div>
        <div class="row"><span>Luxury assets</span><span>${state.luxury.length}</span></div>
        <div class="row"><span>Open legal cases</span><span class="${state.legalCases.length ? 'neg' : ''}">${state.legalCases.length}</span></div>
      </section>
      <section class="panel">
        <h2>World's Wealthiest — Leaderboard</h2>
        ${leaderboard.map((row, i) => `
          <div class="leaderboard-row">
            <span class="leaderboard-rank">#${i + 1}</span>
            <span class="leaderboard-name${row.you ? ' leaderboard-you' : ''}">${row.name}${row.you ? ' (you)' : ''}</span>
            <span class="leaderboard-value">${fmt(row.value)}</span>
          </div>`).join('')}
      </section>
    </div>
    ${renderNews(state)}`
}

export {
  AVATARS, TABS, renderProfilePicker, renderSlotPicker, renderNewGamePicker,
  renderTicker, renderTopbar, renderTabs, renderEventBanner, renderNews, renderDashboard,
}

// ---------------- World Map ----------------

function renderMap(state, ctx) {
  const nodes = CITIES.map((c) => {
    const size = 8 + Math.min(18, Math.log10(c.population) * 3)
    return `<div class="city-node${ctx.selectedCity === c.id ? ' selected' : ''}" style="left:${c.x}%;top:${c.y}%;width:${size}px;height:${size}px;" data-action="selectCity" data-city="${c.id}"></div>
      <div class="city-label" style="left:${c.x}%;top:${c.y}%;">${c.name}</div>`
  }).join('')

  const city = byId(CITIES, ctx.selectedCity) || CITIES[0]
  const companiesHere = state.companies.filter((co) => co.cityId === city.id)
  const propertiesHere = state.realEstate.filter((r) => r.cityId === city.id)

  return `
    <div class="grid-2">
      <section class="panel">
        <h2>World Map</h2>
        <p class="panel-intro">Click a city to see its economy and your local holdings.</p>
        <div class="city-map">${nodes}</div>
      </section>
      <section class="panel">
        <h2>${city.name}, ${city.country}</h2>
        <div class="row"><span>Population</span><span>${city.population.toLocaleString()}</span></div>
        <div class="row"><span>GDP</span><span>${fmt(city.gdp)}</span></div>
        <div class="row"><span>Tax rate</span><span>${(city.taxRate * 100).toFixed(0)}%</span></div>
        <div class="row"><span>Annual growth</span><span class="pos">${(city.growth * 100).toFixed(1)}%</span></div>
        <div class="row"><span>Your companies here</span><span>${companiesHere.length}</span></div>
        <div class="row"><span>Your properties here</span><span>${propertiesHere.length}</span></div>
        <div class="btn-row">
          <button class="btn btn-secondary" data-action="setTab" data-tab="businesses">Found a Company Here</button>
          <button class="btn btn-secondary" data-action="setTab" data-tab="realestate">Buy Real Estate Here</button>
        </div>
      </section>
    </div>`
}

// ---------------- Businesses ----------------

function renderExecutiveControls(state, company) {
  return EXECUTIVE_ROLES.map((role) => {
    const candidates = EXECUTIVE_POOL.filter((e) => e.role === role)
    const currentId = company.executives[role]
    const options = [`<option value="">— none —</option>`]
      .concat(candidates.map((c) => `<option value="${c.id}" ${currentId === c.id ? 'selected' : ''}>${c.name} (skill ${c.skill}, ${fmt(c.salary)}/wk)</option>`))
      .join('')
    return `
      <div class="row" style="align-items:center;">
        <span>${role}</span>
        <select data-action="hireExecutive" data-company="${company.instanceId}" data-role="${role}" style="background:var(--bg);color:var(--text);border:1px solid var(--line);border-radius:6px;padding:4px 6px;font-size:11.5px;">
          ${options}
        </select>
      </div>`
  }).join('')
}

function renderBusinesses(state, ctx) {
  const owned = state.companies
  const ownedCards = owned.length ? owned.map((c) => {
    const tpl = byId(COMPANY_TEMPLATES, c.templateId)
    const city = byId(CITIES, c.cityId)
    const isPublic = state.playerStocks.some((ps) => ps.companyInstanceId === c.instanceId)
    return `
      <div class="card">
        <div class="card-head"><span class="card-title">${tpl.name}</span><span class="badge emerald">${SECTORS.find((s) => s.id === tpl.sector)?.name}</span></div>
        <div class="row"><span>City</span><span>${city ? city.name : '—'}</span></div>
        <div class="row"><span>Valuation</span><span>${fmt(companyValuation(c))}</span></div>
        <div class="row"><span>Weekly net income</span><span class="${c.lastIncome >= 0 ? 'pos' : 'neg'}">${fmt(c.lastIncome || 0)}</span></div>
        <h3>Executive Team</h3>
        ${renderExecutiveControls(state, c)}
        <div class="btn-row">
          ${isPublic ? `<span class="badge blue">Public — ${state.playerStocks.find((ps) => ps.companyInstanceId === c.instanceId).symbol}</span>` : `<button class="btn btn-secondary" data-action="ipoCompany" data-company="${c.instanceId}">Take Public (IPO)</button>`}
          <button class="btn btn-ghost" data-action="sellCompany" data-company="${c.instanceId}">Sell Company</button>
        </div>
      </div>`
  }).join('') : `<p class="empty-note">You don't own any companies yet — found one below.</p>`

  const sectorBlocks = SECTORS.map((sector) => {
    const templates = COMPANY_TEMPLATES.filter((t) => t.sector === sector.id)
    return `
      <h3>${sector.name}</h3>
      <div class="grid-cards">
        ${templates.map((t) => `
          <div class="card">
            <div class="card-head"><span class="card-title">${t.name}</span></div>
            <div class="row"><span>Base weekly income</span><span class="pos">${fmt(t.income)}</span></div>
            <div class="row"><span>Valuation</span><span>${fmt(t.valuation)}</span></div>
            <button class="btn btn-primary btn-block" style="margin-top:8px;" data-action="buyCompany" data-template="${t.id}" data-city="${ctx.selectedCity}" ${state.cash < t.cost ? 'disabled' : ''}>Found — ${fmt(t.cost)}</button>
          </div>`).join('')}
      </div>`
  }).join('')

  return `
    <section class="panel">
      <h2>Your Companies</h2>
      <div class="grid-cards">${ownedCards}</div>
    </section>
    <section class="panel" style="margin-top:16px;">
      <h2>Found a New Company — in ${byId(CITIES, ctx.selectedCity)?.name || CITIES[0].name}</h2>
      <p class="panel-intro">Change the active city from the World Map tab. New companies start with no executives — hire a team above to boost performance.</p>
      ${sectorBlocks}
    </section>`
}

// ---------------- Exchange ----------------

function renderExchange(state) {
  const rows = STOCKS.map((s) => {
    const price = state.stockPrices[s.symbol]
    const held = state.stockHoldings[s.symbol] || 0
    return `
      <tr>
        <td>${s.symbol}</td><td>${s.name}</td><td>$${price.toFixed(2)}</td><td>${held.toLocaleString()}</td>
        <td>
          <div class="btn-row" style="margin:0;">
            <button class="btn btn-secondary" data-action="buyStock" data-symbol="${s.symbol}" data-qty="100" ${state.cash < price * 100 ? 'disabled' : ''}>Buy 100</button>
            <button class="btn btn-secondary" data-action="sellStock" data-symbol="${s.symbol}" data-qty="100" ${held < 100 ? 'disabled' : ''}>Sell 100</button>
            ${held >= s.mergeThreshold ? `<button class="btn btn-primary" data-action="acquireStock" data-symbol="${s.symbol}">Acquire</button>` : ''}
          </div>
        </td>
      </tr>`
  }).join('')

  const playerRows = state.playerStocks.length ? state.playerStocks.map((ps) => `
    <tr><td>${ps.symbol}</td><td>${ps.name}</td><td>$${ps.price.toFixed(2)}</td><td>${ps.founderShares.toLocaleString()} / ${ps.totalShares.toLocaleString()}</td>
      <td><button class="btn btn-secondary" data-action="splitPlayerStock" data-symbol="${ps.symbol}">Split 2-for-1</button></td></tr>`).join('')
    : `<tr><td colspan="5" class="empty-note">Take one of your companies public from the Businesses tab.</td></tr>`

  return `
    <section class="panel">
      <h2>Your Public Companies</h2>
      <table class="data-table"><thead><tr><th>Symbol</th><th>Name</th><th>Price</th><th>Founder / Total Shares</th><th></th></tr></thead>
        <tbody>${playerRows}</tbody></table>
    </section>
    <section class="panel" style="margin-top:16px;">
      <h2>Exchange — Rival Companies</h2>
      <p class="panel-intro">Cross the majority-share threshold on any stock to acquire it in a hostile takeover.</p>
      <table class="data-table"><thead><tr><th>Symbol</th><th>Name</th><th>Price</th><th>You Hold</th><th>Actions</th></tr></thead>
        <tbody>${rows}</tbody></table>
    </section>`
}

// ---------------- Bank ----------------

function renderBank(state, ctx) {
  const rating = creditRating(state)
  const limit = loanLimitFn(state)
  return `
    <div class="grid-2">
      <section class="panel">
        <h2>Accounts</h2>
        <div class="row"><span>Savings balance</span><span class="pos">${fmt(state.bank.savings)}</span></div>
        <div class="row"><span>Savings rate</span><span>${(BANK_PRODUCTS.savingsRate * 100).toFixed(2)}%/week</span></div>
        <div class="btn-row">
          <button class="btn btn-secondary" data-action="depositSavings" data-amount="100000" ${state.cash < 100000 ? 'disabled' : ''}>Deposit ${fmt(100000)}</button>
          <button class="btn btn-secondary" data-action="withdrawSavings" data-amount="100000" ${state.bank.savings < 100000 ? 'disabled' : ''}>Withdraw ${fmt(100000)}</button>
        </div>
        <h3>Fixed Deposits (${BANK_PRODUCTS.fixedDepositTermTicks}-week term, ${(BANK_PRODUCTS.fixedDepositRate * 100).toFixed(2)}%/week)</h3>
        ${state.bank.fixedDeposits.length ? state.bank.fixedDeposits.map((d) => `<div class="row"><span>${fmt(d.amount)}</span><span>${d.ticksLeft} weeks left</span></div>`).join('') : `<p class="empty-note">No active fixed deposits.</p>`}
        <button class="btn btn-primary btn-block" style="margin-top:8px;" data-action="openFixedDeposit" data-amount="250000" ${state.cash < 250000 ? 'disabled' : ''}>Open Fixed Deposit — ${fmt(250000)}</button>
      </section>
      <section class="panel">
        <h2>Credit &amp; Loans</h2>
        <div class="row"><span>Credit rating</span><span>${rating.grade} (${Math.round(rating.score)}/100)</span></div>
        <div class="row"><span>Loan limit</span><span>${fmt(limit)}</span></div>
        <div class="row"><span>Outstanding loans</span><span class="neg">${fmt(loansTotal(state))}</span></div>
        <div class="btn-row">
          <button class="btn btn-secondary" data-action="takeLoan" data-amount="500000" ${loansTotal(state) + 500000 > limit ? 'disabled' : ''}>Borrow ${fmt(500000)}</button>
          <button class="btn btn-secondary" data-action="takeLoan" data-amount="2000000" ${loansTotal(state) + 2000000 > limit ? 'disabled' : ''}>Borrow ${fmt(2000000)}</button>
        </div>
        <h3>Active Loans</h3>
        ${state.bank.loans.length ? state.bank.loans.map((l) => `
          <div class="row" style="align-items:center;">
            <span>${fmt(l.amount)} @ ${(l.rate * 100).toFixed(2)}%/wk</span>
            <button class="btn btn-primary" style="width:auto;" data-action="repayLoan" data-loan="${l.instanceId}" data-amount="${Math.min(l.amount, state.cash)}">Repay</button>
          </div>`).join('') : `<p class="empty-note">No outstanding loans.</p>`}
      </section>
    </div>`
}

// ---------------- Real Estate ----------------

function renderRealEstate(state, ctx) {
  const city = byId(CITIES, ctx.selectedCity) || CITIES[0]
  const ownedHere = state.realEstate.filter((r) => r.cityId === city.id)
  return `
    <section class="panel">
      <h2>Your Portfolio — ${city.name}</h2>
      <p class="panel-intro">Switch cities from the World Map tab.</p>
      <div class="grid-cards">
        ${ownedHere.length ? ownedHere.map((r) => {
          const tpl = byId(REAL_ESTATE_TEMPLATES, r.templateId)
          return `
            <div class="card">
              <div class="card-head"><span class="card-title">${tpl.name}</span><span class="badge blue">${tpl.kind}</span></div>
              <div class="row"><span>Rent / week</span><span class="pos">${tpl.rent ? '+' + fmt(tpl.rent) : 'None (land)'}</span></div>
              <div class="row"><span>Current value</span><span>${fmt(realEstateValue(r))}</span></div>
              <button class="btn btn-ghost btn-block" data-action="sellRealEstate" data-property="${r.instanceId}">Sell</button>
            </div>`
        }).join('') : `<p class="empty-note">No property owned in this city.</p>`}
      </div>
    </section>
    <section class="panel" style="margin-top:16px;">
      <h2>Available in ${city.name}</h2>
      <div class="grid-cards">
        ${REAL_ESTATE_TEMPLATES.map((tpl) => `
          <div class="card">
            <div class="card-head"><span class="card-title">${tpl.name}</span><span class="badge blue">${tpl.kind}</span></div>
            <div class="row"><span>Rent / week</span><span>${tpl.rent ? '+' + fmt(tpl.rent) : 'None (land)'}</span></div>
            <div class="row"><span>Appreciation</span><span class="pos">${(tpl.appreciation * 100).toFixed(1)}%/yr</span></div>
            <button class="btn btn-primary btn-block" style="margin-top:8px;" data-action="buyRealEstate" data-template="${tpl.id}" data-city="${city.id}" ${state.cash < tpl.cost ? 'disabled' : ''}>Buy — ${fmt(tpl.cost)}</button>
          </div>`).join('')}
      </div>
    </section>`
}

// ---------------- Luxury ----------------

function renderLuxury(state) {
  const owned = state.luxury
  return `
    <section class="panel">
      <h2>Your Collection</h2>
      <div class="row"><span>Total prestige</span><span class="pos">${Math.round(prestigeTotal(state))}</span></div>
      <div class="grid-cards" style="margin-top:10px;">
        ${owned.length ? owned.map((l) => {
          const tpl = byId(LUXURY_ITEMS, l.itemId)
          return `<div class="card"><div class="card-head"><span class="card-title">${tpl.name}</span><span class="badge amber">+${tpl.prestige} prestige</span></div></div>`
        }).join('') : `<p class="empty-note">No luxury assets yet.</p>`}
      </div>
    </section>
    <section class="panel" style="margin-top:16px;">
      <h2>Luxury Store</h2>
      <div class="grid-cards">
        ${LUXURY_ITEMS.map((tpl) => `
          <div class="card">
            <div class="card-head"><span class="card-title">${tpl.name}</span><span class="badge amber">+${tpl.prestige}</span></div>
            <button class="btn btn-primary btn-block" style="margin-top:8px;" data-action="buyLuxury" data-item="${tpl.id}" ${state.cash < tpl.cost ? 'disabled' : ''}>Buy — ${fmt(tpl.cost)}</button>
          </div>`).join('')}
      </div>
    </section>`
}

// ---------------- Legal ----------------

function renderLegal(state) {
  return `
    <section class="panel">
      <h2>Open Cases</h2>
      <p class="panel-intro">High heat (from aggressive expansion or scandals) raises the odds of a new case. Unresolved cases keep costing reputation.</p>
      ${state.legalCases.length ? state.legalCases.map((kase) => {
        const tpl = byId(LEGAL_EVENTS, kase.templateId)
        return `
          <div class="card" style="margin-bottom:10px;">
            <div class="card-head"><span class="card-title">${tpl.label}</span><span class="badge red">heat ${tpl.heat}</span></div>
            <p class="panel-intro" style="margin-bottom:8px;">${tpl.news}</p>
            <button class="btn btn-primary" data-action="resolveLegalCase" data-case="${kase.instanceId}" ${state.cash < tpl.cost ? 'disabled' : ''}>Settle — ${fmt(tpl.cost)}</button>
          </div>`
      }).join('') : `<p class="empty-note">No open legal cases.</p>`}
    </section>`
}

// ---------------- Settings ----------------

function renderSettings(state, ctx) {
  return `
    <section class="panel">
      <h2>Settings</h2>
      <div class="row"><span>Theme</span><span>${ctx.theme}</span></div>
      <button class="btn btn-secondary" style="margin-top:8px;" data-action="toggleTheme">Toggle Dark / Light</button>
      <h3>Save Management</h3>
      <div class="btn-row">
        <button class="btn btn-secondary" data-action="manualSave">Save Now</button>
        <button class="btn btn-secondary" data-action="exportSave">Export Save (JSON)</button>
        <button class="btn btn-ghost" data-action="quitToSlots">Quit to Slot Menu</button>
      </div>
      <h3>Import Save</h3>
      <input type="file" id="import-file" accept="application/json" />
      <button class="btn btn-primary" style="margin-top:8px;" data-action="importSave">Import</button>
    </section>`
}

export {
  renderMap, renderBusinesses, renderExchange, renderBank, renderRealEstate,
  renderLuxury, renderLegal, renderSettings,
}
