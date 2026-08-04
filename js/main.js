// ===========================================================================
// MAIN — app bootstrap: view routing, delegated events, the game loop.
// ===========================================================================

import { TICK_MS, MAX_SLOTS, DIFFICULTIES } from './data.js'
import {
  listProfiles, upsertProfile, touchProfile, listSlotsForProfile, loadSlot, saveSlot, deleteSlot,
  getSettings, saveSettings,
} from './db.js'
import { freshState, creditRating, loanLimit, netWorth, companyValuation as companyValuationFn } from './state.js'
import { advanceTick } from './engine.js'
import * as actions from './actions.js'
import {
  AVATARS, renderProfilePicker, renderSlotPicker, renderNewGamePicker,
  renderTicker, renderTopbar, renderTabs, renderEventBanner, renderDashboard,
  renderMap, renderBusinesses, renderExchange, renderBank, renderRealEstate,
  renderLuxury, renderLegal, renderSettings,
} from './ui.js'

const app = document.getElementById('app')

let view = 'profiles'          // profiles | slots | newgame | game
let currentProfile = null
let currentSlot = null
let pendingSlot = null
let selectedAvatar = AVATARS[0]
let gameState = null
let activeTab = 'dashboard'
let ctx = { theme: 'dark', selectedCity: 'newharbor' }
let tickTimer = null
let toastTimer = null

// ---------------- persistence helpers ----------------

function setState(fn) {
  gameState = fn(gameState)
  saveSlot(currentProfile, currentSlot, gameState)
  renderGame()
}

function startTicking() {
  stopTicking()
  tickTimer = setInterval(() => setState(advanceTick), TICK_MS)
}
function stopTicking() {
  if (tickTimer) clearInterval(tickTimer)
  tickTimer = null
}

function notify(msg) {
  let toast = document.getElementById('toast')
  if (!toast) {
    toast = document.createElement('div')
    toast.id = 'toast'
    toast.className = 'toast'
    document.body.appendChild(toast)
  }
  toast.textContent = msg
  toast.style.display = 'block'
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.style.display = 'none' }, 2400)
}

// ---------------- rendering ----------------

async function render() {
  if (view === 'profiles') {
    app.innerHTML = renderProfilePicker(listProfiles())
  } else if (view === 'slots') {
    const slots = await listSlotsForProfile(currentProfile, MAX_SLOTS)
    app.innerHTML = renderSlotPicker(currentProfile, slots)
  } else if (view === 'newgame') {
    app.innerHTML = renderNewGamePicker(currentProfile, pendingSlot)
  } else if (view === 'game') {
    renderGame()
  }
}

function renderGame() {
  if (!gameState) return
  app.innerHTML = `
    ${renderTicker(gameState)}
    ${renderTopbar(gameState, ctx)}
    ${renderTabs(activeTab)}
    <div class="content">
      ${renderEventBanner(gameState)}
      ${renderTabContent()}
    </div>`
}

function renderTabContent() {
  switch (activeTab) {
    case 'dashboard': return renderDashboard(gameState)
    case 'map': return renderMap(gameState, ctx)
    case 'businesses': return renderBusinesses(gameState, ctx)
    case 'exchange': return renderExchange(gameState)
    case 'bank': return renderBank(gameState, ctx)
    case 'realestate': return renderRealEstate(gameState, ctx)
    case 'luxury': return renderLuxury(gameState)
    case 'legal': return renderLegal(gameState)
    case 'settings': return renderSettings(gameState, ctx)
    default: return ''
  }
}

// ---------------- action handlers ----------------

