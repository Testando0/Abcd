import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getSession, getCurrentUser, updateUser, isPlanActive, planExpiry, AVATAR_COLORS } from '../../lib/auth';
import RedeemModal from '../../components/RedeemModal';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [showRecharge, setShowRecharge] = useState(false);
  const [showRedeem, setShowRedeem] = useState(false);
  const [rechargeCode, setRechargeCode] = useState('');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const session = getSession();
    if (!session) { router.replace('/login'); return; }
    
    const currentUser = getCurrentUser();
    if (!currentUser) { router.replace('/login'); return; }
    
    setUser(currentUser);
  }, [router]);

  const handleRecharge = async () => {
    if (!rechargeCode.trim()) {
      setMessage({ type: 'error', text: 'Digite um código' });
      return;
    }

    try {
      const res = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: rechargeCode.trim().toUpperCase() })
      });
      const data = await res.json();

      if (data.ok) {
        // Atualiza plano do usuário
        const updated = {
          ...user,
          plan: {
            ...user.plan,
            expiresAt: new Date(Date.now() + data.hours * 60 * 60 * 1000).toISOString()
          }
        };
        updateUser(updated);
        setUser(updated);
        setMessage({ type: 'success', text: `✅ ${data.label} adicionado!` });
        setRechargeCode('');        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Código inválido' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro de conexão' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('rhflix_session');
    sessionStorage.removeItem('rhflix_profile');
    router.replace('/login');
  };

  if (!user) return <div className="loading-spinner" />;

  const active = isPlanActive(user);
  const expiry = planExpiry(user);

  return (
    <div className="profile-page">
      {/* Header */}
      <header className="profile-header">
        <button className="back-btn" onClick={() => router.back()}>← Voltar</button>
        <h1>Meu Perfil</h1>
        <div className="profile-avatar" style={{ backgroundColor: AVATAR_COLORS[user.avatarColorIndex || 0] }}>
          {user.name?.[0]?.toUpperCase() || 'U'}
        </div>
      </header>

      {/* Informações do usuário */}
      <section className="profile-info">
        <h2>{user.name || 'Usuário'}</h2>
        <p className="email">{user.email}</p>
        
        {/* Status do plano */}
        <div className={`plan-badge ${active ? 'active' : 'expired'}`}>
          {active ? '✅ Plano Ativo' : '❌ Plano Expirado'}
        </div>
        {expiry && (
          <p className="expiry-date">
            Vence em: {expiry.toLocaleDateString('pt-BR')}
          </p>
        )}
      </section>

      {/* Painel de Recarga */}
      <section className="recharge-section">
        <h3>💰 Recarregar Acesso</h3>        <div className="recharge-input-group">
          <input
            type="text"
            value={rechargeCode}
            onChange={(e) => setRechargeCode(e.target.value)}
            placeholder="Digite seu código"
            className="recharge-input"
            maxLength={20}
          />
          <button onClick={handleRecharge} className="btn btn-red">
            Resgatar
          </button>
        </div>
        {message && (
          <p className={`recharge-msg ${message.type}`}>{message.text}</p>
        )}
      </section>

      {/* Menu de Ações */}
      <section className="profile-actions">
        <button className="action-btn" onClick={() => setShowRedeem(true)}>
          🎁 Resgatar Código Promocional
        </button>
        <button className="action-btn" onClick={() => router.push('/profile/settings')}>
          ⚙️ Configurações
        </button>
        <button className="action-btn danger" onClick={handleLogout}>
          🚪 Sair da Conta
        </button>
      </section>

      {/* Modal de Resgatar Código */}
      {showRedeem && (
        <RedeemModal 
          onClose={() => setShowRedeem(false)}
          onRedeemed={(result) => {
            if (result.success) {
              setMessage({ type: 'success', text: result.message });
              // Recarrega usuário
              setUser(getCurrentUser());
            }
          }}
        />
      )}
    </div>
  );
}
