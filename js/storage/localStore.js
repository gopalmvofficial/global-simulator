const PREFIX = 'gbe-';

export const LocalStore = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  remove(key) {
    localStorage.removeItem(PREFIX + key);
  },

  getSettings() {
    return this.get('settings', {
      theme: 'dark',
      tickSpeed: 4000,
      autoSave: true,
      autoSaveInterval: 30000,
      notifications: true,
      soundEnabled: false,
      activeSlot: 0,
      cloudSaveReady: false,
    });
  },

  setSettings(settings) {
    return this.set('settings', settings);
  },

  getAccounts() {
    return this.get('accounts', {});
  },

  setAccounts(accounts) {
    return this.set('accounts', accounts);
  },

  getSession() {
    return this.get('session', null);
  },

  setSession(session) {
    if (session) this.set('session', session);
    else this.remove('session');
  },
};
