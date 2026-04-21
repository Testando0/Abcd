import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getCurrentUser, getCurrentProfile } from '../lib/auth';

export default function Navbar({ onSearch }) {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);

  const user = getCurrentUser();
  const activeProfile = getCurrentProfile();

  // Fecha menu ao clicar fora
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleRenew = () => {
    const code = prompt('Digite seu código de renovação:');
    if (!code) return;

    try {
      const STORAGE_SUB = 'rhflix_subscription';
      const data = JSON.parse(localStorage.getItem(STORAGE_SUB) || '{}');
      const userId = user?.id || 'default';
      const current = data[userId] || { expiresAt: null, totalHours: 0 };

      const CODES = { 'VIP30': 30, 'VIP90': 90, 'TESTE': 24 };
      const hours = CODES[code.toUpperCase()];

      if (!hours) {
        alert('Código inválido');
        return;
      }

      const now = Date.now();
      const baseTime = current.expiresAt > now ? current.expiresAt : now;
      const newExpires = baseTime + hours * 60 * 60 * 1000;

      data[userId] = {
        ...current,
        totalHours: current.totalHours + hours,
        expiresAt: newExpires,
      };

      localStorage.setItem(STORAGE_SUB, JSON.stringify(data));
      alert(`+${hours}h adicionadas!`);
      window.location.reload();
    } catch (err) {
      alert('Erro ao aplicar código');
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('rhflix_active_profile');
    router.push('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <a href="/" onClick={(e) => { e.preventDefault(); router.push('/'); }} className="logo">
          RHFLIX
        </a>
      </div>

      <div className="navbar-center">
        <button onClick={onSearch} className="search-btn">
          🔎 Buscar
        </button>
      </div>

      <div className="navbar-right">
        {user && <div className="plan-badge">⭐ Plano Ativo</div>}

        <div
          className="profile-button"
          ref={menuRef}
          onClick={() => setShowProfileMenu(!showProfileMenu)}
        >
          {activeProfile?.icon || '👤'}
        </div>

        {showProfileMenu && (
          <div className="profile-dropdown">
            {activeProfile && (
              <div className="profile-item active">
                {activeProfile.icon} {activeProfile.name}
              </div>
            )}
            <div onClick={() => { setShowProfileMenu(false); handleRenew(); }} className="dropdown-item">
              🔑 Renovar assinatura
            </div>
            <div onClick={() => { setShowProfileMenu(false); router.push('/profiles'); }} className="dropdown-item">
              ⚙️ Gerenciar perfis
            </div>
            <div onClick={() => { setShowProfileMenu(false); handleLogout(); }} className="dropdown-item">
              🚪 Sair da conta
            </div>
          </div>
        )}
      </div>
    </nav>
  );
          }
