import { LocalStore } from './localStore.js';
import { IDB, saveKey, metaKey } from './indexedDB.js';
import { downloadJSON } from '../core/utils.js';
import { EventBus } from '../core/utils.js';
import { fmtDate } from '../core/format.js';

const MAX_SLOTS = 5;

export const SaveManager = {
  MAX_SLOTS,

  async loadSlot(userId, slot) {
    const data = await IDB.get(saveKey(userId, slot));
    return data;
  },

  async saveSlot(userId, slot, gameState) {
    const key = saveKey(userId, slot);
    await IDB.put(key, gameState, { userId, slot });
    const meta = {
      userId,
      slot,
      savedAt: Date.now(),
      netWorth: gameState.netWorth ?? 0,
      gameDate: gameState.date,
      companyCount: gameState.companies?.length ?? 0,
    };
    LocalStore.set(metaKey(userId, slot), meta);
    EventBus.emit('save:complete', { slot, meta });
    return meta;
  },

  getSlotMeta(userId, slot) {
    return LocalStore.get(metaKey(userId, slot), null);
  },

  getAllSlotMeta(userId) {
    const slots = [];
    for (let i = 0; i < MAX_SLOTS; i++) {
      slots.push({ slot: i, meta: this.getSlotMeta(userId, i) });
    }
    return slots;
  },

  async deleteSlot(userId, slot) {
    await IDB.delete(saveKey(userId, slot));
    LocalStore.remove(metaKey(userId, slot));
  },

  async backup(userId, slot, gameState) {
    await IDB.backup(saveKey(userId, slot), gameState);
    EventBus.emit('save:backup', { slot });
  },

  exportSave(userId, slot, gameState) {
    const exportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      userId,
      slot,
      gameState,
    };
    const dateStr = gameState.date ? fmtDate(gameState.date).replace(/[\s,]/g, '-') : 'save';
    downloadJSON(exportData, `gbe-save-slot${slot}-${dateStr}.json`);
    return exportData;
  },

  async importSave(file) {
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (!parsed.gameState || parsed.version == null) {
      throw new Error('Invalid save file format.');
    }
    return parsed;
  },

  async importToSlot(userId, slot, gameState) {
    await this.saveSlot(userId, slot, gameState);
    return this.getSlotMeta(userId, slot);
  },

  formatMeta(meta) {
    if (!meta) return 'Empty slot';
    const date = new Date(meta.savedAt).toLocaleString();
    const gd = meta.gameDate ? fmtDate(meta.gameDate) : '';
    return `${gd} · ${date}`;
  },
};
