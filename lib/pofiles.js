// lib/profiles.js
const MAX_PROFILES = 6;
const STORAGE_KEY = 'rhflix_profiles_v2';

export const PROFILE_COLORS = [
  '#E50914', '#007BFF', '#28A745', '#FFC107', '#6F42C1', '#FD7E14', '#20C997', '#E83E8C'
];

export const PROFILE_ICONS = ['👤', '🦸', '🎬', '🎮', '🐱', '🦊', '🤖', '👽', '🦄', '🐉'];

export function loadProfiles(userId) {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const all = JSON.parse(data);
    return all[userId] || [];
  } catch {
    return [];
  }
}

export function saveProfiles(userId, profiles) {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    data[userId] = profiles;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error('Erro ao salvar perfis:', err);
    return false;
  }
}

export function createProfile(userId, name, color, icon) {
  const profiles = loadProfiles(userId);
  if (profiles.length >= MAX_PROFILES) {
    return { error: `Máximo de ${MAX_PROFILES} perfis atingido` };
  }
  if (!name?.trim()) {
    return { error: 'Nome do perfil é obrigatório' };
  }
  
  const newProfile = {
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36),
    name: name.trim().slice(0, 20),
    color: PROFILE_COLORS.includes(color) ? color : PROFILE_COLORS[0],
    icon: PROFILE_ICONS.includes(icon) ? icon : PROFILE_ICONS[0],
    createdAt: Date.now(),
    isKids: false,
    watchHistory: [],    myList: []
  };
  
  profiles.push(newProfile);
  saveProfiles(userId, profiles);
  return { success: true, profile: newProfile };
}

export function updateProfile(userId, profileId, updates) {
  const profiles = loadProfiles(userId);
  const index = profiles.findIndex(p => p.id === profileId);
  if (index === -1) return { error: 'Perfil não encontrado' };
  
  const allowed = ['name', 'color', 'icon', 'isKids'];
  for (const key of allowed) {
    if (updates[key] !== undefined) {
      if (key === 'name') {
        profiles[index][key] = updates[key].trim().slice(0, 20);
      } else if (key === 'color' && PROFILE_COLORS.includes(updates[key])) {
        profiles[index][key] = updates[key];
      } else if (key === 'icon' && PROFILE_ICONS.includes(updates[key])) {
        profiles[index][key] = updates[key];
      } else if (key === 'isKids') {
        profiles[index][key] = !!updates[key];
      }
    }
  }
  
  saveProfiles(userId, profiles);
  return { success: true, profile: profiles[index] };
}

export function deleteProfile(userId, profileId) {
  const profiles = loadProfiles(userId);
  if (profiles.length <= 1) {
    return { error: 'É necessário ter pelo menos 1 perfil' };
  }
  const filtered = profiles.filter(p => p.id !== profileId);
  saveProfiles(userId, filtered);
  return { success: true };
}

export function setActiveProfile(userId, profileId) {
  try {
    localStorage.setItem('rhflix_active_profile', JSON.stringify({ userId, profileId }));
    return true;
  } catch {
    return false;
  }
}
export function getActiveProfile(userId) {
  try {
    const active = JSON.parse(localStorage.getItem('rhflix_active_profile') || 'null');
    if (active?.userId === userId) {
      const profiles = loadProfiles(userId);
      return profiles.find(p => p.id === active.profileId) || null;
    }
  } catch {}
  return null;
      }
