import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  getCurrentUser, updateUser, uid,
  setCurrentProfile, clearSession, getSession,
  AVATAR_COLORS, isPlanActive, planExpiry,
} from '../lib/auth';

const MAX_PROFILES = 6;

function formatExpiry(date) {
  if (!date) return null;
  const diff = date - new Date();
  if (diff <= 0) return 'Expirado';
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours}h restantes`;
  const days = Math.floor(hours / 24);
  return `${days} dia${days !== 1 ? 's' : ''} restante${days !== 1 ? 's' : ''}`;
}

export default function Profiles() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [manage, setManage] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editProfile, setEditProfile] = useState(null);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(AVATAR_COLORS[0]);
  const [rechargeInput, setRechargeInput] = useState('');
  const [rechargeMsg, setRechargeMsg] = useState({ text: '', ok: false });
  const [recharging, setRecharging] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) { router.replace('/login'); return; }
    const u = getCurrentUser();
    if (!u) { clearSession(); router.replace('/login'); return; }
    setUser(u);
    const { manage: m } = router.query;
    if (m) setManage(true);
  }, []);

  const selectProfile = (profile) => {
    if (manage) return;
    const user = getCurrentUser();
    if (!isPlanActive(user) && user?.plan !== undefined) {
      // Allow selection but home will show paywall
    }
    setCurrentProfile(profile);
    router.push('/');
  };

  const openAdd = () => {
    setEditProfile(null);
    setNewName('');
    setNewColor(AVATAR_COLORS[0]);
    setShowModal(true);
  };

  const openEdit = (p, e) => {
    e.stopPropagation();
    setEditProfile(p);
    setNewName(p.name);
    setNewColor(p.color);
    setShowModal(true);
  };

  const saveProfile = () => {
    if (!newName.trim()) return;
    const u = getCurrentUser();
    let profiles = [...(u.profiles || [])];
    if (editProfile) {
      profiles = profiles.map(p => p.id === editProfile.id ? { ...p, name: newName.trim(), color: newColor } : p);
    } else {
      if (profiles.length >= MAX_PROFILES) return;
      profiles.push({ id: uid(), name: newName.trim(), color: newColor });
    }
    const updated = { ...u, profiles };
    updateUser(updated);
    setUser(updated);
    setShowModal(false);
  };

  const deleteProfile = (pid, e) => {
    e.stopPropagation();
    const u = getCurrentUser();
    if (u.profiles.length <= 1) return;
    const profiles = u.profiles.filter(p => p.id !== pid);
    const updated = { ...u, profiles };
    updateUser(updated);
    setUser(updated);
  };

  const handleRedeem = async () => {
    if (!rechargeInput.trim()) return;
    setRecharging(true);
    setRechargeMsg({ text: '', ok: false });
    try {
      const r = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: rechargeInput }),
      });
      const d = await r.json();
      if (!d.ok) { setRechargeMsg({ text: d.error || 'Código inválido.', ok: false }); setRecharging(false); return; }

      const usages = JSON.parse(localStorage.getItem('rhflix_code_uses') || '{}');
      const used = usages[rechargeInput.trim().toUpperCase()] || 0;
      if (used >= d.maxUses) { setRechargeMsg({ text: 'Código já atingiu o limite de usos.', ok: false }); setRecharging(false); return; }
      usages[rechargeInput.trim().toUpperCase()] = used + 1;
      localStorage.setItem('rhflix_code_uses', JSON.stringify(usages));

      const u = getCurrentUser();
      const currentExpiry = u.plan?.expiresAt ? new Date(u.plan.expiresAt) : new Date();
      const base = currentExpiry > new Date() ? currentExpiry : new Date();
      const newExpiry = new Date(base.getTime() + d.hours * 3600000).toISOString();
      const updated = { ...u, plan: { label: d.label, hours: d.hours, expiresAt: newExpiry, code: rechargeInput.trim().toUpperCase() } };
      updateUser(updated);
      setUser(updated);
      setRechargeMsg({ text: `✓ ${d.label} adicionados com sucesso!`, ok: true });
      setRechargeInput('');
    } catch {
      setRechargeMsg({ text: 'Erro ao verificar código.', ok: false });
    }
    setRecharging(false);
  };

  if (!user) return null;

  const isActive = isPlanActive(user);
  const expiry = planExpiry(user);
  const expiryStr = formatExpiry(expiry);

  return (
    <>
      <Head><title>RHFLIX — Perfis</title></Head>
      <div className="profiles-page page-fade">
        <div className="profiles-logo">RHFLIX</div>

        {/* Plan badge */}
        <div style={{ marginBottom: 16, textAlign: 'center' }}>
          <span className={`plan-chip${isActive ? ' active' : ' expired'}`}>
            {isActive ? `✓ Acesso ativo — ${expiryStr}` : user.plan ? 'Acesso expirado' : 'Sem plano ativo'}
          </span>
        </div>

        <h2 className="profiles-title">
          {manage ? 'Gerenciar Perfis' : 'Quem está assistindo?'}
        </h2>

        <div className="profiles-grid">
          {(user.profiles || []).map(p => (
            <div
              key={p.id}
              className="profile-item"
              onClick={() => manage ? null : selectProfile(p)}
            >
              <div style={{ position: 'relative' }}>
                <div className="profile-avatar-lg" style={{ background: p.color }}>
                  {p.name.charAt(0).toUpperCase()}
                  {manage && (
                    <div className="profile-edit-overlay">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4z"/>
                      </svg>
                    </div>
                  )}
                </div>
                {manage && (
                  <>
                    <button
                      className="profile-delete"
                      onClick={e => deleteProfile(p.id, e)}
                      title="Excluir perfil"
                      disabled={user.profiles.length <= 1}
                    >✕</button>
                    <button
                      style={{
                        position: 'absolute', bottom: -8, right: -8,
                        width: 24, height: 24, borderRadius: '50%',
                        background: '#333', border: '1px solid rgba(255,255,255,.2)',
                        color: '#fff', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '.7rem',
                      }}
                      onClick={e => openEdit(p, e)}
                      title="Editar"
                    >✎</button>
                  </>
                )}
              </div>
              <span className="profile-name">{p.name}</span>
            </div>
          ))}

          {/* Add profile */}
          {!manage && (user.profiles || []).length < MAX_PROFILES && (
            <div className="profile-item" onClick={openAdd}>
              <div className="profile-add">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </div>
              <span className="profile-name">Adicionar</span>
            </div>
          )}
          {manage && (user.profiles || []).length < MAX_PROFILES && (
            <div className="profile-item" onClick={openAdd}>
              <div className="profile-add">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </div>
              <span className="profile-name">Adicionar</span>
            </div>
          )}
        </div>

        {manage ? (
          <button className="profiles-manage" onClick={() => setManage(false)} style={{ marginTop: 32 }}>
            Concluído
          </button>
        ) : (
          <button className="profiles-manage" onClick={() => setManage(true)}>
            Gerenciar Perfis
          </button>
        )}

        {/* Recharge section */}
        <div style={{
          marginTop: 40, background: 'rgba(255,255,255,.04)',
          border: '1px solid var(--border)', borderRadius: 12,
          padding: '24px 28px', maxWidth: 400, width: '100%',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '.8rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>
            Inserir código de recarga
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="form-input"
              style={{ flex: 1, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '.9rem' }}
              placeholder="Ex: REDZIN"
              value={rechargeInput}
              onChange={e => setRechargeInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRedeem()}
            />
            <button
              className="btn btn-red btn-sm"
              onClick={handleRedeem}
              disabled={recharging}
              style={{ flexShrink: 0 }}
            >
              {recharging ? '...' : 'Aplicar'}
            </button>
          </div>
          {rechargeMsg.text && (
            <div style={{
              marginTop: 10, fontSize: '.82rem',
              color: rechargeMsg.ok ? '#27c230' : '#ff6b6b',
            }}>{rechargeMsg.text}</div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={() => { clearSession(); router.push('/login'); }}
          style={{
            marginTop: 24, background: 'transparent', border: 'none',
            color: 'var(--muted)', cursor: 'pointer', fontSize: '.85rem',
            textDecoration: 'underline',
          }}
        >
          Sair da conta
        </button>
      </div>

      {/* Add / Edit modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box">
            <div className="modal-title">{editProfile ? 'Editar Perfil' : 'Novo Perfil'}</div>

            <div className="form-group">
              <label className="form-label">Nome</label>
              <input
                className="form-input"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Nome do perfil"
                autoFocus
                maxLength={20}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cor</label>
              <div className="color-picker">
                {AVATAR_COLORS.map(c => (
                  <div
                    key={c}
                    className={`color-swatch${newColor === c ? ' selected' : ''}`}
                    style={{ background: c }}
                    onClick={() => setNewColor(c)}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div className="profile-avatar-lg" style={{ background: newColor, width: 56, height: 56, fontSize: '1.3rem', borderRadius: 10 }}>
                {(newName || '?').charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: '.9rem', color: 'var(--muted)' }}>{newName || 'Prévia'}</span>
            </div>

            <div className="modal-actions">
              <button className="btn btn-red btn-sm" onClick={saveProfile} disabled={!newName.trim()}>
                Salvar
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
