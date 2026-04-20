import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { getCurrentProfile, clearSession, getSession, getCurrentUser, isPlanActive, planExpiry } from '../lib/auth';

function formatExpiry(date) {
  if (!date) return null;
  const diff = date - new Date();
  if (diff <= 0) return null;
  const hours = Math.floor(diff / 3600000);
  if (hours < 48) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function Navbar({ onSearchOpen }) {
  const router = useRouter();
  const [solid, setSolid] = useState(false);
  const [profile, setProfile] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [planInfo, setPlanInfo] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const p = getCurrentProfile();
    setProfile(p);
    const u = getCurrentUser();
    if (u) {
      const active = isPlanActive(u);
      const expiry = planExpiry(u);
      setPlanInfo({ active, expiryStr: formatExpiry(expiry) });
    }

    const onScroll = () => setSolid(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);

    const onClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, []);

  const handleLogout = () => {
    clearSession();
    router.replace('/login');
  };

  const initials = profile?.name?.charAt(0)?.toUpperCase() || '?';
  const icon = profile?.icon;

  return (
    <nav className={`navbar${solid ? ' solid' : ''}`}>
      <span className="nav-logo" onClick={() => router.push('/')}>RHFLIX</span>

      <div className="nav-right">
        {/* Plan badge — only shown when expiring soon */}
        {planInfo?.active && planInfo.expiryStr && (
          <span
            className="nav-plan-badge"
            onClick={() => router.push('/profiles')}
            title="Renovar assinatura"
          >
            {planInfo.expiryStr}
          </span>
        )}

        {/* Search */}
        <button className="nav-icon-btn" onClick={onSearchOpen} aria-label="Buscar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </button>

        {/* Profile avatar + dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <div
            className="nav-avatar"
            style={{ background: profile?.color || '#E50914' }}
            onClick={() => setShowDropdown(d => !d)}
            title={profile?.name}
          >
            {icon
              ? <span style={{ fontSize: '1rem' }}>{icon}</span>
              : initials
            }
          </div>

          {showDropdown && (
            <div className="profile-dropdown">
              {/* Current profile */}
              <div className="profile-dropdown-item">
                <div className="mini-avatar" style={{ background: profile?.color || '#E50914' }}>
                  {icon
                    ? <span style={{ fontSize: '.85rem' }}>{icon}</span>
                    : initials
                  }
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '.88rem' }}>{profile?.name || 'Perfil'}</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: 2 }}>Perfil atual</div>
                </div>
              </div>

              <div className="profile-dropdown-divider" />

              <div
                className="profile-dropdown-action"
                onClick={() => { setShowDropdown(false); router.push('/profiles'); }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                </svg>
                Trocar Perfil
              </div>

              <div
                className="profile-dropdown-action"
                onClick={() => { setShowDropdown(false); router.push('/profiles?manage=1'); }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
                </svg>
                Gerenciar Perfis
              </div>

              <div className="profile-dropdown-divider" />

              <div className="profile-dropdown-action danger" onClick={handleLogout}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                </svg>
                Sair da conta
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
