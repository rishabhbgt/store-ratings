import { useState } from 'react';
import { session } from './api.js';
import Auth from './Auth.jsx';
import Admin from './Admin.jsx';
import Stores from './Stores.jsx';
import Owner from './Owner.jsx';
import { PasswordForm } from './components.jsx';

const ROLE = { ADMIN: 'Administrator', USER: 'Customer', OWNER: 'Store owner' };
const TITLE = { USER: 'Find and rate stores', OWNER: 'Your store' };

const NAV = {
  ADMIN: [['Dashboard', 'grid'], ['Users', 'users'], ['Stores', 'store'], ['Add user', 'userplus'], ['Add store', 'plus']],
  USER: [['Stores', 'store']],
  OWNER: [['Dashboard', 'chart']],
};

const ICONS = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.4c2 .7 3.5 2.6 3.5 5.6" /></>,
  store: <><path d="M3 9l1.5-5h15L21 9" /><path d="M4 9v11h16V9" /><path d="M9 20v-6h6v6" /></>,
  userplus: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" /><path d="M19 8v6M16 11h6" /></>,
  plus: <><rect x="3" y="3" width="18" height="18" rx="4" /><path d="M12 8v8M8 12h8" /></>,
  chart: <><path d="M4 20V11M10 20V4M16 20v-6M22 20H2" /></>,
  key: <><circle cx="8" cy="15" r="4" /><path d="M11 12l9-9M16 7l3 3" /></>,
  logout: <><path d="M10 4H5v16h5" /><path d="M15 8l4 4-4 4M19 12H9" /></>,
};

const Icon = ({ name }) => <svg viewBox="0 0 24 24" aria-hidden="true">{ICONS[name]}</svg>;

export default function App() {
  const [s, setS] = useState(session.get());
  const [showPw, setShowPw] = useState(false);
  const [tab, setTab] = useState('Dashboard'); 
  if (!s) return <Auth onLogin={setS} />;

  const { role, name } = s.user;
  const View = { ADMIN: Admin, USER: Stores, OWNER: Owner }[role];
  const title = !showPw && role === 'ADMIN' && tab !== 'Add user' && tab !== 'Add store'
  ? tab
  : '';

  return (
    <div className="shell">
      <aside className="side">
        <div className="brand">
          <span className="brand-mark">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" /></svg>
          </span>
          Store Ratings
        </div>

        <div className="me">
          <div className="avatar">{name[0]}</div>
          <div>
            <strong>{name}</strong>
            <span className={`badge ${role}`}>{ROLE[role]}</span>
          </div>
        </div>

        <div className="side-label">Menu</div>
        <nav className="side-nav">
          {NAV[role].map(([label, icon]) => (
            <button
              key={label}
              className={'ghost nav-item' + (!showPw && (role !== 'ADMIN' || tab === label) ? ' on' : '')}
              onClick={() => { if (role === 'ADMIN') setTab(label); setShowPw(false); }}
            >
              <Icon name={icon} /> {label}
            </button>
          ))}
        </nav>

        <div className="side-actions">
          <button className={'ghost nav-item' + (showPw ? ' on' : '')} onClick={() => setShowPw(!showPw)}>
            <Icon name="key" /> Change password
          </button>
          <button className="ghost nav-item danger"onClick={() => { session.clear(); setShowPw(false); setS(null); }}>
            <Icon name="logout" /> Log out
          </button>
        </div>
      </aside>

      <main className={'main' + (showPw ? ' password-main' : '')}>
          {title && <h1>{title}</h1>}

          {showPw ? (
              <section className="password-section">
                  <div className="admin-form-head">
                      <h2>Change Password</h2>
                      <p>Update your account password securely.</p>
                  </div>

                  <div className="admin-form-card password-card">
                      <button className="link password-back" onClick={() => setShowPw(false)}>← Back</button>
                      <PasswordForm />
                  </div>
              </section>
          ) : (
              <View tab={tab} setTab={setTab} />
          )}
      </main>
    </div>
  );
}