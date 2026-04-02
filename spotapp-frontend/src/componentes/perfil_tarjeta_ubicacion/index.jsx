import React, { useMemo, useState, useEffect, useRef } from 'react';
import { FiArrowLeft, FiMapPin, FiStar, FiBookmark, FiShare2, FiCopy, FiCheck, FiNavigation, FiSend } from 'react-icons/fi';
import { isFavorited, isSaved, toggleFavorite, toggleSaved } from '../../utils/bookmarks';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useUser } from '../../userProvider';
import '../Ubicacion/ubicacion.css';
import BuzonResenas from '../buzon_resenas';
import GaleriaEfimera from '../galeria_efimera';
import '../../../node_modules/leaflet/dist/leaflet.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function FitBounds({ dest, user }) {
  const map = useMap();
  const destLat = dest?.[0] ?? null;
  const destLng = dest?.[1] ?? null;
  const userLat = user?.[0] ?? null;
  const userLng = user?.[1] ?? null;
  useEffect(() => {
    if (destLat === null || destLng === null) return;
    if (userLat !== null && userLng !== null) {
      const bounds = L.latLngBounds([[destLat, destLng], [userLat, userLng]]);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    } else {
      map.setView([destLat, destLng], 15);
    }
  }, [destLat, destLng, userLat, userLng]);
  return null;
}

