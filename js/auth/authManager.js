import { LocalStore } from '../storage/localStore.js';
import { hashPassword, uid } from '../core/utils.js';

export const AVATARS = ['👔', '💼', '🏛️', '🌐', '💎', '🚀', '🎯', '👑', '🦁', '🦅', '🐉', '⚡'];

export const AuthManager = {
  getAccounts() {
    return LocalStore.getAccounts();
  },

  async register(username, password, avatar = AVATARS[0]) {
    const name = username.trim().toLowerCase();
    if (!name || name.length < 3) throw new Error('Username must be at least 3 characters.');
    if (!password || password.length < 4) throw new Error('Password must be at least 4 characters.');
    const accounts = this.getAccounts();
    if (accounts[name]) throw new Error('Username already exists.');
    const user = {
      id: uid('user'),
      username: name,
      displayName: username.trim(),
      passwordHash: await hashPassword(password),
      avatar,
      createdAt: Date.now(),
      stats: { gamesPlayed: 0, totalNetWorth: 0, companiesOwned: 0, daysPlayed: 0 },
      profiles: [],
    };
    accounts[name] = user;
    LocalStore.setAccounts(accounts);
    return user;
  },

  async login(username, password) {
    const name = username.trim().toLowerCase();
    const accounts = this.getAccounts();
    const user = accounts[name];
    if (!user) throw new Error('Account not found.');
    const hash = await hashPassword(password);
    if (hash !== user.passwordHash) throw new Error('Incorrect password.');
    const session = { userId: user.id, username: name, loggedInAt: Date.now() };
    LocalStore.setSession(session);
    return user;
  },

  logout() {
    LocalStore.setSession(null);
  },

  getCurrentUser() {
    const session = LocalStore.getSession();
    if (!session) return null;
    const accounts = this.getAccounts();
    return accounts[session.username] || null;
  },

  updateUser(updates) {
    const user = this.getCurrentUser();
    if (!user) return null;
    const accounts = this.getAccounts();
    accounts[user.username] = { ...user, ...updates };
    LocalStore.setAccounts(accounts);
    return accounts[user.username];
  },

  updateStats(statsUpdate) {
    const user = this.getCurrentUser();
    if (!user) return;
    const stats = { ...user.stats, ...statsUpdate };
    this.updateUser({ stats });
  },

  async resetPassword(username, newPassword) {
    const name = username.trim().toLowerCase();
    const accounts = this.getAccounts();
    const user = accounts[name];
    if (!user) throw new Error('Account not found.');
    if (!newPassword || newPassword.length < 4) throw new Error('Password must be at least 4 characters.');
    user.passwordHash = await hashPassword(newPassword);
    accounts[name] = user;
    LocalStore.setAccounts(accounts);
    return user;
  },

  addProfile(profile) {
    const user = this.getCurrentUser();
    if (!user) return null;
    const profiles = [...(user.profiles || []), { id: uid('profile'), ...profile, createdAt: Date.now() }];
    return this.updateUser({ profiles });
  },

  deleteProfile(profileId) {
    const user = this.getCurrentUser();
    if (!user) return null;
    const profiles = (user.profiles || []).filter((p) => p.id !== profileId);
    return this.updateUser({ profiles });
  },
};
