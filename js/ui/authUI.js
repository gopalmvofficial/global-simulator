import { AuthManager, AVATARS } from '../auth/authManager.js';
import { el, escapeHtml } from './dom.js';

export function renderAuthScreen(onSuccess) {
  const root = document.getElementById('app');
  let mode = 'login';
  let selectedAvatar = AVATARS[0];
  let error = '';

  function render() {
    root.innerHTML = '';
    const card = el('div', { className: `auth-card${mode === 'register' ? '' : ''}` });

    card.appendChild(el('div', { className: 'auth-mark' }, '◈'));
    card.appendChild(el('h1', {}, 'GLOBAL EMPIRE'));
    card.appendChild(el('p', { className: 'auth-sub' }, 'Build the world\'s greatest business dynasty.'));

    const tabs = el('div', { className: 'auth-tabs' });
    for (const m of ['login', 'register', 'forgot']) {
      tabs.appendChild(el('button', {
        className: `auth-tab${mode === m ? ' active' : ''}`,
        onClick: () => { mode = m; error = ''; render(); },
      }, m === 'forgot' ? 'Reset' : m.charAt(0).toUpperCase() + m.slice(1)));
    }
    card.appendChild(tabs);

    if (error) card.appendChild(el('div', { className: 'auth-error' }, error));

    const form = el('form', {
      onSubmit: async (e) => {
        e.preventDefault();
        error = '';
        const fd = new FormData(form);
        const username = fd.get('username')?.toString().trim();
        const password = fd.get('password')?.toString();
        try {
          if (mode === 'login') {
            const user = await AuthManager.login(username, password);
            onSuccess(user);
          } else if (mode === 'register') {
            const user = await AuthManager.register(username, password, selectedAvatar);
            await AuthManager.login(username, password);
            onSuccess(user);
          } else {
            const newPass = fd.get('newpassword')?.toString();
            await AuthManager.resetPassword(username, newPass);
            error = '';
            mode = 'login';
            render();
            return;
          }
        } catch (err) {
          error = err.message;
          render();
        }
      },
    });

    form.appendChild(field('Username', 'username', 'text', 'Enter username'));
    if (mode !== 'forgot') {
      form.appendChild(field('Password', 'password', 'password', 'Enter password'));
    } else {
      form.appendChild(field('New Password', 'newpassword', 'password', 'Enter new password'));
      form.appendChild(el('p', { className: 'auth-note' }, 'Offline reset — no email verification required.'));
    }

    if (mode === 'register') {
      const avatarGrid = el('div', { className: 'profile-grid' });
      for (const av of AVATARS.slice(0, 8)) {
        avatarGrid.appendChild(el('button', {
          type: 'button',
          className: `avatar-option${selectedAvatar === av ? ' selected' : ''}`,
          onClick: () => { selectedAvatar = av; render(); },
        }, av));
      }
      form.appendChild(avatarGrid);
    }

    form.appendChild(el('button', { type: 'submit', className: 'btn-primary' },
      mode === 'login' ? 'Enter Dashboard' : mode === 'register' ? 'Create Account' : 'Reset Password'
    ));

    card.appendChild(form);
    card.appendChild(el('p', { className: 'auth-note' }, 'Progress saves locally in your browser. Works offline after first load.'));

    root.appendChild(el('div', { className: 'auth-screen' }, card));
  }

  function field(label, name, type, placeholder) {
    const wrap = el('div', { className: 'auth-field' });
    wrap.appendChild(el('label', {}, label));
    wrap.appendChild(el('input', { name, type, placeholder, required: 'true', autocomplete: type === 'password' ? 'current-password' : 'username' }));
    return wrap;
  }

  render();
}

export function renderProfileSelect(user, onSelect, onLogout) {
  const root = document.getElementById('app');
  root.innerHTML = '';

  const card = el('div', { className: 'auth-card wide' });
  card.appendChild(el('div', { className: 'auth-mark' }, user.avatar));
  card.appendChild(el('h1', {}, `Welcome, ${escapeHtml(user.displayName)}`));
  card.appendChild(el('p', { className: 'auth-sub' }, 'Select a save slot to continue or start a new empire.'));

  const slots = el('div', { className: 'profile-list' });
  card.appendChild(slots);

  card.appendChild(el('button', { className: 'btn-ghost', onClick: onLogout }, 'Sign Out'));

  root.appendChild(el('div', { className: 'auth-screen' }, card));
  return { card, slotsEl: slots };
}