export default function PerfilTarjetaUbicacion({ item, onBack }){
  const { user } = useUser();
  const [routeLoading, setRouteLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [destinationPos, setDestinationPos] = useState(null);
  const [userPos, setUserPos] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [animatedCoords, setAnimatedCoords] = useState([]);
  const [animatedPos, setAnimatedPos] = useState(null);
  const animRef = useRef(null);
  const [routeError, setRouteError] = useState('');
  const [isFav, setIsFav] = useState(false);
  const [isSavedState, setIsSavedState] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [amigos, setAmigos] = useState([]);
  const [sendingTo, setSendingTo] = useState(null);
  const [sentTo, setSentTo] = useState({});
  const shareRef = useRef(null);

  useEffect(() => {
    if (!shareOpen || !user?.id) return;
    fetch(`${API_URL}/amistad/amigos/${user.id}`).then(r => r.ok ? r.json() : []).then(d => setAmigos(Array.isArray(d) ? d : [])).catch(() => {});
  }, [shareOpen, user?.id]);

  useEffect(() => {
    if (!shareOpen) return;
    const close = (e) => { if (shareRef.current && !shareRef.current.contains(e.target)) setShareOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [shareOpen]);

  const handleCopyLink = () => {
    const lat = item?.lat ?? item?.latitude;
    const lng = item?.lng ?? item?.longitude;
    const text = lat && lng
      ? `${item.nombre} — https://maps.google.com/?q=${lat},${lng}`
      : item.nombre;
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const handleGoogleMaps = () => {
    const lat = item?.lat ?? item?.latitude;
    const lng = item?.lng ?? item?.longitude;
    if (lat && lng) window.open(`https://maps.google.com/?q=${lat},${lng}`, '_blank');
  };

  const handleSendToFriend = async (amigo) => {
    if (!user?.id) return;
    setSendingTo(amigo.id);
    try {
      const convRes = await fetch(`${API_URL}/chat/conversation/${user.id}/${amigo.id}`);
      if (!convRes.ok) return;
      const conv = await convRes.json();
      const payload = JSON.stringify({
        id: item.id,
        nombre: item.nombre,
        categoria: item.categoria,
        descripcion: item.descripcion ? String(item.descripcion).slice(0, 200) : null,
        calificacion: item.calificacion,
      });
      const msgRes = await fetch(`${API_URL}/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: conv.id, usuarioId: user.id, content: `📍PLACE:${payload}` }),
      });
      if (!msgRes.ok) return;
      setSentTo(prev => ({ ...prev, [amigo.id]: true }));
      window.dispatchEvent(new CustomEvent('chat-refresh', { detail: { conversationId: conv.id } }));
    } finally {
      setSendingTo(null);
    }
  };
  const [resolvedImagen, setResolvedImagen] = useState(null);
  useEffect(() => {
    if (!item?.id) return;
    const primary = item.imagen || item.fotoPrincipal;
    if (primary && !primary.startsWith('data:')) { setResolvedImagen(primary); return; }
    fetch(`${API_URL}/places/${item.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(p => { if (p?.imagen) setResolvedImagen(p.imagen); else if (Array.isArray(p?.fotos) && p.fotos[0]) setResolvedImagen(p.fotos[0]); })
      .catch(() => {});
  }, [item?.id]);

  const [averageCommentRating, setAverageCommentRating] = useState(null);
  const [viewCount, setViewCount] = useState(() => {
    const initial = Number(item?.vistas);
    return Number.isFinite(initial) ? initial : 0;
  });

  if(!item) return null;


  const defaultCenter = useMemo(() => [31.8667, -116.5964], []); // Ensenada

  useEffect(() => {
    const currentViews = Number(item?.vistas);
    setViewCount(Number.isFinite(currentViews) ? currentViews : 0);
  }, [item?.id, item?.vistas]);

  useEffect(() => {
    if (!item?.id) return undefined;

    let cancelled = false;
    const timer = setTimeout(async () => {
      if (cancelled) return;
      try {
        const res = await fetch(`${API_URL}/places/${item.id}/view`, {
          method: 'POST',
          headers: { Accept: 'application/json' },
        });

        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          const nextViews = Number(data?.vistas);
          if (Number.isFinite(nextViews)) setViewCount(nextViews);
        }
      } catch (e) {
        // Ignore network errors for view counting
      }
    }, 5000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [item?.id]);

  // Detect theme (tailwind 'dark' class or prefers-color-scheme)
  const [isDark, setIsDark] = useState(() => {
    if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) return true;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return true;
    return false;
  });

  useEffect(() => {
    let cancelled = false;

    const loadBookmarkStatus = async () => {
      if (!item?.id || !user?.id) {
        if (!cancelled) {
          setIsFav(false);
          setIsSavedState(false);
        }
        return;
      }

      try {
        const [fav, saved] = await Promise.all([
          isFavorited(item.id, user.id),
          isSaved(item.id, user.id),
        ]);
        if (!cancelled) {
          setIsFav(!!fav);
          setIsSavedState(!!saved);
        }
      } catch (e) {
        if (!cancelled) {
          setIsFav(false);
          setIsSavedState(false);
        }
      }
    };

    loadBookmarkStatus();

    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');

    const update = () => {
      setIsDark(root.classList.contains('dark') || (mq && mq.matches));
    };

    // Observe class changes on <html> (Tailwind dark toggle)
    const obs = new MutationObserver(update);
    obs.observe(root, { attributes: true, attributeFilter: ['class'] });

    if (mq && mq.addEventListener) mq.addEventListener('change', update);
    else if (mq && mq.addListener) mq.addListener(update);

    return () => {
      cancelled = true;
      obs.disconnect();
      if (mq && mq.removeEventListener) mq.removeEventListener('change', update);
      else if (mq && mq.removeListener) mq.removeListener(update);
    };
  }, [item?.id, user?.id]);

  // Usar la ubicación que el usuario configuró en su perfil
  useEffect(() => {
    const lat = Number(user?.lat ?? user?.latitud);
    const lng = Number(user?.lng ?? user?.longitud);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      setUserPos([lat, lng]);
    }
  }, [user?.lat, user?.lng, user?.latitud, user?.longitud]);

  // Resolver pin del lugar al montar sin esperar que el usuario presione "Cómo llegar"
  useEffect(() => {
    if (destinationPos) return;
    const directLat = Number(item?.lat ?? item?.latitude);
    const directLng = Number(item?.lng ?? item?.longitude);
    if (Number.isFinite(directLat) && Number.isFinite(directLng)) {
      setDestinationPos([directLat, directLng]);
    }
  }, [item?.id]);

  function getDestinationQuery(){
    return item?.direccion || item?.ubicacion || item?.nombre || 'Ensenada, Baja California, México';
  }

  async function getDestinationCoords(){
    const directLat = Number(item?.lat ?? item?.latitude);
    const directLng = Number(item?.lng ?? item?.longitude);

    if (Number.isFinite(directLat) && Number.isFinite(directLng)) {
      return [directLat, directLng];
    }

    const query = getDestinationQuery();
    const endpoint = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
    const response = await fetch(endpoint, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) return null;
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    const lat = Number(data[0].lat);
    const lon = Number(data[0].lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return [lat, lon];
  }

  async function getRoute(origin, destination){
    const url = `${API_URL}/places/route?olat=${origin[0]}&olng=${origin[1]}&dlat=${destination[0]}&dlng=${destination[1]}`;
    try {
      const response = await fetch(url);
      if (!response.ok) return [];
      const data = await response.json();
      if (data?.code !== 'Ok') return [];
      const coords = data?.routes?.[0]?.geometry?.coordinates;
      if (!Array.isArray(coords) || coords.length < 2) return [];
      return coords.map(([lng, lat]) => [lat, lng]);
    } catch(e) {
      return [];
    }
  }

  async function handleRouteClick(){
    if (routeLoading) return;
    setRouteLoading(true);
    setRouteError('');
    setRouteCoords([]);

    try {
      const userLat = Number(user?.lat ?? user?.latitud);
      const userLng = Number(user?.lng ?? user?.longitud);
      if (!Number.isFinite(userLat) || !Number.isFinite(userLng)) {
        setRouteError('Configura tu ubicación en tu perfil para ver la ruta.');
        setRouteLoading(false);
        return;
      }

      let dest = destinationPos;
      if (!dest) {
        dest = await getDestinationCoords();
        if (dest) setDestinationPos(dest);
      }
      if (!dest) {
        setRouteError('No se pudo obtener la ubicación del lugar.');
        setRouteLoading(false);
        return;
      }

      const origin = [userLat, userLng];
      setUserPos(origin);

      const route = await getRoute(origin, dest);
      if (route.length > 0) {
        setRouteCoords(route);
      } else {
        setRouteError('No se encontró ruta vial entre los dos puntos.');
      }

      setRouteLoading(false);
    } catch {
      setShowMap(true);
      setDestinationPos(defaultCenter);
      setRouteError('No fue posible resolver la ubicación del lugar.');
      setRouteLoading(false);
    }
  }

  // Animate route drawing as a "snake" and move a marker along it
  useEffect(() => {
    // cancel previous animation
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }

    if (!routeCoords || routeCoords.length < 2) {
      setAnimatedCoords([]);
      setAnimatedPos(null);
      return;
    }

    let cancelled = false;
    const full = routeCoords;
    const stepsPerSegment = 3; // very few steps = much faster
    const speedFactor = 3; // how many sub-steps to advance per frame
    let segIndex = 0;
    let stepCount = 0;

    setAnimatedCoords([full[0]]);
    setAnimatedPos(full[0]);

    const step = () => {
      if (cancelled) return;
      const start = full[segIndex];
      const end = full[segIndex + 1];
      if (!end) {
        // finished
        setAnimatedCoords(full);
        setAnimatedPos(full[full.length - 1]);
        return;
      }

      const t = (stepCount + 1) / stepsPerSegment;
      const lat = start[0] + (end[0] - start[0]) * t;
      const lng = start[1] + (end[1] - start[1]) * t;
      const point = [lat, lng];

      setAnimatedCoords(prev => {
        // avoid excessive growth when repeating identical points
        const last = prev[prev.length - 1];
        if (last && Math.abs(last[0] - lat) < 1e-7 && Math.abs(last[1] - lng) < 1e-7) return prev;
        return [...prev, point];
      });
      setAnimatedPos(point);

      // advance by multiple sub-steps to speed up animation
      stepCount += speedFactor;
      while (stepCount >= stepsPerSegment) {
        stepCount -= stepsPerSegment;
        segIndex++;
      }

      if (segIndex >= full.length - 1) {
        // ensure finalization on next frame
        animRef.current = requestAnimationFrame(() => {
          setAnimatedCoords(full);
          setAnimatedPos(full[full.length - 1]);
        });
        return;
      }

      animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);

    return () => {
      cancelled = true;
      if (animRef.current) cancelAnimationFrame(animRef.current);
      animRef.current = null;
    };
  }, [routeCoords]);

  // prepare a divIcon like in Ubicacion component for the user marker
  function createUserDivIcon() {
    let userImg = '/fp_default.webp';
    try {
      const raw = (typeof user !== 'undefined' && user?.fotoPerfil) ? user.fotoPerfil : '';
      if (raw && typeof raw === 'string' && !/placeholder\.com/i.test(raw)) {
        userImg = raw;
      }
    } catch (e) { userImg = '/fp_default.webp'; }
    const html = `<div class="div-marker"><div class="avatar"><img src="${userImg}" alt="marker"/></div><div class="marker-tip"></div></div>`;
    return L.divIcon({ html, className: 'custom-div-icon', iconSize: [48, 56], iconAnchor: [24, 56] });
  }

  async function handleToggleFav(e){
    try{ e && e.stopPropagation(); }catch(e){}
    if (!user?.id) return;
    try{
      const next = await toggleFavorite(item, user.id);
      setIsFav(!!next);
    }catch(e){ console.warn(e); }
  }

  async function handleToggleSaved(e){
    try{ e && e.stopPropagation(); }catch(e){}
    if (!user?.id) return;
    try{
      const next = await toggleSaved(item, user.id);
      setIsSavedState(!!next);
    }catch(e){ console.warn(e); }
  }

  // Resolve primary image URL (handles varias formas: `imagen`, `fotoPrincipal`, or first element of `fotos`)
  function resolvePrimaryImage(srcItem){
    try{
      if(!srcItem) return '';
      if (srcItem.fotoPrincipal && typeof srcItem.fotoPrincipal === 'string') return srcItem.fotoPrincipal;
      if (srcItem.imagen && typeof srcItem.imagen === 'string') return srcItem.imagen;
      if (Array.isArray(srcItem.fotos) && srcItem.fotos.length) {
        const first = srcItem.fotos[0];
        if (typeof first === 'string') return first;
        if (first && (first.url || first.src || first.imagen)) return first.url || first.src || first.imagen;
      }
    }catch(e){}
    return '';
  }

  // Resolve gallery image URLs into a flat array of strings
  function resolveGalleryImages(srcItem){
    try{
      if(!srcItem) return [];
      if (Array.isArray(srcItem.fotos) && srcItem.fotos.length) {
        return srcItem.fotos.map(f => (typeof f === 'string' ? f : (f && (f.url || f.src || f.imagen) ? (f.url || f.src || f.imagen) : null))).filter(Boolean);
      }
      const primary = resolvePrimaryImage(srcItem);
      return primary ? [primary] : [];
    }catch(e){ return []; }
  }

  // For demo: build a larger set of images to exercise the gallery behavior
  const demoImages = useMemo(() => {
    const base = resolveGalleryImages(item);
    // add many placeholder images (picsum) to test rotation/layouts — made larger per request
    const placeholders = Array.from({ length: 48 }, (_, i) => `https://picsum.photos/seed/spotapp-${i}/1000/800`);
    // ensure uniqueness and avoid duplicates
    const combined = [...base, ...placeholders].filter(Boolean);
    return Array.from(new Set(combined));
  }, [item]);

  const displayedRating = useMemo(() => {
    if (Number.isFinite(averageCommentRating)) return averageCommentRating;
    if (typeof item?.calificacion === 'number') return item.calificacion;
    return null;
  }, [averageCommentRating, item?.calificacion]);

  return (
    <div className="p-4 lg:p-6">
      <button onClick={onBack} className="mb-4 inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:underline">
        <FiArrowLeft /> Volver
      </button>

      <div className="bg-[var(--bg-secondary)] dark:bg-[var(--bg-secondary)] rounded-lg overflow-hidden shadow">
        <div className="w-full h-56 lg:h-72 bg-gray-100">
          {(resolvedImagen || resolvePrimaryImage(item)) && <img src={resolvedImagen || resolvePrimaryImage(item)} alt={item.nombre} className="w-full h-full object-cover" />}
        </div>

        <div className="p-4 lg:p-6">
          <div className="flex items-start gap-4 justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-[var(--text-primary)] truncate">{item.nombre}</h1>
                {Number.isFinite(displayedRating) && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-lg" style={{ color: 'rgba(255,193,7,0.95)' }}>
                      {displayedRating % 1 === 0 ? '★' : '✦'}
                    </span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{displayedRating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              <div className="mt-1 text-sm text-[var(--text-secondary)] flex items-center gap-3">
                <span className="inline-flex items-center gap-1">{item.categoria}</span>
                <span className="inline-flex items-center gap-1">{viewCount} vistas</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={handleToggleFav}
                className={`p-2 hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors ${isFav ? 'text-yellow-400' : 'text-[var(--text-secondary)]'}`}
                aria-pressed={isFav}
                aria-label="Agregar a favoritos"
                title="Favorito"
              >
                <FiStar className="w-5 h-5" style={{ strokeWidth: 1 }} />
              </button>
              <button
                type="button"
                onClick={handleToggleSaved}
                className={`p-2 hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors ${isSavedState ? 'text-indigo-400' : 'text-[var(--text-secondary)]'}`}
                aria-pressed={isSavedState}
                aria-label="Guardar"
                title="Guardar"
              >
                <FiBookmark className="w-5 h-5" style={{ strokeWidth: 1 }} />
              </button>
              <div className="relative" ref={shareRef}>
                <button
                  type="button"
                  onClick={() => setShareOpen(v => !v)}
                  className="p-2 text-[var(--text-secondary)] hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
                  aria-label="Compartir"
                >
                  <FiShare2 className="w-5 h-5" style={{ strokeWidth: 1 }} />
                </button>

                {shareOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xl z-50 overflow-hidden">
                    {/* Copiar enlace */}
                    <button
                      onClick={handleCopyLink}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors border-b border-[var(--border-color)]"
                    >
                      {copied ? <FiCheck className="w-4 h-4 text-green-500 flex-shrink-0" /> : <FiCopy className="w-4 h-4 flex-shrink-0 text-[var(--text-tertiary)]" style={{ strokeWidth: 1.5 }} />}
                      <span>{copied ? '¡Copiado!' : 'Copiar enlace'}</span>
                    </button>

                    {/* Abrir en Google Maps */}
                    <button
                      onClick={handleGoogleMaps}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors border-b border-[var(--border-color)]"
                    >
                      <FiNavigation className="w-4 h-4 flex-shrink-0 text-[var(--text-tertiary)]" style={{ strokeWidth: 1.5 }} />
                      <span>Abrir en Google Maps</span>
                    </button>

                    {/* Enviar a amigos */}
                    {amigos.length > 0 && (
                      <div className="px-4 pt-2.5 pb-1">
                        <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-widest mb-2">Enviar a un amigo</p>
                        <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                          {amigos.map(a => (
                            <button
                              key={a.id}
                              onClick={() => handleSendToFriend(a)}
                              disabled={sendingTo === a.id || sentTo[a.id]}
                              className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors text-left disabled:opacity-60"
                            >
                              <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--bg-tertiary)]">
                                {a.fotoPerfil && !/placeholder/.test(a.fotoPerfil)
                                  ? <img src={a.fotoPerfil} className="w-full h-full object-cover" />
                                  : <div className="w-full h-full flex items-center justify-center text-[var(--text-tertiary)] text-xs">{a.nombre?.[0]}</div>}
                              </div>
                              <span className="text-sm text-[var(--text-primary)] flex-1 truncate">{a.nombre}</span>
                              {sentTo[a.id]
                                ? <FiCheck className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                : <FiSend className="w-3.5 h-3.5 text-[var(--text-tertiary)] flex-shrink-0" style={{ strokeWidth: 1.5 }} />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {amigos.length === 0 && (
                      <p className="px-4 py-3 text-xs text-[var(--text-tertiary)]">Agrega amigos para compartir lugares.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <p className="mt-4 text-[var(--text-primary)]">{item.descripcion}</p>

          <div className="mt-6">
            <GaleriaEfimera images={demoImages} intervalSeconds={10} crop={true} maxSlots={8} />
          </div>

          <section className="mt-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Ruta al lugar</h2>
            <button
              type="button"
              onClick={handleRouteClick}
              disabled={routeLoading}
              className="mt-1 mb-3 inline-flex items-center gap-1.5 text-sm text-[var(--accent-blue,#3b82f6)] hover:underline disabled:opacity-70 cursor-pointer"
              aria-label="Ver ruta más corta"
            >
              {routeLoading
                ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                : <FiMapPin className="w-4 h-4" />}
              <span>{routeLoading ? 'Calculando ruta...' : 'Cómo llegar'}</span>
            </button>
            {routeError && <p className="mt-2 text-sm text-[var(--text-tertiary)]">{routeError}</p>}
            <div className="rounded-lg overflow-hidden border border-[var(--border-color)] relative">
              {routeLoading && (
                <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-2 text-white">
                    <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                    <span className="text-sm font-medium">Calculando ruta...</span>
                  </div>
                </div>
              )}
              <MapContainer
                center={destinationPos || defaultCenter}
                zoom={13}
                style={{ height: '320px', width: '100%' }}
                className="leaflet-map-offset"
              >
                <FitBounds dest={destinationPos} user={userPos} />
                <TileLayer
                  attribution={isDark
                    ? '&copy; Stadia Maps &amp; OpenMapTiles &amp; OpenStreetMap contributors'
                    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}
                  url={isDark
                    ? 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png'
                    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
                />

                {destinationPos && (
                  <CircleMarker className="leaflet-destination" center={destinationPos} radius={7} pathOptions={{ color: isDark ? '#ff8a80' : '#ef4444' }}>
                    <Popup>Destino: {item.nombre}</Popup>
                  </CircleMarker>
                )}

                {userPos && (
                  <>
                    {/* Fallback visual marker: CircleMarker ensures the user's position is visible even
                        if the custom divIcon fails or CSS hides it. */}
                    <CircleMarker center={userPos} radius={6} pathOptions={{ color: isDark ? '#7dd3fc' : '#16a34a', fill: true }}>
                      <Popup>Tu ubicación</Popup>
                    </CircleMarker>

                    {/* Also render the custom user div icon (keeps previous behavior) */}
                    <Marker position={userPos} icon={createUserDivIcon()}>
                      <Popup>Tu ubicación</Popup>
                    </Marker>
                  </>
                )}

                {/* Animated "snake" polyline: prefer animatedCoords when available */}
                {animatedCoords.length > 1 && (
                  <Polyline className="snake-route" positions={animatedCoords} pathOptions={{ color: '#ffffff', weight: 2 }} smoothFactor={0} noClip={true} />
                )}

                {/* If no animation running yet, show the full solid route (single line) */}
                {animatedCoords.length <= 1 && routeCoords.length > 1 && (
                  <Polyline className="snake-route" positions={routeCoords} pathOptions={{ color: '#ffffff', weight: 2, opacity: 0.95 }} smoothFactor={0} noClip={true} />
                )}

                {/* Moving marker (head of the snake) */}
                {animatedPos && (
                  <CircleMarker className="leaflet-moving" center={animatedPos} radius={6} pathOptions={{ color: isDark ? '#7dd3fc' : '#16a34a', fill: true }}>
                    <Popup>Moviéndose...</Popup>
                  </CircleMarker>
                )}
              </MapContainer>
            </div>
          </section>

          <section className="mt-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Comentarios</h2>
            <div className="mt-3">
              <BuzonResenas resenaId={item.id} onAverageRatingChange={setAverageCommentRating} focusComentarioId={item._focusComentarioId} focusAction={item._focusAction} />
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
