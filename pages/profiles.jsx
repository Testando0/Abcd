import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  getCurrentUser, updateUser, uid,
  setCurrentProfile, clearSession, getSession,
  getCurrentProfile, AVATAR_COLORS, isPlanActive, planExpiry,
} from '../lib/auth';

const MAX_PROFILES = 6;

function formatExpiry(date) {
  if (!date) return null;
  const diff = date - new Date();
  if (diff <= 0) return 'Expirado';
  const hours = Math.floor(diff / 3600000);
  if (hours < 48) return `${hours}h restantes`;
  const days = Math.floor(hours / 24);
  return `${days} dia${days !== 1 ? 's' : ''} restante${days !== 1 ? 's' : ''}`;
}

const PROFILE_ICONS = [
  '🎬','🎭','🎮','🌙','⚡','🔥','🎵','🌊','🦊','🐉','🌟','🎯',
];

export default function Profiles() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [manage, setManage] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editProfile, setEditProfile] = useState(null);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(AVATAR_COLORS[0]);
  const [newIcon, setNewIcon] = useState('');
  const [rechargeInput, setRechargeInput] = useState('');
  const [rechargeMsg, setRechargeMsg] = useState({ text: '', ok: false });
  const [recharging, setRecharging] = useState(false);
  const [showRecharge, setShowRecharge] = useState(false);
  const [selecting, setSelecting] = useState(null); // profile id being selected (animation)

  const existingProfile = typeof window !== 'undefined' ? getCurrentProfile() : null;

  useEffect(() => {
    const s = getSession();
    if (!s) { router.replace('/login'); return; }
    const u = getCurrentUser();
    if (!u) { clearSession(); router.replace('/login'); return; }
    setUser(u);
    const { manage: m } = router.query;
    if (m) setManage(true);
  }, [router.query]);

  const selectProfile = (profile) => {
    if (manage) return;
    setSelecting(profile.id);
    setTimeout(() => {
      setCurrentProfile(profile);
      router.push('/');
    }, 280);
  };

  const handleBack = () => {
    if (manage) {
      setManage(false);
      router.replace('/profiles', undefined, { shallow: true });
      return;
    }
    if (existingProfile) {
      router.push('/');
    }
  };

  const openAdd = () => {
    const u = getCurrentUser();
    if ((u?.profiles || []).length >= MAX_PROFILES) return;
    setEditProfile(null);
    setNewName('');
    setNewColor(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);
    setNewIcon('');
    setShowModal(true);
  };

  const openEdit = (p, e) => {
    e.stopPropagation();
    setEditProfile(p);
    setNewName(p.name);
    setNewColor(p.color);
    setNewIcon(p.icon || '');
    setShowModal(true);
  };

  const saveProfile = () => {
    if (!newName.trim()) return;
    const u = getCurrentUser();
    let profiles = [...(u.profiles || [])];
    if (editProfile) {
      profiles = profiles.map(p =>
        p.id === editProfile.id
          ? { ...p, name: newName.trim(), color: newColor, icon: newIcon }
          : p
      );
    } else {
      if (profiles.length >= MAX_PROFILES) return;
      profiles.push({ id: uid(), name: newName.trim(), color: newColor, icon: newIcon });
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
    // If deleted current profile, clear it
    const cur = getCurrentProfile();
    if (cur?.id === pid) {
      sessionStorage.removeItem('rhflix_profile');
    }
  };

  const handleRedeem = async () => {
    const trimmed = rechargeInput.trim();
    if (!trimmed) return;
    setRecharging(true);
    setRechargeMsg({ text: '', ok: false });
    try {
      const r = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed }),
      });
      const d = await r.json();

      if (!d.ok) {
        setRechargeMsg({ text: d.error || 'Código inválido.', ok: false });
        setRecharging(false);
        return;
      }

      const usages = JSON.parse(localStorage.getItem('rhflix_code_uses') || '{}');
      const used = usages[trimmed.toUpperCase()] || 0;
      if (used >= d.maxUses) {
        setRechargeMsg({ text: 'Código já atingiu o limite de usos.', ok: false });
        setRecharging(false);
        return;
      }
      usages[trimmed.toUpperCase()] = used + 1;
      localStorage.setItem('rhflix_code_uses', JSON.stringify(usages));

      const u = getCurrentUser();
      const currentExpiry = u.plan?.expiresAt ? new Date(u.plan.expiresAt) : null;
      const base = currentExpiry && currentExpiry > new Date() ? currentExpiry : new Date();
      const newExpiry = new Date(base.getTime() + d.hours * 3600000).toISOString();
      const updated = { ...u, plan: { label: d.label, hours: d.hours, expiresAt: newExpiry, code: trimmed.toUpperCase() } };
      updateUser(updated);
      setUser(updated);
      setRechargeMsg({ text: `✓ ${d.label} adicionados com sucesso!`, ok: true });
      setRechargeInput('');
    } catch {
      setRechargeMsg({ text: 'Erro ao verificar código. Tente novamente.', ok: false });
    }
    setRecharging(false);
  };

  if (!user) return null;

  const isActive = isPlanActive(user);
  const expiry = planExpiry(user);
  const expiryStr = formatExpiry(expiry);
  const profiles = user.profiles || [];
  const canAdd = profiles.length < MAX_PROFILES;

  return (
    <>
      <Head><title>RHFLIX — Perfis</title></Head>

      <div className="profiles-page page-fade">

        {/* Logo */}
        <div className="profiles-logo">RHFLIX</div>

        {/* Back button — only when user has a profile and isn't in manage mode for first time */}
        {existingProfile && (
          <button className="profiles-back-btn" onClick={handleBack}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            {manage ? 'Concluído' : 'Voltar'}
          </button>
        )}

        {/* Plan status */}
        <div className="profiles-plan-row">
          <span className={`plan-chip${isActive ? ' active' : ' expired'}`}>
            {isActive
              ? `● Acesso ativo — ${expiryStr}`
              : user.plan ? '● Acesso expirado' : '● Sem plano ativo'}
          </span>
          <button
            className="plan-recharge-btn"
            onClick={() => setShowRecharge(v => !v)}
          >
            {showRecharge ? 'Fechar' : '+ Inserir código'}
          </button>
        </div>

        {/* Recharge section (collapsible) */}
        {showRecharge && (
          <div className="recharge-panel page-fade">
            <div className="recharge-label">Código de recarga</div>
            <div className="recharge-row">
              <input
                className="form-input recharge-input"
                placeholder="Ex: RHFLIX2026"
                value={rechargeInput}
                onChange={e => setRechargeInput(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleRedeem()}
                maxLength={32}
              />
              <button
                className="btn btn-red btn-sm"
                onClick={handleRedeem}
                disabled={recharging || !rechargeInput.trim()}
              >
                {recharging ? '...' : 'Aplicar'}
              </button>
            </div>
            {rechargeMsg.text && (
              <div className={`recharge-msg${rechargeMsg.ok ? ' ok' : ' err'}`}>
                {rechargeMsg.text}
              </div>
            )}
          </div>
        )}

        {/* Title */}
        <h2 className="profiles-title">
          {manage ? 'Gerenciar Perfis' : 'Quem está assistindo?'}
        </h2>

        {/* Profile grid */}
        <div className="profiles-grid">
          {profiles.map(p => {
            const isCurrent = existingProfile?.id === p.id;
            return (
              <div
                key={p.id}
                className={`profile-item${selecting === p.id ? ' selecting' : ''}${isCurrent && !manage ? ' is-current' : ''}`}
                onClick={() => !manage && selectProfile(p)}
                style={{ cursor: manage ? 'default' : 'pointer' }}
              >
                <div className="profile-avatar-wrap">
                  <div className="profile-avatar-lg" style={{ background: p.color }}>
                    {p.icon
                      ? <span style={{ fontSize: '2.2rem' }}>{p.icon}</span>
                      : p.name.charAt(0).toUpperCase()
                    }
                  </div>

                  {manage && (
                    <div className="profile-manage-overlay" onClick={e => openEdit(p, e)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
                        width="28" height="28">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4z"/>
                      </svg>
                    </div>
                  )}

                  {manage && (
                    <button
                      className="profile-delete"
                      onClick={e => deleteProfile(p.id, e)}
                      title="Excluir perfil"
                      disabled={profiles.length <= 1}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                        strokeLinecap="round" width="12" height="12">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  )}
                </div>

                <span className="profile-name">
                  {p.name}
                  {isCurrent && !manage && (
                    <span className="profile-current-dot" />
                  )}
                </span>
              </div>
            );
          })}

          {/* Add profile button */}
          {canAdd && (
            <div className="profile-item" onClick={openAdd} style={{ cursor: 'pointer' }}>
              <div className="profile-avatar-wrap">
                <div className="profile-add">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                    strokeLinecap="round" width="36" height="36">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </div>
              </div>
              <span className="profile-name">Adicionar</span>
            </div>
          )}
        </div>

        {/* Manage / Done button */}
        {!manage ? (
          <button className="profiles-manage" onClick={() => setManage(true)}>
            Gerenciar Perfis
          </button>
        ) : (
          !existingProfile && (
            <button className="profiles-manage" onClick={() => setManage(false)}>
              Concluído
            </button>
          )
        )}

        {/* Logout */}
        <button
          className="profiles-logout"
          onClick={() => { clearSession(); router.replace('/login'); }}
        >
          Sair da conta
        </button>
      </div>

      {/* Add / Edit modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box">
            <div className="modal-title">{editProfile ? 'Editar Perfil' : 'Novo Perfil'}</div>

            {/* Preview */}
            <div className="modal-preview">
              <div className="profile-avatar-lg" style={{ background: newColor, width: 72, height: 72, fontSize: newIcon ? '2rem' : '1.6rem', borderRadius: 12 }}>
                {newIcon || (newName || '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#fff', fontSize: '.95rem' }}>{newName || 'Prévia'}</div>
                <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: 2 }}>Como seu perfil aparecerá</div>
              </div>
            </div>

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
              <label className="form-label">Ícone (opcional)</label>
              <div className="icon-picker">
                <div
                  className={`icon-swatch${newIcon === '' ? ' selected' : ''}`}
                  style={{ fontWeight: 700, color: newColor, fontSize: '.8rem' }}
                  onClick={() => setNewIcon('')}
                >
                  {(newName || '?').charAt(0).toUpperCase()}
                </div>
                {PROFILE_ICONS.map(ic => (
                  <div
                    key={ic}
                    className={`icon-swatch${newIcon === ic ? ' selected' : ''}`}
                    onClick={() => setNewIcon(ic)}
                  >
                    {ic}
                  </div>
                ))}
              </div>
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
