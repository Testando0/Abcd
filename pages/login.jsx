import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  hashPassword, getUsers, saveUsers, setSession,
  updateUser, uid, isPlanActive, getSession,
} from '../lib/auth';

export default function Login() {
  const router = useRouter();
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regCode, setRegCode] = useState('');
  const [codeInfo, setCodeInfo] = useState(null);
  const [codeChecking, setCodeChecking] = useState(false);

  // Recharge form (after login redirect)
  const { recharge } = router.query;

  useEffect(() => {
    const s = getSession();
    if (s) router.replace('/profiles');
  }, []);

  // ── Code validation ──────────────────────────────────────────
  const checkCode = async (code) => {
    if (!code || code.length < 3) { setCodeInfo(null); return; }
    setCodeChecking(true);
    try {
      const r = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const d = await r.json();
      if (d.ok) setCodeInfo(d);
      else setCodeInfo(null);
    } catch { setCodeInfo(null); }
    setCodeChecking(false);
  };

  // ── LOGIN ────────────────────────────────────────────────────
  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    if (!loginEmail || !loginPass) { setError('Preencha todos os campos.'); return; }
    setLoading(true);
    const users = getUsers();
    const user = users.find(
      u => u.email.toLowerCase() === loginEmail.toLowerCase() &&
           u.passwordHash === hashPassword(loginPass)
    );
    if (!user) { setError('E-mail ou senha incorretos.'); setLoading(false); return; }
    setSession(user);
    router.replace('/profiles');
  };

  // ── REGISTER ─────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!regName || !regEmail || !regPass) { setError('Preencha todos os campos.'); return; }
    if (regPass.length < 6) { setError('Senha mínima: 6 caracteres.'); return; }
    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === regEmail.toLowerCase())) {
      setError('Este e-mail já está cadastrado.'); return;
    }

    setLoading(true);

    // Validate code if provided
    let planData = null;
    if (regCode.trim()) {
      const r = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: regCode }),
      });
      const d = await r.json();
      if (!d.ok) { setError('Código de recarga inválido.'); setLoading(false); return; }

      // Check usage
      const usages = JSON.parse(localStorage.getItem('rhflix_code_uses') || '{}');
      const used = usages[regCode.trim().toUpperCase()] || 0;
      if (used >= d.maxUses) { setError('Este código já atingiu o limite de usos.'); setLoading(false); return; }
      usages[regCode.trim().toUpperCase()] = used + 1;
      localStorage.setItem('rhflix_code_uses', JSON.stringify(usages));

      const expiresAt = new Date(Date.now() + d.hours * 3600000).toISOString();
      planData = { label: d.label, hours: d.hours, expiresAt, code: regCode.trim().toUpperCase() };
    }

    const newUser = {
      id: uid(),
      name: regName.trim(),
      email: regEmail.toLowerCase().trim(),
      passwordHash: hashPassword(regPass),
      profiles: [
        { id: uid(), name: regName.trim(), color: '#E50914', emoji: '' },
      ],
      plan: planData,
      createdAt: new Date().toISOString(),
    };
    updateUser(newUser);
    setSession(newUser);
    router.replace('/profiles');
  };

  return (
    <>
      <Head>
        <title>RHFLIX — Entrar</title>
      </Head>
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">RHFLIX</div>

          <div className="auth-tabs">
            <button className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => { setTab('login'); setError(''); setSuccess(''); }}>
              Entrar
            </button>
            <button className={`auth-tab${tab === 'register' ? ' active' : ''}`} onClick={() => { setTab('register'); setError(''); setSuccess(''); }}>
              Criar conta
            </button>
          </div>

          {error && <div className="form-error">{error}</div>}
          {success && <div className="form-success">{success}</div>}

          {tab === 'login' ? (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">E-mail</label>
                <input className="form-input" type="email" placeholder="seu@email.com"
                  value={loginEmail} onChange={e => setLoginEmail(e.target.value)} autoComplete="email" />
              </div>
              <div className="form-group">
                <label className="form-label">Senha</label>
                <input className="form-input" type="password" placeholder="••••••••"
                  value={loginPass} onChange={e => setLoginPass(e.target.value)} autoComplete="current-password" />
              </div>
              <button className="form-btn" type="submit" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label className="form-label">Nome</label>
                <input className="form-input" type="text" placeholder="Seu nome"
                  value={regName} onChange={e => setRegName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">E-mail</label>
                <input className="form-input" type="email" placeholder="seu@email.com"
                  value={regEmail} onChange={e => setRegEmail(e.target.value)} autoComplete="email" />
              </div>
              <div className="form-group">
                <label className="form-label">Senha</label>
                <input className="form-input" type="password" placeholder="Mínimo 6 caracteres"
                  value={regPass} onChange={e => setRegPass(e.target.value)} autoComplete="new-password" />
              </div>

              <div className="form-divider">código de acesso</div>

              <div className="form-group">
                <label className="form-label">Código de Recarga <span style={{color:'var(--muted)',fontWeight:400,textTransform:'none'}}>(opcional)</span></label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Ex: REDZIN"
                  value={regCode}
                  onChange={e => {
                    setRegCode(e.target.value);
                    checkCode(e.target.value);
                  }}
                  style={{ textTransform: 'uppercase', letterSpacing: '1px' }}
                />
                {codeChecking && <div className="form-hint">Verificando código...</div>}
                {codeInfo && !codeChecking && (
                  <div className="form-hint" style={{ color: '#27c230' }}>
                    ✓ Código válido — {codeInfo.label} de acesso desbloqueados
                  </div>
                )}
              </div>

              {!codeInfo && !regCode && (
                <div className="code-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
                  </svg>
                  Sem código: conta criada, mas sem acesso ao conteúdo.
                </div>
              )}

              <button className="form-btn" type="submit" disabled={loading}>
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
