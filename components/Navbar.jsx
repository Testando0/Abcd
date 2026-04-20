import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Navbar({ userId, profiles, activeProfile, onLogout }) {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);

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
    // Abre modal/prompt direto na navbar - SEM página separada
    const code = prompt('🔑 Digite seu código de renovação:');
    if (!code) return;
    
    // Lógica simples de renovação (ajuste conforme seu backend)
    try {
      const STORAGE_SUB = 'rhflix_subscription';
      const data = JSON.parse(localStorage.getItem(STORAGE_SUB) || '{}');
      const current = data[userId] || { expiresAt: null, totalHours: 0 };
      
      // Códigos de exemplo (em produção, valide no backend)
      const CODES = {
        'VIP30': 30, 'VIP90': 90, 'TESTE': 24
      };
      
      const hours = CODES[code.toUpperCase()];
      if (!hours) {
        alert('❌ Código inválido');
        return;
      }
      
      const now = Date.now();
      const baseTime = current.expiresAt > now ? current.expiresAt : now;
      const newExpires = baseTime + (hours * 60 * 60 * 1000);
      
      data[userId] = {
        ...current,
        totalHours: current.totalHours + hours,
        expiresAt: newExpires
      };      localStorage.setItem(STORAGE_SUB, JSON.stringify(data));
      
      alert(`✅ +${hours}h adicionadas!`);
      window.location.reload(); // Atualiza badge de assinatura
    } catch (err) {
      alert('Erro ao aplicar código');
      console.error(err);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-logo" onClick={() => router.push('/')}>
        RHFLIX
      </div>

      <div className="nav-right" ref={menuRef}>
        {/* Badge de assinatura */}
        {userId && (
          <span className="nav-plan-badge" onClick={handleRenew} title="Clique para renovar">
            ⭐ Plano Ativo
          </span>
        )}

        {/* Botão de perfil */}
        <button 
          className="nav-avatar"
          style={{ background: activeProfile?.color || '#333' }}
          onClick={() => setShowProfileMenu(!showProfileMenu)}
        >
          {activeProfile?.icon || '👤'}
        </button>

        {/* Dropdown de perfil */}
        {showProfileMenu && (
          <div className="profile-dropdown">
            {profiles?.map(profile => (
              <div 
                key={profile.id}
                className="profile-item"
                onClick={() => {
                  // Troca perfil e volta pra home
                  localStorage.setItem('rhflix_active_profile', JSON.stringify({ 
                    userId, 
                    profileId: profile.id 
                  }));
                  setShowProfileMenu(false);
                  router.push('/');
                }}
              >                <span className="profile-avatar-sm" style={{ background: profile.color }}>
                  {profile.icon}
                </span>
                <span>{profile.name}</span>
                {activeProfile?.id === profile.id && <span className="profile-current">✓</span>}
              </div>
            ))}
            
            <div className="dropdown-divider" />
            
            {/* ATALHO RENOVAR - direto aqui, sem página separada */}
            <button className="dropdown-action renew-action" onClick={handleRenew}>
              🔑 Renovar assinatura
            </button>
            
            <button className="dropdown-action" onClick={() => {
              setShowProfileMenu(false);
              router.push('/profiles');
            }}>
              ⚙️ Gerenciar perfis
            </button>
            
            <button className="dropdown-action danger" onClick={() => {
              localStorage.removeItem('rhflix_active_profile');
              onLogout?.();
              router.push('/login');
            }}>
              🚪 Sair da conta
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 64px;
          padding: 0 24px;
          display: flex;
          align-items: center;
          background: linear-gradient(to bottom, rgba(0,0,0,0.9), transparent);
          z-index: 1000;
          transition: background 0.3s;
        }
        .navbar.scrolled {
          background: rgba(0,0,0,0.95);
        }        .nav-logo {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.8rem;
          color: #e50914;
          cursor: pointer;
          letter-spacing: 2px;
        }
        .nav-right {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
        }
        .nav-plan-badge {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 3px;
          background: rgba(74,222,128,0.15);
          color: #4ade80;
          border: 1px solid rgba(74,222,128,0.3);
          cursor: pointer;
          transition: background 0.2s;
        }
        .nav-plan-badge:hover {
          background: rgba(74,222,128,0.25);
        }
        .nav-avatar {
          width: 32px;
          height: 32px;
          border-radius: 4px;
          border: 2px solid transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .nav-avatar:hover {
          border-color: rgba(255,255,255,0.6);
        }
        .profile-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: #1a1a1a;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;          min-width: 200px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.6);
          overflow: hidden;
          animation: dropdownIn 0.15s ease;
        }
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: none; }
        }
        .profile-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .profile-item:hover {
          background: rgba(255,255,255,0.08);
        }
        .profile-avatar-sm {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          flex-shrink: 0;
        }
        .profile-current {
          margin-left: auto;
          color: #4ade80;
          font-weight: 600;
        }
        .dropdown-divider {
          height: 1px;
          background: rgba(255,255,255,0.1);
          margin: 4px 0;
        }
        .dropdown-action {
          width: 100%;
          text-align: left;
          padding: 12px 16px;
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.85);
          font-size: 0.9rem;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;        }
        .dropdown-action:hover {
          background: rgba(255,255,255,0.08);
          color: #fff;
        }
        .dropdown-action.renew-action {
          color: #4ade80;
          font-weight: 500;
        }
        .dropdown-action.danger {
          color: #f87171;
        }
        .dropdown-action.danger:hover {
          background: rgba(248,113,113,0.1);
        }

        @media (max-width: 768px) {
          .navbar { padding: 0 16px; }
          .nav-logo { font-size: 1.5rem; }
          .nav-avatar { width: 28px; height: 28px; font-size: 0.9rem; }
          .profile-dropdown { right: -12px; }
        }
      `}</style>
    </nav>
  );
      }
