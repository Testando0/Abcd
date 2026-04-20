// pages/redeem.js
import { useState } from 'react';
import { useRouter } from 'next/router';

const CODES_DB = [
  { code: "REDZIN", hours: 24, maxUses: 3, used: 0 },
  { code: "RHFLIX2026", hours: 168, maxUses: 10, used: 0 },
  { code: "VIPPASS", hours: 720, maxUses: 5, used: 0 },
  { code: "STARTER", hours: 72, maxUses: 20, used: 0 },
  { code: "PREMIUM", hours: 360, maxUses: 5, used: 0 },
  { code: "BETA", hours: 48, maxUses: 50, used: 0 }
];

const STORAGE_SUB = 'rhflix_subscription';

export default function RedeemPage({ userId, onBack }) {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const getSubscription = () => {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_SUB) || '{}');
      return data[userId] || { expiresAt: null, totalHours: 0 };
    } catch {
      return { expiresAt: null, totalHours: 0 };
    }
  };

  const saveSubscription = (sub) => {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_SUB) || '{}');
      data[userId] = sub;
      localStorage.setItem(STORAGE_SUB, JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  };

  const handleRedeem = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setMessage(null);

    const upperCode = code.trim().toUpperCase();
    const codeConfig = { ...CODES_DB.find(c => c.code === upperCode) };

    if (!codeConfig) {      setMessage({ type: 'error', text: 'Código inválido ou expirado' });
      setLoading(false);
      return;
    }

    if (codeConfig.used >= codeConfig.maxUses) {
      setMessage({ type: 'error', text: 'Este código atingiu o limite de usos' });
      setLoading(false);
      return;
    }

    const current = getSubscription();
    const now = Date.now();
    
    // Se já expirou, começa do zero; senão, soma ao tempo restante
    const baseTime = current.expiresAt && current.expiresAt > now 
      ? current.expiresAt 
      : now;
    
    const newExpires = baseTime + (codeConfig.hours * 60 * 60 * 1000);
    
    const updated = {
      totalHours: (current.totalHours || 0) + codeConfig.hours,
      expiresAt: newExpires,
      lastRedeemed: new Date().toISOString(),
      redeemedCodes: [...(current.redeemedCodes || []), upperCode]
    };

    if (saveSubscription(updated)) {
      codeConfig.used++;
      
      setMessage({ 
        type: 'success', 
        text: `✅ ${codeConfig.hours}h adicionadas! Válido até ${new Date(newExpires).toLocaleDateString('pt-BR')}` 
      });
      setCode('');
      
      setTimeout(() => {
        if (onBack) onBack();
        else router.push('/');
      }, 2000);
    } else {
      setMessage({ type: 'error', text: 'Erro ao aplicar código. Tente novamente.' });
    }
    
    setLoading(false);
  };

  const sub = getSubscription();
  const now = Date.now();  const isExpired = sub.expiresAt && sub.expiresAt < now;
  const daysLeft = sub.expiresAt ? Math.max(0, Math.floor((sub.expiresAt - now) / (1000*60*60*24))) : 0;

  return (
    <div className="auth-page">
      <button className="profiles-back-btn" onClick={onBack || (() => router.back())}>
        ← Voltar
      </button>
      
      <div className="auth-card" style={{ maxWidth: '480px' }}>
        <h2 className="auth-logo">RHFLIX</h2>
        
        <div className="code-badge" style={{ marginBottom: '24px', justifyContent: 'center' }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
          </svg>
          {isExpired 
            ? '❌ Assinatura expirada' 
            : `✅ Ativo • ${daysLeft} dia${daysLeft !== 1 ? 's' : ''} restante${daysLeft !== 1 ? 's' : ''}`
          }
        </div>

        <h3 style={{ textAlign: 'center', marginBottom: '24px' }}>
          Renovar Assinatura
        </h3>

        <div className="form-group">
          <label className="form-label">Código de Renovação</label>
          <input
            type="text"
            className="form-input recharge-input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Ex: VIPPASS"
            maxLength={20}
            style={{ textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center' }}
            onKeyPress={(e) => e.key === 'Enter' && handleRedeem()}
          />
          <p className="form-hint" style={{ textAlign: 'center', marginTop: '8px' }}>
            Insira o código recebido para adicionar tempo à sua conta
          </p>
        </div>

        {message && (
          <div className={`form-${message.type} recharge-msg ${message.type === 'success' ? 'ok' : 'err'}`}>
            {message.text}
          </div>
        )}

        <button           className="form-btn" 
          onClick={handleRedeem}
          disabled={loading || !code.trim()}
          style={{ marginTop: '8px' }}
        >
          {loading ? 'Aplicando...' : 'Aplicar Código'}
        </button>

        <div style={{ 
          marginTop: '24px', 
          padding: '16px', 
          background: 'var(--s3)', 
          borderRadius: 'var(--radius)',
          fontSize: '0.85rem',
          color: 'var(--muted)'
        }}>
          <strong>Como funciona:</strong>
          <ul style={{ margin: '8px 0 0 16px', lineHeight: 1.6 }}>
            <li>Códigos válidos somam tempo à sua assinatura atual</li>
            <li>Se expirada, o tempo começa a contar da aplicação</li>
            <li>Cada código tem limite de usos globais</li>
            <li>Códigos expiram após uso ou data limite</li>
          </ul>
        </div>
      </div>
    </div>
  );
        }
