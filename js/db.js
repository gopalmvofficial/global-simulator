// ===========================================================================
// DB — persistence layer. IndexedDB for save-game payloads (can be large),
// localStorage for lightweight settings and the profile index.
// ===========================================================================

import { DB_NAME, DB_VERSION, SAVE_STORE } from './data.js'

let dbPromise = null

function openDb() {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(SAVE_STORE)) {
        db.createObjectStore(SAVE_STORE, { keyPath: 'key' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  return dbPromise
}

function slotKey(profile, slot) {
  return `${profile}::slot${slot}`
}

async function saveSlot(profile, slot, state) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SAVE_STORE, 'readwrite')
    tx.objectStore(SAVE_STORE).put({ key: slotKey(profile, slot), profile, slot, savedAt: Date.now(), state })
    tx.oncomplete = () => resolve(true)
    tx.onerror = () => reject(tx.error)
  })
}

async function loadSlot(profile, slot) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SAVE_STORE, 'readonly')
    const req = tx.objectStore(SAVE_STORE).get(slotKey(profile, slot))
    req.onsuccess = () => resolve(req.result || null)
    req.onerror = () => reject(req.error)
  })
}

async function deleteSlot(profile, slot) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SAVE_STORE, 'readwrite')
    tx.objectStore(SAVE_STORE).delete(slotKey(profile, slot))
    tx.oncomplete = () => resolve(true)
    tx.onerror = () => reject(tx.error)
  })
}

async function listSlotsForProfile(profile, maxSlots) {
  const results = []
  for (let i = 1; i <= maxSlots; i++) {
    results.push(await loadSlot(profile, i))
  }
  return results
}

// ---- localStorage: profile index + settings (small, synchronous, fast) ----

const PROFILES_KEY = 'business-empire-profiles'
const SETTINGS_KEY = 'business-empire-settings'

function listProfiles() {
  try {
    const raw = localStorage.getItem(PROFILES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveProfiles(profiles) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
}

function upsertProfile(name, avatar) {
  const profiles = listProfiles()
  const existing = profiles.find((p) => p.name === name)
  if (existing) {
    existing.avatar = avatar
    existing.lastPlayed = Date.now()
  } else {
    profiles.push({ name, avatar, createdAt: Date.now(), lastPlayed: Date.now() })
  }
  saveProfiles(profiles)
}

function touchProfile(name) {
  const profiles = listProfiles()
  const p = profiles.find((x) => x.name === name)
  if (p) {
    p.lastPlayed = Date.now()
    saveProfiles(profiles)
  }
}

function getSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? JSON.parse(raw) : { theme: 'dark' }
  } catch {
    return { theme: 'dark' }
  }
}

function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export {
  saveSlot, loadSlot, deleteSlot, listSlotsForProfile,
  listProfiles, upsertProfile, touchProfile, getSettings, saveSettings,
}
