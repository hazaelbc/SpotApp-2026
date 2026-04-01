const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function normalizeItem(item){
  if(!item) return null;
  return {
    id: item.id,
    nombre: item.nombre,
    imagen: item.imagen || item.fotos?.[0] || null,
    categoria: item.categoria,
    descripcion: item.descripcion,
    calificacion: item.calificacion,
    vistas: item.vistas,
    lat: item.lat ?? item.latitude,
    lng: item.lng ?? item.longitude,
  };
}

function normalizeRow(row) {
  if (!row) return null;
  const base = row.place || row;
  return normalizeItem(base);
}

async function fetchJson(url, options) {
  const res = await fetch(url, {
    headers: { Accept: 'application/json', ...(options?.headers || {}) },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function getFavorites(userId){
  if (!userId) return [];
  try {
    const rows = await fetchJson(`${API_URL}/bookmarks/favorites/${userId}`);
    return (rows || []).map(normalizeRow).filter(Boolean);
  } catch (e) {
    console.warn('failed fetching favorites', e);
    return [];
  }
}

export async function getSaved(userId){
  if (!userId) return [];
  try {
    const rows = await fetchJson(`${API_URL}/bookmarks/saved/${userId}`);
    return (rows || []).map(normalizeRow).filter(Boolean);
  } catch (e) {
    console.warn('failed fetching saved', e);
    return [];
  }
}

export async function isFavorited(id, userId){
  if (id == null || !userId) return false;
  try {
    const data = await fetchJson(`${API_URL}/bookmarks/status/${userId}/${id}`);
    return !!data?.favorited;
  } catch (e) {
    console.warn('failed status favorite', e);
    return false;
  }
}

export async function isSaved(id, userId){
  if (id == null || !userId) return false;
  try {
    const data = await fetchJson(`${API_URL}/bookmarks/status/${userId}/${id}`);
    return !!data?.saved;
  } catch (e) {
    console.warn('failed status saved', e);
    return false;
  }
}

export async function toggleFavorite(item, userId){
  const norm = normalizeItem(item);
  if (!norm || norm.id == null || !userId) return false;
  try {
    const data = await fetchJson(`${API_URL}/bookmarks/favorites/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuarioId: Number(userId), placeId: Number(norm.id) }),
    });
    return !!data?.active;
  } catch (e) {
    console.warn('failed toggle favorite', e);
    return false;
  }
}

export async function toggleSaved(item, userId){
  const norm = normalizeItem(item);
  if (!norm || norm.id == null || !userId) return false;
  try {
    const data = await fetchJson(`${API_URL}/bookmarks/saved/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuarioId: Number(userId), placeId: Number(norm.id) }),
    });
    return !!data?.active;
  } catch (e) {
    console.warn('failed toggle saved', e);
    return false;
  }
}
