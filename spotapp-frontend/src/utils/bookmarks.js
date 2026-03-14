// Utilities for managing favorites and saved items using localStorage
const FAVORITES_KEY = 'spotapp_favorites';
const SAVED_KEY = 'spotapp_saved';

function read(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn('failed reading', key, e);
    return [];
  }
}

function write(key, arr) {
  try {
    localStorage.setItem(key, JSON.stringify(arr));
  } catch (e) {
    console.warn('failed writing', key, e);
  }
}

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

export function getFavorites(){
  return read(FAVORITES_KEY) || [];
}

export function getSaved(){
  return read(SAVED_KEY) || [];
}

export function isFavorited(id){
  if (id == null) return false;
  return getFavorites().some(i => i && i.id === id);
}

export function isSaved(id){
  if (id == null) return false;
  return getSaved().some(i => i && i.id === id);
}

export function toggleFavorite(item){
  const norm = normalizeItem(item);
  if (!norm || norm.id == null) return false;
  const list = getFavorites();
  const exists = list.some(i => i.id === norm.id);
  let next;
  if (exists) {
    next = list.filter(i => i.id !== norm.id);
  } else {
    next = [norm, ...list];
  }
  write(FAVORITES_KEY, next);
  return !exists;
}

export function toggleSaved(item){
  const norm = normalizeItem(item);
  if (!norm || norm.id == null) return false;
  const list = getSaved();
  const exists = list.some(i => i.id === norm.id);
  let next;
  if (exists) {
    next = list.filter(i => i.id !== norm.id);
  } else {
    next = [norm, ...list];
  }
  write(SAVED_KEY, next);
  return !exists;
}
