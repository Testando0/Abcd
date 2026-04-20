// ── Simple hash (not crypto-secure, suitable for personal app) ──────────────
export function hashPassword(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return (h >>> 0).toString(36) + '_rhflix';
}

// ── Storage helpers ──────────────────────────────────────────────────────────
export function getUsers() {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem('rhflix_users') || '[]'); } catch { return []; }
}
export function saveUsers(users) {
  localStorage.setItem('rhflix_users', JSON.stringify(users));
}
export function getSession() {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem('rhflix_session')); } catch { return null; }
}
export function setSession(user) {
  localStorage.setItem('rhflix_session', JSON.stringify({ id: user.id, email: user.email }));
}
export function clearSession() {
  localStorage.removeItem('rhflix_session');
  if (typeof window !== 'undefined') sessionStorage.removeItem('rhflix_profile');
}
export function getCurrentUser() {
  const session = getSession();
  if (!session) return null;
  const users = getUsers();
  return users.find(u => u.id === session.id) || null;
}
export function updateUser(updated) {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === updated.id);
  if (idx >= 0) users[idx] = updated;
  else users.push(updated);
  saveUsers(users);
}
export function getCurrentProfile() {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(sessionStorage.getItem('rhflix_profile')); } catch { return null; }
}
export function setCurrentProfile(profile) {
  sessionStorage.setItem('rhflix_profile', JSON.stringify(profile));
}

// ── UUID ─────────────────────────────────────────────────────────────────────
export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ── Plan helpers ─────────────────────────────────────────────────────────────
export function isPlanActive(user) {
  if (!user?.plan?.expiresAt) return false;
  return new Date(user.plan.expiresAt) > new Date();
}
export function planExpiry(user) {
  if (!user?.plan?.expiresAt) return null;
  return new Date(user.plan.expiresAt);
}

// ── Profile avatar colors ────────────────────────────────────────────────────
export const AVATAR_COLORS = [
  '#E50914', '#3B82F6', '#10B981',
  '#8B5CF6', '#F59E0B', '#EC4899',
];