const handlers = {
  pickAvatar(ds, el) {
    selectedAvatar = ds.avatar
    document.querySelectorAll('.avatar-choice').forEach((n) => n.classList.remove('selected'))
    el.classList.add('selected')
  },
  createProfile() {
    const nameInput = document.getElementById('new-profile-name')
    const name = (nameInput?.value || '').trim()
    if (!name) { notify('Enter a name first.'); return }
    upsertProfile(name, selectedAvatar)
    currentProfile = name
    view = 'slots'
    render()
  },
  selectProfile(ds) {
    currentProfile = ds.profile
    touchProfile(ds.profile)
    view = 'slots'
    render()
  },
  switchProfile() {
    currentProfile = null
    view = 'profiles'
    stopTicking()
    render()
  },
  async loadSlot(ds) {
    const slot = Number(ds.slot)
    const rec = await loadSlot(currentProfile, slot)
    if (!rec) { notify('Empty slot.'); return }
    currentSlot = slot
    gameState = rec.state
    view = 'game'
    activeTab = 'dashboard'
    render()
    startTicking()
  },
  async deleteSlot(ds) {
    await deleteSlot(currentProfile, Number(ds.slot))
    render()
  },
  newGamePrompt(ds) {
    pendingSlot = Number(ds.slot)
    view = 'newgame'
    render()
  },
  backToSlots() {
    view = 'slots'
    render()
  },
  startNewGame(ds) {
    currentSlot = pendingSlot
    gameState = freshState(currentProfile, ds.difficulty)
    view = 'game'
    activeTab = 'dashboard'
    saveSlot(currentProfile, currentSlot, gameState)
    render()
    startTicking()
  },
  toggleTheme() {
    ctx.theme = ctx.theme === 'dark' ? 'light' : 'dark'
    document.body.classList.toggle('light', ctx.theme === 'light')
    saveSettings({ theme: ctx.theme })
    render()
  },
  manualSave() {
    saveSlot(currentProfile, currentSlot, gameState)
    notify('Game saved.')
  },
  exportSave() {
    const blob = new Blob([JSON.stringify(gameState, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentProfile}-slot${currentSlot}-save.json`
    a.click()
    URL.revokeObjectURL(url)
  },
  importSave() {
    const input = document.getElementById('import-file')
    const file = input?.files?.[0]
    if (!file) { notify('Choose a file first.'); return }
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result)
        gameState = parsed
        saveSlot(currentProfile, currentSlot, gameState)
        notify('Save imported.')
        renderGame()
      } catch {
        notify('Invalid save file.')
      }
    }
    reader.readAsText(file)
  },
  quitToSlots() {
    stopTicking()
    view = 'slots'
    render()
  },
  setTab(ds) {
    activeTab = ds.tab
    renderGame()
  },
  selectCity(ds) {
    ctx.selectedCity = ds.city
    renderGame()
  },

  buyCompany(ds) { setState((s) => actions.buyCompany(s, ds.template, ds.city)) },
  sellCompany(ds) { setState((s) => actions.sellCompany(s, ds.company)) },
  ipoCompany(ds) { setState((s) => actions.ipoCompany(s, ds.company, companyValuationFn)) },
  buyStock(ds) { setState((s) => actions.buyStock(s, ds.symbol, Number(ds.qty))) },
  sellStock(ds) { setState((s) => actions.sellStock(s, ds.symbol, Number(ds.qty))) },
  acquireStock(ds) { setState((s) => actions.acquireStock(s, ds.symbol)) },
  splitPlayerStock(ds) { setState((s) => actions.splitPlayerStock(s, ds.symbol)) },

  depositSavings(ds) { setState((s) => actions.depositSavings(s, Number(ds.amount))) },
  withdrawSavings(ds) { setState((s) => actions.withdrawSavings(s, Number(ds.amount))) },
  openFixedDeposit(ds) { setState((s) => actions.openFixedDeposit(s, Number(ds.amount))) },
  takeLoan(ds) { setState((s) => actions.takeLoan(s, Number(ds.amount), creditRating, loanLimit)) },
  repayLoan(ds) { setState((s) => actions.repayLoan(s, ds.loan, Number(ds.amount))) },

  buyRealEstate(ds) { setState((s) => actions.buyRealEstate(s, ds.template, ds.city)) },
  sellRealEstate(ds) { setState((s) => actions.sellRealEstate(s, ds.property)) },

  buyLuxury(ds) { setState((s) => actions.buyLuxury(s, ds.item)) },

  resolveLegalCase(ds) { setState((s) => actions.resolveLegalCase(s, ds.case)) },
}

// ---------------- event delegation ----------------

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]')
  if (!el) return
  const action = el.dataset.action
  const fn = handlers[action]
  if (fn) fn(el.dataset, el)
})

document.addEventListener('change', (e) => {
  const el = e.target.closest('[data-action="hireExecutive"]')
  if (!el) return
  const role = el.dataset.role
  const companyId = el.dataset.company
  const execId = el.value
  if (execId) {
    setState((s) => actions.hireExecutive(s, companyId, role, execId))
  } else {
    setState((s) => actions.fireExecutive(s, companyId, role))
  }
})

// ---------------- boot ----------------

const settings = getSettings()
ctx.theme = settings.theme || 'dark'
document.body.classList.toggle('light', ctx.theme === 'light')
render()
