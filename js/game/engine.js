import { createFreshState, mergeStateDefaults, calcNetWorth } from './state.js';
import { gameTick } from './tick.js';
import { SaveManager } from '../storage/saveManager.js';
import { LocalStore } from '../storage/localStore.js';
import { EventBus, debounce } from '../core/utils.js';
import { AuthManager } from '../auth/authManager.js';

export class GameEngine {
  constructor() {
    this.state = null;
    this.user = null;
    this.slot = 0;
    this.tickInterval = null;
    this.autoSaveInterval = null;
    this.listeners = new Set();
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify() {
    this.listeners.forEach((fn) => fn(this.state));
  }

  async startNew(playerName, slot = 0) {
    this.slot = slot;
    this.state = createFreshState(playerName);
    this.state.netWorth = calcNetWorth(this.state);
    await this.save();
    this.startTickLoop();
    this.notify();
    return this.state;
  }

  async load(user, slot) {
    this.user = user;
    this.slot = slot;
    const saved = await SaveManager.loadSlot(user.id, slot);
    if (saved) {
      this.state = mergeStateDefaults(saved);
    } else {
      this.state = createFreshState(user.displayName);
    }
    this.state.netWorth = calcNetWorth(this.state);
    this.startTickLoop();
    this.notify();
    return this.state;
  }

  startTickLoop() {
    this.stopTickLoop();
    const settings = LocalStore.getSettings();
    const ms = settings.tickSpeed || 4000;
    this.tickInterval = setInterval(() => {
      if (this.state && !this.state.paused) {
        this.state = gameTick(this.state);
        this.state.netWorth = calcNetWorth(this.state);
        this.notify();
        this.debouncedSave();
      }
    }, ms);

    if (settings.autoSave) {
      this.autoSaveInterval = setInterval(() => this.save(), settings.autoSaveInterval || 30000);
    }
  }

  stopTickLoop() {
    clearInterval(this.tickInterval);
    clearInterval(this.autoSaveInterval);
  }

  debouncedSave = debounce(() => this.save(), 2000);

  async save() {
    if (!this.state || !this.user) return;
    this.state.netWorth = calcNetWorth(this.state);
    await SaveManager.saveSlot(this.user.id, this.slot, this.state);
    AuthManager.updateStats({
      totalNetWorth: Math.max(this.user.stats?.totalNetWorth || 0, this.state.netWorth),
      companiesOwned: this.state.companies?.length || 0,
      daysPlayed: this.state.date?.tick || 0,
    });
    EventBus.emit('game:saved', { slot: this.slot });
  }

  async manualSave() {
    await this.save();
    EventBus.emit('game:manualSave');
  }

  setState(updater) {
    const next = typeof updater === 'function' ? updater(this.state) : updater;
    if (next) {
      this.state = next;
      this.state.netWorth = calcNetWorth(this.state);
      this.notify();
      this.debouncedSave();
    }
    return this.state;
  }

  applyAction(result) {
    if (result?.ok && result.state) {
      this.setState(result.state);
      return result.msg;
    }
    return result?.msg || 'Action failed.';
  }

  togglePause() {
    if (this.state) {
      this.state.paused = !this.state.paused;
      this.notify();
    }
  }

  setSpeed(speed) {
    if (this.state) {
      this.state.speed = speed;
      const settings = LocalStore.getSettings();
      settings.tickSpeed = speed === 2 ? 2000 : speed === 3 ? 1000 : 4000;
      LocalStore.setSettings(settings);
      this.startTickLoop();
      this.notify();
    }
  }

  destroy() {
    this.stopTickLoop();
    this.state = null;
  }
}

export const engine = new GameEngine();
