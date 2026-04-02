import React, { useState, useEffect, useRef, useCallback } from "react";
import { uploadImage } from "../../utils/uploadImage";
import { useUser } from "../../userProvider";
import FotoPerfil from "../foto-perfil";
import TarjetaUbicacionIndividual from "../tarjetas_ubicacion";
import Comentario from "../comentarios";
import Ubicacion from "../Ubicacion/ubicacion";
import PhotoEditorModal from "../photo-editor-modal";
import { FiCamera, FiUserPlus, FiUserX, FiUserCheck, FiClock, FiChevronDown } from "react-icons/fi";
import L from 'leaflet';
import '../../../node_modules/leaflet/dist/leaflet.css';
import '../Ubicacion/ubicacion.css';
import './perfil_usuario.css';
import { useTheme } from "../../contexts/themeContext";

function CreatedPlacesGrid({ user }){
  const [page, setPage] = useState(1);
  const perPage = 6;
  const [places, setPlaces] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!user || !user.id) return;
      try {
        const res = await fetch(`${API_URL}/places/db?creatorId=${user.id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setPlaces(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to load created places', e);
      }
    }
    load();
    return () => { mounted = false; };
  }, [user?.id]);

  const total = places.length;
  const shown = places.slice(0, page * perPage);

  return (
    <div>
      {shown.length === 0 ? (
        <p className="text-sm text-[var(--text-tertiary)]">No has iniciado reseñas aún.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shown.map((p) => (
              <div key={p.id} className="w-full">
                <TarjetaUbicacionIndividual
                  id={p.id}
                  userId={user?.id}
                  nombre={p.nombre}
                  categoria={p.categoria}
                  descripcion={p.descripcion}
                  imagen={p.imagen}
                  calificacion={p.calificacion}
                  vistas={p.vistas}
                  onClick={() => {}}
                />
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center">
            {shown.length < total ? (
              <button
                onClick={() => setPage((s) => s + 1)}
                className="text-sm text-[var(--text-primary)] px-3 py-1 hover:underline"
                aria-label="Ver más lugares"
              >
                <span className="mx-2">ver más</span>
              </button>
            ) : (
              total > perPage && (
                <button
                  onClick={() => setPage(1)}
                  className="text-sm text-[var(--text-primary)] px-3 py-1 hover:underline"
                  aria-label="Ver menos lugares"
                >
                  <span className="mx-2">ver menos</span>
                </button>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}


function LastRatedPlaces({ user, cardsToShow, cardWidth }) {
  const [places, setPlaces] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!user?.id) return;

    let mounted = true;
    setLoaded(false);
    setLoading(true);

    async function load() {
      try {
        const res = await fetch(`/api/places/last-rated?userId=${user.id}&limit=3`);
        if (!res.ok) {
          console.warn('[LastRatedPlaces] respuesta no ok:', res.status);
          return;
        }
        const data = await res.json();
        console.log('[LastRatedPlaces] datos recibidos:', data);
        if (!mounted) return;
        setPlaces(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('[LastRatedPlaces] error al cargar:', e);
      } finally {
        if (mounted) {
          setLoading(false);
          setLoaded(true);
        }
      }
    }

    load();
    return () => { mounted = false; };
  }, [user?.id]);

  // Mientras carga, mostrar placeholders
  if (loading) {
    return (
      <div className="flex gap-6">
        {[1, 2, 3].slice(0, cardsToShow).map((i) => (
          <div key={i} className="shrink-0 rounded-xl bg-[var(--bg-secondary)] animate-pulse" style={{ width: cardWidth + 'px', height: '240px' }} />
        ))}
      </div>
    );
  }

  // Sin datos reales: mostrar mensaje vacío
  if (loaded && places.length === 0) {
    return (
      <p className="text-sm text-[var(--text-tertiary)]">
        Aún no has comentado en ningún lugar. Cuando lo hagas, aparecerán aquí.
      </p>
    );
  }

  // Todavía esperando user.id (primer render sin usuario)
  if (!loaded) return null;

  return (
    <div className="flex gap-6 overflow-visible">
      {places.slice(0, cardsToShow).map((p) => (
        <div key={p.id} className="shrink-0" style={{ width: cardWidth + 'px', height: '240px', transition: 'width 220ms ease' }}>
          <TarjetaUbicacionIndividual
            className="!w-full !h-full !sm:w-full !sm:h-full"
            imagen={p.imagen}
            nombre={p.nombre}
            categoria={p.categoria}
            vistas={p.vistas ?? 0}
            calificacion={p.calificacion}
            id={p.id}
            userId={user?.id ?? 0}
            descripcion={p.descripcion}
            onClick={() => {}}
          />
        </div>
      ))}
    </div>
  );
}

export default function PerfilUsuario({ user: propUser, onClose, onNavigateToPlace }){
  const { user: ctxUser, setUser } = useUser();
  const user = propUser || ctxUser || {};

  const isOwnProfile = !propUser || (ctxUser && propUser.id === ctxUser.id);

  const API_URL_PROF = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const [ubicacionModalOpen, setUbicacionModalOpen] = useState(false);
  const [friendStatus, setFriendStatus] = useState('none'); // 'none' | 'pending' | 'friend'
  const [friendLoading, setFriendLoading] = useState(false);
  const [friendMenuOpen, setFriendMenuOpen] = useState(false);
  const friendMenuRef = useRef(null);

  useEffect(() => {
    if (!friendMenuOpen) return;
    const close = (e) => { if (friendMenuRef.current && !friendMenuRef.current.contains(e.target)) setFriendMenuOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [friendMenuOpen]);

  useEffect(() => {
    if (isOwnProfile || !ctxUser?.id || !user?.id) return;
    Promise.all([
      fetch(`${API_URL_PROF}/amistad/amigos/${ctxUser.id}`).then((r) => r.ok ? r.json() : []),
      fetch(`${API_URL_PROF}/amistad/enviadas/${ctxUser.id}`).then((r) => r.ok ? r.json() : []),
    ]).then(([amigos, enviadas]) => {
      const esamigo = Array.isArray(amigos) && amigos.some((a) => a.id === user.id);
      if (esamigo) { setFriendStatus('friend'); return; }
      const enviada = Array.isArray(enviadas) ? enviadas.find((x) => x.toId === user.id) : null;
      if (enviada?.estado === 'PENDIENTE') setFriendStatus('pending');
      else setFriendStatus('none');
    }).catch(() => {});
  }, [isOwnProfile, ctxUser?.id, user?.id]);

  const handleSendRequest = async () => {
    setFriendLoading(true);
    try {
      const res = await fetch(`${API_URL_PROF}/amistad/solicitud`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromId: ctxUser.id, toId: user.id }),
      });
      if (res.ok) setFriendStatus('pending');
    } finally { setFriendLoading(false); }
  };

  const handleCancelRequest = async () => {
    setFriendLoading(true);
    try {
      const res = await fetch(`${API_URL_PROF}/amistad/solicitud`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromId: ctxUser.id, toId: user.id }),
      });
      if (res.ok) setFriendStatus('none');
    } finally { setFriendLoading(false); }
  };

  const handleUnfriend = async () => {
    setFriendLoading(true);
    try {
      const res = await fetch(`${API_URL_PROF}/amistad/amigos`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAId: ctxUser.id, userBId: user.id }),
      });
      if (res.ok) {
        setFriendStatus('none');
        window.dispatchEvent(new CustomEvent('amistad-changed'));
      }
    } finally { setFriendLoading(false); }
  };

  const coverInputRef = useRef(null);
  const profileInputRef = useRef(null);
  const [tempCover, setTempCover] = useState(null);
  const [tempFotoPerfil, setTempFotoPerfil] = useState(null);

  // Editor modal state
  const [editorModal, setEditorModal] = useState(null); // { mode: 'profile'|'cover', imageSrc, fileName }

  const handleCoverChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    setEditorModal({ mode: 'cover', imageSrc: URL.createObjectURL(file), fileName: file.name });
  }, []);

  const handleProfilePicChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    setEditorModal({ mode: 'profile', imageSrc: URL.createObjectURL(file), fileName: file.name });
  }, []);

  const handleEditorConfirm = useCallback(async (croppedFile) => {
    const { mode, imageSrc } = editorModal;
    setEditorModal(null);
    URL.revokeObjectURL(imageSrc);

    const isProfile = mode === 'profile';
    const previewUrl = URL.createObjectURL(croppedFile);

    if (isProfile) setTempFotoPerfil(previewUrl);
    else setTempCover(previewUrl);

    try {
      const folder = isProfile ? 'profiles' : 'covers';
      const path = `${folder}/${ctxUser.id}_${Date.now()}_${croppedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const url = await uploadImage(croppedFile, 'spotapp', path, { maxWidth: isProfile ? 500 : 1200, quality: 0.85 });

      const bodyKey = isProfile ? 'fotoPerfil' : 'cover';
      const saveRes = await fetch(`${API_URL_PROF}/users/${ctxUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [bodyKey]: url }),
      });

      if (!saveRes.ok) {
        console.error('Error guardando foto en BD, status:', saveRes.status);
        // Revertir preview
        if (isProfile) setTempFotoPerfil(null);
        else setTempCover(null);
        return;
      }

      if (isProfile) {
        setTempFotoPerfil(url);
        setUser((prev) => ({ ...prev, fotoPerfil: url }));
      } else {
        setTempCover(url);
        setUser((prev) => ({ ...prev, cover: url }));
      }
    } catch (err) {
      console.error('Error uploading photo:', err);
    }
  }, [editorModal, ctxUser, API_URL_PROF, setUser]);

  const handleEditorCancel = useCallback(() => {
    if (editorModal?.imageSrc) URL.revokeObjectURL(editorModal.imageSrc);
    setEditorModal(null);
  }, [editorModal]);

  // Use centralized theme context
  const { isDark } = useTheme();

  // Coordenadas: intentar usar las del usuario logueado (ctxUser) que seleccionó en el header
  // El formato guardado en userProvider es string "lat, lng"
  let mapCenter = [31.8667, -116.5964]; // Fallback Ensenada
  const mapUser = ctxUser || user; // Preferir usuario logueado para la ubicación del mapa ("Tu ubicación")

  if (mapUser?.ubicacion && typeof mapUser.ubicacion === 'string' && mapUser.ubicacion.includes(',')) {
    const parts = mapUser.ubicacion.split(',').map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
       mapCenter = parts;
    }
  } else if (mapUser?.lat && mapUser?.lng) {
     mapCenter = [mapUser.lat, mapUser.lng];
  }

  const iconHtml = React.useMemo(() => {
    let img = '/fp_default.webp';
    if(mapUser?.fotoPerfil && typeof mapUser.fotoPerfil === 'string' && !/placeholder\.com/i.test(mapUser.fotoPerfil)) {
      img = mapUser.fotoPerfil;
    }
    return `<div class="div-marker"><div class="avatar"><img src="${img}" alt="marker"/></div><div class="marker-tip"></div></div>`;
  }, [mapUser?.fotoPerfil]);

  const mapIcon = React.useMemo(() => {
    return L.divIcon({ html: iconHtml, className: 'custom-div-icon', iconSize: [48, 56], iconAnchor: [24, 56] });
  }, [iconHtml]);

  // Refs to handle map resizing when layout changes (e.g., message sidebar open/close)
  const mapRef = useRef(null);
  const mapWrapperRef = useRef(null);
  const mapContainerId = useRef("map-perfil-" + Math.random().toString(36).substr(2, 9));
  const mapContainerIdStable = mapContainerId.current; // Stable reference for JSX
  const tileLayerRef = useRef({ dark: null, light: null, current: null });
  // Refs and state for the responsive cards row (show 3 or 4 cards depending on available width)
  const cardsRowRef = useRef(null);
  const [cardsToShow, setCardsToShow] = useState(3);
  const [cardWidth, setCardWidth] = useState(160);

  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return; // nothing we can do
    let mounted = true;
    let ro = null;
    let onWin = null;

    const tryAttach = () => {
      if (!mounted) return;
      const el = mapWrapperRef.current;
      if (!el) {
        // try again shortly
        setTimeout(tryAttach, 100);
        return;
      }

      ro = new ResizeObserver(() => {
        try {
          if (mapRef.current && typeof mapRef.current.invalidateSize === 'function') {
            setTimeout(() => {
              try { mapRef.current.invalidateSize({ animate: false }); } catch (e) { try { mapRef.current.invalidateSize(); } catch (e2) {} }
            }, 80);
          }
        } catch (e) {}
      });
      ro.observe(el);

      onWin = () => { if (mapRef.current && mapRef.current.invalidateSize) { try { mapRef.current.invalidateSize(); } catch (e) {} } };
      window.addEventListener('resize', onWin);
    };

    tryAttach();

    return () => {
      mounted = false;
      try { if (ro) ro.disconnect(); } catch (e) {}
      try { if (onWin) window.removeEventListener('resize', onWin); } catch (e) {}
    };
  }, []);

  // Observe cards row to adjust number of visible cards and their width
  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return;
    let mounted = true;
    let ro2 = null;

    const apply = () => {
      const el = cardsRowRef.current;
      if (!el) return;
      const GAP = 24; // px approximate for gap-6
      const w = el.clientWidth || 0;
      const possible = Math.floor((w + GAP) / (160 + GAP));
      const target = Math.max(3, Math.min(4, possible || 3));
      setCardsToShow(target);
      const cw = Math.floor((w - GAP * (target - 1)) / target);
      const clamped = Math.max(120, Math.min(160, cw));
      setCardWidth(clamped);
    };

    const tryAttach = () => {
      if (!mounted) return;
      const el = cardsRowRef.current;
      if (!el) {
        setTimeout(tryAttach, 100);
        return;
      }
      apply();
      ro2 = new ResizeObserver(apply);
      ro2.observe(el);
      window.addEventListener('resize', apply);
    };

    tryAttach();

    return () => { mounted = false; try { if (ro2) ro2.disconnect(); } catch (e) {} ; window.removeEventListener('resize', apply); };
  }, []);

  // Initialize map and handle theme changes
  useEffect(() => {
    console.log('Map useEffect triggered');

    // Use a small timeout to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      const container = document.getElementById(mapContainerIdStable);
      
      if (!container) {
        console.warn('Map container not found:', mapContainerIdStable);
        return;
      }

      console.log('Container found, dimensions:', container.clientWidth, 'x', container.clientHeight);

      // Clean up previous map if it exists
      if (container._leaflet_id) {
        console.log('Cleaning up existing leaflet map');
        container._leaflet_id = null;
      }

      try {
        // Create map
        console.log('Creating Leaflet map...');
        const mapInstance = L.map(mapContainerIdStable, {
          zoomControl: false,
          attributionControl: false,
          zoomSnap: 0.25,
          zoomDelta: 0.5,
          wheelPxPerZoomLevel: 120,
          dragging: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          touchZoom: false,
          keyboard: false,
        }).setView(mapCenter, 14);

        console.log('Map instance created');

        // Create both dark and light tile layers
        const darkTiles = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; Stadia Maps &copy; OpenMapTiles &copy; OpenStreetMap contributors',
          maxZoom: 19
        });

        const lightTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19
        });

        console.log('Tile layers created');

        // Store tile layers
        tileLayerRef.current.dark = darkTiles;
        tileLayerRef.current.light = lightTiles;

        // Add initial tile layer according to theme (use real dark tiles when dark)
        if (isDark) {
          darkTiles.addTo(mapInstance);
          tileLayerRef.current.current = darkTiles;
          console.log('Added dark tiles (initial)');
        } else {
          lightTiles.addTo(mapInstance);
          tileLayerRef.current.current = lightTiles;
          console.log('Added light tiles (initial)');
        }

        // Create marker with custom icon
        const markerInstance = L.marker(mapCenter, { icon: mapIcon, draggable: false }).addTo(mapInstance);
        if (user?.ubicacionLabel) {
          markerInstance.bindPopup(user.ubicacionLabel);
        }

        mapRef.current = mapInstance;
        console.log('Map initialized successfully');

        // Ensure map renders correctly
        setTimeout(() => {
          try {
            mapInstance.invalidateSize();
            console.log('invalidateSize called');
          } catch (e) {
            console.error('Error calling invalidateSize:', e);
          }
        }, 100);
      } catch (e) {
        console.error('Error initializing map:', e);
      }
    }, 50);

    return () => {
      clearTimeout(timeoutId);
      if (mapRef.current) {
        try {
          mapRef.current.remove();
          console.log('Map removed on cleanup');
          mapRef.current = null;
        } catch (e) {
          console.error('Error removing map:', e);
        }
      }
    };
  }, [mapCenter[0], mapCenter[1], mapIcon, isDark]);

  // Swap tile layer when app theme changes
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;
    const desired = isDark ? tileLayerRef.current.dark : tileLayerRef.current.light;
    if (!desired) return;
    try {
      const cur = tileLayerRef.current.current;
      if (cur !== desired) {
        if (cur) {
          try { mapRef.current.removeLayer(cur); } catch (er) { /* ignore */ }
        }
        desired.addTo(mapRef.current);
        tileLayerRef.current.current = desired;
        console.log('Swapped tile layer to', isDark ? 'dark' : 'light');
      }

      const container = document.getElementById(mapContainerIdStable);
      if (container) {
        if (isDark) {
          container.classList.add('map-filter-dark');
          container.style.filter = 'brightness(0.75) contrast(0.95) saturate(0.9)';
          console.log('Applied soft dark filter');
        } else {
          container.classList.remove('map-filter-dark');
          container.style.filter = 'none';
          console.log('Removed soft dark filter');
        }
      }
    } catch (e) {
      console.error('Error swapping tile layers or applying filter:', e);
    }
  }, [isDark]);

  // Ensure map container follows HTML 'dark' class even if local state misses an update
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    const syncContainer = () => {
      const container = document.getElementById(mapContainerIdStable);
      if (!container) return;
      try {
        if (root.classList.contains('dark')) {
          container.classList.add('map-filter-dark');
          container.style.filter = 'brightness(0.75) contrast(0.95) saturate(0.9)';
          console.log('Observer applied soft dark filter');
        } else {
          container.classList.remove('map-filter-dark');
          container.style.filter = 'none';
          console.log('Observer removed soft dark filter');
        }
      } catch (e) {
        console.error('Error syncing map container with root class:', e);
      }
    };

    // initial sync
    syncContainer();

    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'class') {
          syncContainer();
          break;
        }
      }
    });
    mo.observe(root, { attributes: true, attributeFilter: ['class'] });

    return () => mo.disconnect();
  }, [mapContainerIdStable]);


  return (
    <div className="w-full min-h-[70vh] px-4 lg:px-6" style={{ ['--avatar-size']: 'clamp(112px, 9vw, 144px)' }}>
      {editorModal && (
        <PhotoEditorModal
          mode={editorModal.mode}
          imageSrc={editorModal.imageSrc}
          fileName={editorModal.fileName}
          onConfirm={handleEditorConfirm}
          onCancel={handleEditorCancel}
        />
      )}
      <div className="max-w-6xl mx-auto">
        {/* Main panel that fills the central area */}
        <div className="relative rounded-lg overflow-visible bg-transparent">
          {/* Cover inside the main panel */}
          <div className="w-full h-56 lg:h-72 rounded-lg overflow-hidden shadow-sm relative group">
            <div
              className={`w-full h-full bg-center bg-cover transition-opacity duration-300 ${isOwnProfile ? 'group-hover:opacity-95 cursor-pointer' : ''}`}
              style={{ backgroundImage: `url(${tempCover || user?.cover || '/bg_login.webp'})` }}
              onClick={() => isOwnProfile && coverInputRef.current?.click()}
            />
            {isOwnProfile && (
              <>
                <button 
                  onClick={() => coverInputRef.current?.click()}
                  className="absolute right-4 bottom-4 lg:right-6 lg:bottom-6 flex items-center justify-center p-2 text-white hover:text-gray-200 transition-colors duration-200 z-10" 
                  aria-label="Cambiar foto de portada"
                >
                  <FiCamera className="w-6 h-6 lg:w-7 lg:h-7 opacity-80 group-hover:opacity-100 drop-shadow-md" style={{ strokeWidth: 1.5 }} />
                </button>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={coverInputRef} 
                  onChange={handleCoverChange} 
                />
              </>
            )}
          </div>

          {/* Avatar and name overlay inside cover, avatar slightly sticking out */}
          <div className="absolute left-6 lg:left-8 bottom-0 flex items-end gap-4">
            <div 
              className={`rounded-lg overflow-hidden shadow-2xl border-4 border-white bg-white ${isOwnProfile ? 'relative group cursor-pointer' : ''}`} 
              style={{ width: 'var(--avatar-size)', height: 'var(--avatar-size)', transform: 'translateY(25%)', zIndex: 30 }}
              onClick={() => isOwnProfile && profileInputRef.current?.click()}
            >
              <FotoPerfil
                imagen={tempFotoPerfil || user?.fotoPerfil || undefined}
                alt={user?.nombre || 'Usuario'}
                className="w-full h-full object-cover"
              />
              {isOwnProfile && (
                <>
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <FiCamera className="w-6 h-6 lg:w-8 lg:h-8 text-white drop-shadow-md" style={{ strokeWidth: 1.5 }} />
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={profileInputRef} 
                    onChange={handleProfilePicChange} 
                  />
                </>
              )}
            </div>

            <div style={{ transform: 'translateY(0)', zIndex: 20 }}>
              <div className="text-2xl lg:text-3xl font-extrabold text-white drop-shadow-lg">{user?.nombre || 'Usuario anónimo'}</div>
            </div>
          </div>

          {/* Botón de amistad para perfiles ajenos */}
          {!isOwnProfile && (
            <div className="absolute right-4 bottom-4 z-20">
              {friendStatus === 'none' && (
                <button disabled={friendLoading} onClick={handleSendRequest}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] text-sm font-semibold hover:opacity-80 transition-opacity disabled:opacity-50">
                  <FiUserPlus className="w-4 h-4" style={{ strokeWidth: 1.5 }} />
                  Agregar amigo
                </button>
              )}
              {friendStatus === 'pending' && (
                <button disabled={friendLoading} onClick={handleCancelRequest}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] text-sm font-medium hover:text-[var(--text-primary)] transition-colors disabled:opacity-50">
                  <FiClock className="w-4 h-4" style={{ strokeWidth: 1.5 }} />
                  Solicitud enviada
                </button>
              )}
              {friendStatus === 'friend' && (
                <div className="relative" ref={friendMenuRef}>
                  <button
                    disabled={friendLoading}
                    onClick={() => setFriendMenuOpen((v) => !v)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] text-sm font-medium hover:text-[var(--text-primary)] hover:border-[var(--text-tertiary)] transition-colors disabled:opacity-50"
                  >
                    <FiUserCheck className="w-4 h-4" style={{ strokeWidth: 1.5 }} />
                    Amigos
                    <FiChevronDown className="w-3.5 h-3.5 opacity-60" style={{ strokeWidth: 1.5 }} />
                  </button>
                  {friendMenuOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-lg z-50 overflow-hidden">
                      <button
                        disabled={friendLoading}
                        onClick={() => { setFriendMenuOpen(false); handleUnfriend(); }}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
                      >
                        <FiUserX className="w-4 h-4 flex-shrink-0" style={{ strokeWidth: 1.5 }} />
                        Eliminar de amigos
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {/* No close button: navigation is handled via the sidebar */}
        </div>
      </div>

      {/* Sección: Últimos lugares (3 tarjetas) + divisor vertical + Mapa */}
      <div className="max-w-6xl mx-auto relative z-0 px-2 lg:px-0" style={{ marginTop: 'clamp(1rem, calc(var(--avatar-size) * 0.25 + 1rem), 4rem)' }}>
        <section className="mb-6">
          <div className="w-full flex flex-col lg:flex-row gap-12 lg:items-start">
            <div className="w-full lg:w-3/5">
              <h3 className="text-lg font-medium mb-3">{isOwnProfile ? 'Últimos lugares que calificaste' : `Últimos lugares de ${user?.nombre?.split(' ')[0] ?? 'este usuario'}`}</h3>
              <div ref={cardsRowRef} className="flex gap-6">
                <LastRatedPlaces user={user} cardsToShow={cardsToShow} cardWidth={cardWidth} />
              </div>
            </div>

            <div className="w-full lg:w-2/5 relative lg:pl-12">
              {/* Divider vertical personalizado ajustable */}
              <div className="hidden lg:block absolute left-0 w-[1px] bg-[var(--border-color)]" style={{ top: '44px', height: '240px' }} />
              
              <h3 className="text-lg font-medium mb-3">{isOwnProfile ? 'Tu ubicación' : 'Ubicación'}</h3>
              <div ref={mapWrapperRef} className="relative rounded-md overflow-hidden border border-[var(--border-color)] group" style={{ height: 240 }}>
                <div id={mapContainerIdStable} style={{ height: '100%', width: '100%', backgroundColor: isDark ? '#2A2A29' : '#f8fafc' }}></div>

                {/* Overlay: perfil propio → hover para editar */}
                {isOwnProfile && (
                  <button
                    onClick={() => setUbicacionModalOpen(true)}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/0 group-hover:bg-black/40 transition-colors z-10"
                  >
                    <svg className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/>
                      <path strokeLinecap="round" d="M19.5 7.125L18 5.625"/>
                    </svg>
                    <p className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">Cambiar ubicación</p>
                  </button>
                )}

                {/* Overlay: perfil ajeno → blur */}
                {!isOwnProfile && (
                  <div className="absolute inset-0 backdrop-blur-md bg-black/30 flex flex-col items-center justify-center gap-2 pointer-events-none z-10">
                    <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    <p className="text-white/80 text-xs font-medium">Ubicación privada</p>
                  </div>
                )}
              </div>

              {/* Modal de ubicación (solo perfil propio) */}
              {isOwnProfile && (
                <Ubicacion
                  isOpen={ubicacionModalOpen}
                  onClose={() => setUbicacionModalOpen(false)}
                />
              )}
            </div>
          </div>
        </section>

        {/* Horizontal Divider */}
        <hr className="my-8 border-t border-[var(--border-color)]" />

        {/* Reseñas que iniciaste (propias: tarjetas en tamaño completo, paginadas 6 en 6) */}
        <section className="mb-8">
          <h3 className="text-lg font-medium mb-4">{isOwnProfile ? 'Reseñas que iniciaste' : `Reseñas de ${user?.nombre?.split(' ')[0] ?? 'este usuario'}`}</h3>
          <CreatedPlacesGrid user={user} />
        </section>
         <hr className="my-8 border-t border-[var(--border-color)]" />

        {/* Comentarios en reseñas */}
        <ComentariosUsuario user={user} isOwnProfile={isOwnProfile} onNavigateToPlace={onNavigateToPlace} />
      </div>
    </div>
  );
}

const API_COMENTARIOS = '/api';

function ComentariosUsuario({ user, isOwnProfile, onNavigateToPlace }) {
  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    fetch(`${API_COMENTARIOS}/comentarios-resena/usuario/${user.id}`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setComentarios(Array.isArray(data) ? data : []))
      .catch(() => setComentarios([]))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const navigate = (c, opts) => {
    if (!onNavigateToPlace) return;
    const place = c.resena?.place || {};
    onNavigateToPlace({
      id: c.resena?.placeId ?? place.id,
      nombre: place.nombre || c.resena?.nombreLugar || 'Lugar desconocido',
      imagen: place.imagen || '',
      categoria: place.categoria || 'General',
      descripcion: place.descripcion || '',
      calificacion: 0,
      vistas: 0,
    }, opts);
  };

  if (loading) return (
    <section className="mb-8">
      <h3 className="text-lg font-medium mb-4">Comentarios en reseñas</h3>
      <div className="space-y-3">
        {[1,2,3].map(i => <div key={i} className="h-20 rounded-lg bg-[var(--bg-secondary)] animate-pulse" />)}
      </div>
    </section>
  );

  return (
    <section className="mb-8">
      <h3 className="text-lg font-medium mb-4">
        {isOwnProfile ? 'Comentarios en reseñas' : `Comentarios de ${user?.nombre?.split(' ')[0] ?? 'este usuario'}`}
      </h3>
      {comentarios.length === 0 ? (
        <p className="text-sm text-[var(--text-tertiary)]">Aún no hay comentarios.</p>
      ) : (
        <div className="space-y-4">
          {comentarios.map((c) => (
            <Comentario
              key={c.id}
              id={c.id}
              avatar={user.fotoPerfil || '/fp_default.webp'}
              nombre={user.nombre || 'Usuario'}
              texto={c.resena ? `En ${c.resena.nombreLugar || c.resena.place?.nombre || 'un lugar'}: ${c.comentario}` : c.comentario}
              rating={c.rating}
              likes={0}
              dislikes={0}
              mine={isOwnProfile}
              onLike={() => {}}
              onDislike={() => {}}
              onEdit={() => navigate(c, { action: 'edit', comentarioId: c.id })}
              onDelete={() => navigate(c, { action: 'delete', comentarioId: c.id })}
              onNavigate={() => navigate(c)}
            />
          ))}
        </div>
      )}
    </section>
  );
}