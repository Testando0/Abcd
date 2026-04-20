import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { getCurrentProfile, clearSession, getSession, getCurrentUser } from '../lib/auth';

export default function Navbar({ onSearchOpen }) {
  const router = useRouter();
  const [solid, setSolid] = useState(false);
  const [profile, setProfile] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const p = getCurrentProfile();
    setProfile(p);

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
    router.push('/login');
  };

  const initials = profile?.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <nav className={`navbar${solid ? ' solid' : ''}`}>
      <span className="nav-logo" onClick={() => router.push('/')}>RHFLIX</span>

      <div className="nav-right">
        {/* Search icon */}
        <button className="nav-icon-btn" onClick={onSearchOpen} aria-label="Buscar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </button>

        {/* Profile icon */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <div
            className="nav-avatar"
            style={{ background: profile?.color || '#E50914' }}
            onClick={() => setShowDropdown(d => !d)}
            title={profile?.name}
          >
            {initials}
          </div>

          {showDropdown && (
            <div className="profile-dropdown">
              <div
                className="profile-dropdown-item"
                onClick={() => { setShowDropdown(false); router.push('/profiles'); }}
              >
                <div className="mini-avatar" style={{ background: profile?.color || '#E50914' }}>
                  {initials}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '.88rem' }}>{profile?.name || 'Perfil'}</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: 2 }}>Trocar perfil</div>
                </div>
              </div>

              <div className="profile-dropdown-divider" />

              <div
                className="profile-dropdown-action"
                onClick={() => { setShowDropdown(false); router.push('/profiles?manage=1'); }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                Gerenciar Perfis
              </div>

              <div className="profile-dropdown-action" onClick={handleLogout}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                </svg>
                Sair
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
