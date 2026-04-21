import { useState } from 'react';

export default function RedeemModal({ onClose, onRedeemed }) {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState(null); // null, loading, success, error
  const [result, setResult] = useState(null);

  const handleRedeem = async () => {
    if (!code.trim()) return;
    
    setStatus('loading');
    try {
      const res = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase() })
      });
      const data = await res.json();
      
      if (data.ok) {
        setStatus('success');
        setResult({ success: true, message: `🎉 ${data.label} resgatado!` });
        onRedeemed?.({ success: true, message: `+${data.label}` });
        setTimeout(onClose, 2000);
      } else {
        setStatus('error');
        setResult({ success: false, message: data.error || 'Código inválido' });
      }
    } catch {
      setStatus('error');
      setResult({ success: false, message: 'Erro de conexão' });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box redeem-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="redeem-header">
          <span className="redeem-icon">🎁</span>
          <h2>Resgatar Código</h2>
          <p>Insira seu código promocional para ganhar benefícios</p>
        </div>

        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="EX: PROMO2026"
          className="redeem-input"
          maxLength={20}
          disabled={status === 'loading' || status === 'success'}
          autoFocus
        />

        <button
          onClick={handleRedeem}
          disabled={!code || status === 'loading' || status === 'success'}
          className="btn btn-red redeem-btn"
        >
          {status === 'loading' ? '⏳ Verificando...' : 
           status === 'success' ? '✅ Resgatado!' : '🎉 Resgatar Código'}
        </button>

        {result && (
          <div className={`redeem-result ${result.success ? 'success' : 'error'}`}>
            {result.message}
          </div>
        )}

        <p className="redeem-hint">
          💡 Dica: Códigos promocionais são case-insensitive
        </p>
      </div>
    </div>
  );
}
