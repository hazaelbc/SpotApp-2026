import React, { useState, useEffect, useRef, useMemo } from "react";
import { uploadImage } from "../../utils/uploadImage";
import { useNavigate } from 'react-router-dom';
import BarraBusqueda from "../../componentes/barra-busqueda";
import FotoPerfil from "../../componentes/foto-perfil";
import Ubicacion from "../../componentes/Ubicacion/ubicacion.jsx";
import ThemeToggle from "../../componentes/themeToggle";
import { BarraLateral } from "../../componentes/barra_lateral";
import { BarraMensajes } from "../../componentes/barra_mensajes";
import TarjetaUbicacionIndividual from "../../componentes/tarjetas_ubicacion";
import AdSenseBanner from "../../componentes/adsense-banner";
import BarraHerramientasMovil from "../../componentes/barra_herramientas_movil";
import { useUser } from "../../userProvider";
import { FiBell, FiHome, FiCompass, FiSettings, FiTrendingUp, FiMap, FiFilter, FiMail } from "react-icons/fi";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import DropdownFiltrarPor from "../../componentes/filtrar_por_dropdown";
import PerfilTarjetaUbicacion from "../../componentes/perfil_tarjeta_ubicacion";
import PerfilUsuario from "../../componentes/perfil_usuario";
import SavedList from "../../componentes/saved_list";
import ListaAmigos from "../../componentes/lista_amigos";
import L from 'leaflet';
import "leaflet/dist/leaflet.css";
import "../../componentes/Ubicacion/ubicacion.css";
import { useTheme } from "../../contexts/themeContext";

export const Lobby = ({ children }) => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [location, setLocation] = useState('');
  const [draftLocation, setDraftLocation] = useState('');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isMobileSearchVisible, setIsMobileSearchVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [profileUser, setProfileUser] = useState(null);

  useEffect(() => {
    const handler = (e) => { setSelectedCard(e.detail); setProfileUser(null); };
    window.addEventListener('navigate-to-place', handler);
    return () => window.removeEventListener('navigate-to-place', handler);
  }, []);
  const [viewMode, setViewMode] = useState('all'); // 'all' | 'favorites' | 'saved'
  const [query, setQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  // Create-place modal form state
  const [createNombre, setCreateNombre] = useState('');
  const [createDescripcion, setCreateDescripcion] = useState('');
  const [createImageFile, setCreateImageFile] = useState(null);
  const [createImagePreview, setCreateImagePreview] = useState(null);
  const [createLocationCoords, setCreateLocationCoords] = useState(null); // { lat, longitud }
  const [createLocationLabel, setCreateLocationLabel] = useState('');
  const [createLocationTemp, setCreateLocationTemp] = useState({ lat: 19.432608, longitud: -99.133209 });
  const [isSubmittingPlace, setIsSubmittingPlace] = useState(false);
  const [createWizardStep, setCreateWizardStep] = useState(1);
  const placeMapRef = useRef(null);
  const placeMapInstanceRef = useRef(null);
  const placeMarkerRef = useRef(null);
  const placeTileLayerRef = useRef({ dark: null, light: null, current: null });

  const resetCreateForm = () => {
    setCreateNombre('');
    setCreateDescripcion('');
    setCreateImageFile(null);
    setCreateImagePreview(null);
    setCreateLocationCoords(null);
    setCreateLocationLabel('');
    setCreateLocationTemp({ lat: 19.432608, longitud: -99.133209 });
    setCreateWizardStep(1);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    resetCreateForm();
  };

  const handleCreatePlace = async () => {
    if (isSubmittingPlace) return;
    setIsSubmittingPlace(true);
    try {
      const body = {
        nombre: createNombre || '',
        descripcion: createDescripcion || '',
      };
      if (createImageFile) body.imagen = createImageFile;
      if (createLocationCoords) {
        body.latitud = createLocationCoords.lat;
        body.longitud = createLocationCoords.longitud;
        body.ubicacionLabel = createLocationLabel || '';
      }
      if (user && user.id) body.creatorId = user.id;

      const response = await fetch('/api/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const createdPlace = await response.json();
      console.debug('[CreatePlace] created', createdPlace);
      closeCreateModal();
    } catch (error) {
      console.error('[CreatePlace] error', error);
      if (typeof window !== 'undefined' && window.alert) {
        window.alert('No se pudo guardar el lugar. Intenta nuevamente.');
      }
    } finally {
      setIsSubmittingPlace(false);
    }
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem('spotapp_location');
      if (stored) {
        setLocation(stored);
        setDraftLocation(stored);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Polling de notificaciones cada 30s
  useEffect(() => {
    if (!user?.id) return;
    const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const fetchNotifs = async () => {
      try {
        const res = await fetch(`${API}/notifications/${user.id}`);
        if (!res.ok) return;
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setNotifications(list);
        setUnreadCount(list.filter((n) => !n.leido).length);
      } catch (e) { /* silencioso */ }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);


  const markAllRead = async () => {
    if (!user?.id) return;
    const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    await fetch(`${API}/notifications/${user.id}/read-all`, { method: 'PATCH' });
    setNotifications((prev) => prev.map((n) => ({ ...n, leido: true })));
    setUnreadCount(0);
  };

  const markOneRead = async (notifId) => {
    const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    await fetch(`${API}/notifications/${notifId}/read`, { method: 'PATCH' });
    setNotifications((prev) => prev.map((n) => n.id === notifId ? { ...n, leido: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleAceptarSolicitud = async (solicitudId, notifId) => {
    const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const res = await fetch(`${API}/amistad/solicitud/${solicitudId}/aceptar`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    });
    if (res.ok) markOneRead(notifId);
  };

  const handleRechazarSolicitud = async (solicitudId, notifId) => {
    const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const res = await fetch(`${API}/amistad/solicitud/${solicitudId}/rechazar`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    });
    if (res.ok) markOneRead(notifId);
  };

  const isMapStepActive = isCreateModalOpen && createWizardStep === 2;
  useEffect(() => {
    if (!isMapStepActive) {
      if (placeMapInstanceRef.current) {
        placeMapInstanceRef.current.off();
        placeMapInstanceRef.current.remove();
        placeMapInstanceRef.current = null;
        placeMarkerRef.current = null;
        placeTileLayerRef.current = { dark: null, light: null, current: null };
      }
      return;
    }
    const mapEl = placeMapRef.current;
    if (!mapEl) return;
    const mapInstance = L.map(mapEl).setView([createLocationTemp.lat, createLocationTemp.longitud], 13);
    placeMapInstanceRef.current = mapInstance;

    const darkTiles = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; Stadia Maps &copy; OpenMapTiles &copy; OpenStreetMap contributors',
      maxZoom: 19,
    });
    const lightTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    });
    placeTileLayerRef.current.dark = darkTiles;
    placeTileLayerRef.current.light = lightTiles;
    if (isDark) {
      darkTiles.addTo(mapInstance);
      placeTileLayerRef.current.current = darkTiles;
    } else {
      lightTiles.addTo(mapInstance);
      placeTileLayerRef.current.current = lightTiles;
    }

    let userImg = '/fp_default.webp';
    try {
      const raw = user?.fotoPerfil || '';
      if (raw && typeof raw === 'string' && !/placeholder\.com/i.test(raw)) userImg = raw;
    } catch (e) {}
    const markerHtml = `<div class="div-marker"><div class="avatar"><img src="${userImg}" alt="marker"/></div><div class="marker-tip"></div></div>`;
    const markerIcon = L.divIcon({ html: markerHtml, className: 'custom-div-icon', iconSize: [48, 56], iconAnchor: [24, 56] });
    const marker = L.marker([createLocationTemp.lat, createLocationTemp.longitud], { draggable: true, icon: markerIcon }).addTo(mapInstance);
    placeMarkerRef.current = marker;
    marker.on('dragend', (ev) => {
      const { lat, lng } = ev.target.getLatLng();
      setCreateLocationTemp({ lat, longitud: lng });
    });
    mapInstance.on('click', (ev) => {
      const { lat, lng } = ev.latlng;
      marker.setLatLng([lat, lng]);
      setCreateLocationTemp({ lat, longitud: lng });
    });
    return () => {
      if (placeMapInstanceRef.current) {
        placeMapInstanceRef.current.off();
        placeMapInstanceRef.current.remove();
        placeMapInstanceRef.current = null;
        placeMarkerRef.current = null;
        placeTileLayerRef.current = { dark: null, light: null, current: null };
      }
    };
  }, [isMapStepActive]);

  // Swap tile layer when theme changes while map is open
  useEffect(() => {
    const map = placeMapInstanceRef.current;
    const tiles = placeTileLayerRef.current;
    if (!map || !tiles.dark || !tiles.light) return;
    const desired = isDark ? tiles.dark : tiles.light;
    if (desired !== tiles.current) {
      if (tiles.current) map.removeLayer(tiles.current);
      desired.addTo(map);
      placeTileLayerRef.current.current = desired;
    }
  }, [isDark]);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="w-full px-4 transition-colors duration-200 flex-shrink-0">
          <div className="py-3 lg:py-2 border-b border-gray-200 dark:border-[var(--border-color)]">
          {/* Primera línea: Perfil y herramientas */}
          <div className="flex items-center gap-2 lg:gap-4">
            
            {/* Foto de perfil y nombre (ocultos en app; visibles en desktop lg+) */}
            <FotoPerfil
              imagen={user?.fotoPerfil || '/fp_default.webp'}
              alt={user?.nombre || 'Usuario'}
              className="hidden lg:block w-10 h-10 lg:w-12 lg:h-12 aspect-square rounded-lg overflow-hidden flex-shrink-0"
              onClick={() => setProfileUser(user)}
            />
            <span onClick={() => setProfileUser(user)} className="hidden cursor-pointer lg:inline-block text-base font-medium text-gray-900 dark:text-[var(--text-primary)] truncate max-w-[120px]">
              {user?.nombre || "Usuario"}
            </span>
            
            {/* Línea divisora (solo escritorio) */}
            <div className="hidden lg:block h-6 sm:h-8 w-px bg-gray-300 dark:bg-[var(--border-color)] mx-1 lg:mx-2"></div>
            
            {/* Herramientas: notificaciones */}
            <div className="flex items-center gap-1 sm:gap-3">

              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="relative p-2 sm:p-2 hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors duration-200 focus-visible:outline-none"
                    aria-label="Notificaciones"
                    >
                    <FiBell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-[var(--text-secondary)]" style={{ strokeWidth: 1 }} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
                    )}
                  </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                  <DropdownMenu.Content sideOffset={6} align="center" className="w-[420px] bg-white dark:bg-[var(--bg-primary)] rounded-lg shadow-lg ring-1 ring-black/5 overflow-hidden z-50 origin-top">
                    <div className="px-3 py-2 flex items-center justify-between border-b border-gray-100 dark:border-[var(--border-color)]">
                      <span className="text-sm font-medium text-gray-900 dark:text-[var(--text-primary)]">
                        Notificaciones {unreadCount > 0 && <span className="ml-1 text-xs text-[var(--text-tertiary)]">({unreadCount})</span>}
                      </span>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">Marcar todo leído</button>
                      )}
                    </div>

                    <div className="max-h-[520px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-3 py-6 text-center text-sm text-[var(--text-tertiary)]">Sin notificaciones</div>
                      ) : notifications.map((n) => (
                        <div key={n.id} className={`flex items-start gap-3 py-3 ${!n.leido ? 'pl-2 pr-3 border-l-2 border-red-500' : 'px-3'}`}>
                          <div className="w-8 h-8 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex-shrink-0 flex items-center justify-center">
                            <FiBell className="w-4 h-4 text-[var(--text-tertiary)]" style={{ strokeWidth: 1 }} />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col gap-2">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm text-gray-800 dark:text-[var(--text-primary)] leading-snug">
                                {n.tipo === 'solicitud_amistad' && 'Alguien te envió una solicitud de amistad'}
                                {n.tipo === 'solicitud_aceptada' && 'Tu solicitud de amistad fue aceptada'}
                                {!['solicitud_amistad','solicitud_aceptada'].includes(n.tipo) && n.tipo}
                              </p>
                              {!n.leido && <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1.5" />}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-[var(--text-tertiary)]">
                              {new Date(n.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {n.tipo === 'solicitud_amistad' && n.data?.solicitudId && !n.leido && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleAceptarSolicitud(n.data.solicitudId, n.id)}
                                  className="px-3 py-1.5 rounded-lg bg-[var(--text-primary)] text-[var(--bg-primary)] text-xs font-semibold hover:opacity-80 transition-opacity"
                                >
                                  Aceptar
                                </button>
                                <button
                                  onClick={() => handleRechazarSolicitud(n.data.solicitudId, n.id)}
                                  className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-secondary)] text-xs font-medium hover:text-[var(--text-primary)] transition-colors"
                                >
                                  Rechazar
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>             
            </div>

            {/* Divisor específico entre notificaciones y ubicación (solo app mode) */}
            <div className="lg:hidden block h-6 w-px bg-gray-300 dark:bg-[var(--border-color)] mx-2"></div>

            {/* Línea divisora - solo visible en pantallas grandes */}
            <div className="hidden lg:block h-8 w-px bg-gray-300 dark:bg-[var(--border-color)] mx-2"></div>

            <div className="flex">
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="flex items-center gap-2 p-2 sm:p-2 hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Seleccionar ubicación"
                title={(user?.ubicacionLabel) || location || 'Click para seleccionar ubicación'}
              >
                <FiMap className="w-5 h-5 text-gray-600 dark:text-[var(--text-secondary)]" style={{ strokeWidth: 1 }} />
                <div className="hidden lg:block flex-1 min-w-0 max-w-[260px]">
                  <div
                    role="navigation"
                    aria-label="breadcrumb"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {(() => {
                      // Mostrar `ubicacionLabel` preferentemente; si no existe, usar
                      // `user.ubicacion` (lat, lng) antes de caer en la ubicación en localStorage.
                      const label = user?.ubicacionLabel || user?.ubicacion || location;
                      if (!label) {
                        return (
                          <span style={{
                            color: 'var(--text-tertiary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            Click para seleccionar ubicación
                          </span>
                        );
                      }
                      const parts = String(label).split(/[<>]/).map(p => p.trim()).filter(Boolean);
                      return parts.map((part, i) => (
                        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <span style={{
                            maxWidth: i === parts.length - 1 ? '140px' : '90px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: i === parts.length - 1 ? 'var(--text-primary)' : 'var(--text-secondary)',
                            fontWeight: i === parts.length - 1 ? 700 : 500,
                            display: 'inline-block',
                            fontSize: i === parts.length - 1 ? '0.95rem' : '0.85rem'
                          }}>{part}</span>
                          {i < parts.length - 1 && (
                            <span style={{ margin: '0 6px', color: 'var(--text-tertiary)' }}>›</span>
                          )}
                        </span>
                      ));
                    })()}
                  </div>
                </div>
              </button>
            </div>

            <div className="hidden lg:block h-8 w-px bg-gray-300 dark:bg-[var(--border-color)] mx-2"></div>

            {/* Barra de búsqueda - solo visible en desktop */}
              <div className="hidden lg:block flex-1 max-w-md">
              <BarraBusqueda onSearch={(q) => { setQuery(q); setViewMode((v) => v === 'friends' ? 'friends' : 'all'); setSelectedCard(null); }} className="" />
            </div>

            {/* Configuración y Toggle de tema - esquina derecha */}
            <div className="ml-auto flex items-center gap-2">
              {/* Messages button - visible in app mode only */}
              <button onClick={() => setIsMessagesOpen(true)} className="lg:hidden p-2 rounded-md hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label="Mensajes">
                <FiMail className="w-5 h-5 text-gray-700 dark:text-[var(--text-secondary)]" style={{ strokeWidth: 1 }} />
              </button>
              {/* Theme toggle and config - desktop only */}
                <div className="hidden lg:flex items-center gap-2">
                <ThemeToggle />
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button className="flex items-center gap-2 px-3 py-1.5 sm:py-2 hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors duration-200" aria-label="Configuración">
                      <FiSettings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-[var(--text-secondary)]" style={{ strokeWidth: 1 }} />
                      <span className="text-sm font-medium text-gray-700 dark:text-[var(--text-primary)]">Configuración</span>
                    </button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content sideOffset={6} align="end" className="w-56 bg-white dark:bg-[var(--bg-primary)] rounded-lg shadow-lg ring-1 ring-black/5 overflow-hidden z-50 origin-top-right">
                      <div className="px-3 py-2 flex items-center justify-between border-b border-gray-100 dark:border-[var(--border-color)]">
                        <span className="text-sm font-medium text-gray-900 dark:text-[var(--text-primary)]">Configuración</span>
                      </div>
                      <div className="p-2">
                        <DropdownMenu.Item asChild>
                          <button
                            onClick={() => {
                              try { localStorage.removeItem('user'); } catch (e) {}
                              try { setUser && setUser(null); } catch (e) {}
                              setViewMode && setViewMode('all');
                              try { window.location.href = 'http://localhost:5173/'; } catch (e) { console.log('redirect failed', e); }
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-[var(--text-primary)] hover:bg-gray-50 rounded-md"
                          >
                            Cerrar sesión
                          </button>
                        </DropdownMenu.Item>
                      </div>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </div>
            </div>
          </div>

          {/* Segunda línea: Barra de búsqueda en app mode + icono de filtrar */}
            <div className="lg:hidden mt-3 sticky top-12 z-20 px-4">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <BarraBusqueda onSearch={(q) => { setQuery(q); setViewMode((v) => v === 'friends' ? 'friends' : 'all'); setSelectedCard(null); }} placeholder="Buscar en la Lobby..." />
              </div>
              <div className="flex-shrink-0">
                <DropdownFiltrarPor compact onSelect={(v) => { console.log('Filtro seleccionado', v); setIsFiltersOpen(false); }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Layout principal: Barra lateral + Contenido + Barra de mensajes */}
      <div className="flex flex-1 overflow-hidden">
        {/* Barra lateral - solo desktop (lg+) */}
          <div className="hidden lg:block">
          <BarraLateral
            onHome={() => {
              // Debug log to verify click reached handler
              try { console.debug('[BarraLateral] onHome clicked'); } catch (e) {}
              setViewMode('all');
              setSelectedCard(null);
              try { setProfileUser && setProfileUser(null); } catch (e) {}
              // Try SPA navigation first
              try { navigate('/lobby'); } catch (e) { console.warn('navigate failed', e); }
              // Fallback: if route didn't change after a short delay, force full navigation
              setTimeout(() => {
                try {
                  if (typeof window !== 'undefined' && window.location && window.location.pathname !== '/lobby') {
                    console.debug('[BarraLateral] navigate fallback to window.location');
                    window.location.href = '/lobby';
                  }
                } catch (e) { console.warn('fallback navigation failed', e); }
              }, 250);

              const mainEl = document.querySelector('main');
              try { if (mainEl && typeof mainEl.scrollTo === 'function') mainEl.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {}
            }}
            onFavorites={() => { setViewMode('favorites'); setSelectedCard(null); }}
            onSaved={() => { setViewMode('saved'); setSelectedCard(null); }}
            onCollections={() => { setViewMode('collections'); setSelectedCard(null); }}
            onFriends={() => { setViewMode('friends'); setSelectedCard(null); }}
            onCreate={() => setIsCreateModalOpen(true)}
          /> 
        </div>
        <div className="py-4">
          <div className="hidden lg:block h-full border-r border-gray-200 dark:border-[var(--border-color)]"></div>
        </div>
        {/* Contenido principal */}
        <main className="flex-1 overflow-y-auto">
          {/* Combined sticky header: main subheader + mini-header - desktop only */}
          {!profileUser && (
          <div className="hidden lg:block sticky top-0 z-50 bg-[var(--bg-primary)] backdrop-blur-sm shadow-sm">
            <div className="p-4">
              {/* Secciones de navegación (subheader) */}
              <div className="flex flex-wrap gap-3 sm:gap-6 justify-start sm:justify-center items-center">
                {/* Home moved to sidebar - keep subheader minimal */}
                <button
                  aria-label="Explorar"
                  onClick={() => { setViewMode('all'); setSelectedCard(null); }}
                  className="flex items-center gap-2 px-2 py-1 text-sm sm:text-base sm:px-4 sm:py-1.5 font-medium text-gray-700 dark:text-[var(--text-primary)] hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <FiCompass className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5" style={{ strokeWidth: 1 }} />
                  <span>Explorar</span>
                </button>
                <div className="hidden lg:block h-6 w-px bg-gray-300 dark:bg-[var(--border-color)]"></div>
                <button
                  aria-label="Tendencias"
                  onClick={() => { setViewMode('trending'); setSelectedCard(null); }}
                  className="flex items-center gap-2 px-2 py-1 text-sm sm:text-base sm:px-4 sm:py-1.5 font-medium text-gray-700 dark:text-[var(--text-primary)] hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <FiTrendingUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5" style={{ strokeWidth: 1 }} />
                  <span>Tendencias</span>
                </button>
              </div>
            </div>

            {/* Mini-header (inside same sticky container) */}
            <div className="px-4">
              <div className="flex flex-nowrap sm:flex-wrap gap-2 sm:gap-6 justify-start sm:justify-center items-center h-8 overflow-hidden border-t border-[var(--border-color)]">
                <button
                  onClick={() => setIsFiltersOpen(true)}
                  className="sm:hidden flex items-center gap-2 px-2 py-1 text-xs font-medium text-gray-700 dark:text-[var(--text-primary)] hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)] rounded-lg"
                  aria-label="Filtros"
                >
                  <FiFilter className="w-4 h-4" style={{ strokeWidth: 1 }} />
                  <span>Filtros</span>
                </button>
                {[
                  {
                    label: "Parques",
                    icon: (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 align-middle" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2C7.03 2 2.5 6.03 2.5 11c0 4.97 4.53 9 9.5 9s9.5-4.03 9.5-9c0-4.97-4.53-9-9.5-9zm0 2c3.87 0 7 3.13 7 7 0 3.87-3.13 7-7 7s-7-3.13-7-7c0-3.87 3.13-7 7-7zm0 3a4 4 0 100 8 4 4 0 000-8z"/></svg>
                    )
                  },
                  {
                    label: "Restaurantes",
                    icon: (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 align-middle" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 21v-2a4 4 0 014-4h8a4 4 0 014 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    )
                  },
                  {
                    label: "Cafés",
                    icon: (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 align-middle" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 19V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14"/><path d="M7 10h10M7 14h10"/></svg>
                    )
                  },
                  {
                    label: "Museos",
                    icon: (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 21V7a4 4 0 018 0v14"/><path d="M8 21h8"/></svg>
                    )
                  }
                ].map((cat, idx, arr) => (
                  <React.Fragment key={cat.label}>
                    <button aria-label={`Filtrar por ${cat.label}`} className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-4 text-xs sm:text-sm font-medium text-gray-700 dark:text-[var(--text-primary)] hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors duration-200 bg-transparent min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                      {cat.icon}
                      <span className="truncate whitespace-nowrap min-w-0">{cat.label}</span>
                    </button>
                    {idx < arr.length - 1 && (
                      <div className="h-6 w-px bg-gray-300 dark:bg-[var(--border-color)]"></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
            {/* Línea divisoria final */}
            <div className="px-4">
              <div className="border-b border-[var(--border-color)]"></div>
            </div>
          </div>
          )}

          {/* Contenido scrolleable */}
          <div className="p-4">
          
          {/* Lista de tarjetas o vista detalle (desktop) */}
          {profileUser ? (
            <PerfilUsuario 
              user={profileUser} 
              onClose={() => setProfileUser(null)} 
              onNavigateToPlace={(place, opts) => {
                setProfileUser(null);
                setSelectedCard(opts ? { ...place, _focusComentarioId: opts.comentarioId, _focusAction: opts.action } : place);
              }}
            />
          ) : selectedCard ? (
            <PerfilTarjetaUbicacion item={selectedCard} onBack={() => setSelectedCard(null)} />
          ) : (
            viewMode === 'friends' ? (
              <ListaAmigos query={query} onViewProfile={(person) => { setProfileUser(person); }} />
            ) : viewMode === 'favorites' || viewMode === 'saved' ? (
              <SavedList mode={viewMode === 'saved' ? 'saved' : 'favorites'} onSelect={(c) => setSelectedCard(c)} />
            ) : (
              <CardsList feedMode={viewMode} onSelect={setSelectedCard} query={query} children={children} />
            )
          )}
          </div>
        </main>

        {/* Barra de mensajes - oculta en móvil y tablets */}
        <div className="hidden lg:block">
          <BarraMensajes />
        </div>
      </div>

      {/* Sidebar removed - replaced by mobile navigation bar */}

      {/* Messages Drawer (mobile) */}
      <div className={`fixed inset-y-0 right-0 z-50 w-80 transform bg-white dark:bg-[var(--bg-primary)] shadow-lg transition-transform duration-200 ${isMessagesOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-[var(--text-primary)]">Mensajes</h3>
            <button onClick={() => setIsMessagesOpen(false)} className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)]">Cerrar</button>
          </div>
          <BarraMensajes />
        </div>
      </div>

      {/* Settings now provided as a compact dropdown (see header) */}

      {/* Filters Modal (mobile) */}
      <div className={`${isFiltersOpen ? 'fixed inset-0 z-50 flex items-center justify-center' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50" onClick={() => setIsFiltersOpen(false)}></div>
        <div className="relative z-60 w-full max-w-sm mx-4 bg-white dark:bg-[var(--bg-primary)] rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-[var(--border-color)] flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 dark:text-[var(--text-primary)]">Filtros</h4>
            <button onClick={() => setIsFiltersOpen(false)} className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)]">Cerrar</button>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-600">Aquí van los filtros (checkboxes y opciones).</p>
          </div>
        </div>
      </div>
      {/* Modal de ubicación - controlado por el botón del header */}
      <Ubicacion
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        ignoreUserInitial={false}
        onSaveLocation={undefined}
      />
      {/* ── Wizard: Crear lugar ── */}
      <div className={`${isCreateModalOpen ? 'fixed inset-0 z-50 flex items-center justify-center' : 'hidden'}`}>
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md" onClick={closeCreateModal} />

        {/* Modal */}
        <div className="relative z-60 w-full max-w-lg mx-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-[0_24px_64px_var(--shadow-color)] overflow-hidden flex flex-col">

          {/* Header */}
          <div className="px-6 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center justify-center flex-shrink-0">
                {createWizardStep === 1 ? (
                  <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" viewBox="0 0 24 24">
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                )}
              </div>
              <div>
                <h4 className="text-[15px] font-semibold text-[var(--text-primary)] leading-tight">
                  {createWizardStep === 1 ? 'Información del lugar' : 'Seleccionar ubicación'}
                </h4>
                <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">Paso {createWizardStep} de 2</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Step dots */}
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full transition-colors ${createWizardStep === 1 ? 'bg-[var(--text-secondary)]' : 'bg-[var(--border-color)]'}`} />
                <span className={`w-2 h-2 rounded-full transition-colors ${createWizardStep === 2 ? 'bg-[var(--text-secondary)]' : 'bg-[var(--border-color)]'}`} />
              </div>
              <button
                onClick={closeCreateModal}
                className="w-8 h-8 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" viewBox="0 0 24 24">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="mx-6 h-px bg-[var(--border-color)]" />

          {/* ── Paso 1: Info ── */}
          {createWizardStep === 1 && (
            <div className="px-6 py-6 flex flex-col gap-5">

              {/* Nombre */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-widest">
                  Nombre del lugar
                </label>
                <input
                  value={createNombre}
                  onChange={(e) => setCreateNombre(e.target.value)}
                  placeholder="Ej. Bar La Noria, Café Central..."
                  className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--text-tertiary)] transition-colors"
                />
              </div>

              {/* Foto */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-widest">
                  Foto
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-[var(--bg-primary)] border border-dashed border-[var(--border-color)] flex-shrink-0 overflow-hidden flex flex-col items-center justify-center gap-1.5">
                    {createImagePreview ? (
                      <img src={createImagePreview} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <svg className="w-6 h-6 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" viewBox="0 0 24 24">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="m21 15-5-5L5 21" />
                        </svg>
                        <span className="text-[10px] text-[var(--text-tertiary)]">Sin foto</span>
                      </>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="create-image"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] text-sm cursor-pointer hover:border-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" viewBox="0 0 24 24">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      Subir imagen
                    </label>
                    <input
                      id="create-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        try {
                          setCreateImagePreview(URL.createObjectURL(f));
                          const path = `places/${Date.now()}_${f.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
                          const url = await uploadImage(f, 'spotapp', path, { maxWidth: 500, quality: 0.8 });
                          setCreateImageFile(url);
                        } catch (err) {
                          console.error('[CreatePlace] upload error', err);
                          setCreateImageFile(null);
                        }
                      }}
                    />
                    <span className="text-[11px] text-[var(--text-tertiary)]">PNG, JPG, WEBP · máx. 5 MB</span>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-widest">
                  Descripción
                </label>
                <textarea
                  value={createDescripcion}
                  onChange={(e) => setCreateDescripcion(e.target.value)}
                  rows={3}
                  placeholder="Describe el lugar, qué lo hace especial..."
                  className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--text-tertiary)] resize-none transition-colors leading-relaxed"
                />
              </div>

              {/* Acciones paso 1 */}
              <div className="flex justify-end gap-3 pt-1">
                <button
                  onClick={closeCreateModal}
                  className="px-5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-secondary)] text-sm hover:text-[var(--text-primary)] hover:border-[var(--text-tertiary)] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setCreateWizardStep(2)}
                  className="px-6 py-2.5 rounded-xl bg-[var(--text-primary)] hover:opacity-80 text-[var(--bg-primary)] text-sm font-semibold flex items-center gap-2 transition-opacity"
                >
                  Siguiente
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

            </div>
          )}

          {/* ── Paso 2: Ubicación ── */}
          {createWizardStep === 2 && (
            <div className="flex flex-col">

              {/* Mapa */}
              <div ref={placeMapRef} className="h-80 w-full" />

              {/* Info + confirmar ubicación */}
              <div className="mx-5 h-px bg-[var(--border-color)]" />
              <div className="px-5 py-4 bg-[var(--bg-secondary)] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-widest">Coordenadas seleccionadas</span>
                    <span className="text-sm text-[var(--text-primary)] font-mono">
                      {createLocationTemp?.lat?.toFixed(5)}, {createLocationTemp?.longitud?.toFixed(5)}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setCreateLocationCoords({ lat: createLocationTemp?.lat, longitud: createLocationTemp?.longitud });
                      setCreateLocationLabel(`${createLocationTemp?.lat.toFixed(5)}, ${createLocationTemp?.longitud.toFixed(5)}`);
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      createLocationCoords?.lat === createLocationTemp?.lat && createLocationCoords?.longitud === createLocationTemp?.longitud
                        ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)]'
                        : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:text-[var(--text-primary)] hover:border-[var(--text-tertiary)]'
                    }`}
                  >
                    {createLocationCoords?.lat === createLocationTemp?.lat && createLocationCoords?.longitud === createLocationTemp?.longitud
                      ? '✓ Confirmada'
                      : 'Confirmar punto'}
                  </button>
                </div>
                <p className="text-[11px] text-[var(--text-tertiary)]">Toca o arrastra el marcador para ajustar la ubicación exacta.</p>
              </div>

              {/* Acciones paso 2 */}
              <div className="mx-5 h-px bg-[var(--border-color)]" />
              <div className="px-5 py-4 flex justify-between gap-3">
                <button
                  onClick={() => setCreateWizardStep(1)}
                  className="px-5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-secondary)] text-sm hover:text-[var(--text-primary)] hover:border-[var(--text-tertiary)] transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" viewBox="0 0 24 24">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Atrás
                </button>
                <button
                  onClick={handleCreatePlace}
                  disabled={isSubmittingPlace}
                  aria-busy={isSubmittingPlace}
                  className={`px-6 py-2.5 rounded-xl text-[var(--bg-primary)] text-sm font-semibold flex items-center gap-2 transition-opacity ${
                    isSubmittingPlace
                      ? 'bg-[var(--text-primary)] opacity-50 cursor-wait'
                      : 'bg-[var(--text-primary)] hover:opacity-80'
                  }`}
                >
                  {!isSubmittingPlace && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" viewBox="0 0 24 24">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  )}
                  {isSubmittingPlace ? 'Creando...' : 'Crear lugar'}
                </button>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* Mobile navigation bar (fixed, visible only on mobile) */}
      <BarraHerramientasMovil
        onExplore={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onSaved={() => { setViewMode('saved'); setSelectedCard(null); }}
        onCreate={() => setIsFiltersOpen(true)}
        onProfile={() => setProfileUser(user)}
        onSettings={() => {}}
      />
      {/* Floating Add Button (movible) */}
    </div>
  )
 };

 export default Lobby;

/**
 * Mezcla un array de lugares con slots de anuncios.
 * - Primer anuncio: no antes del índice 8
 * - Distancia aleatoria entre anuncios: 6–14 items
 * - colSpan aleatorio por anuncio: 2, 3 o 4
 * Estable por sesión porque se computa una sola vez por lista completa (allPlaces).
 */
function buildFeedWithAds(places) {
  if (!Array.isArray(places) || places.length === 0) return places;
  const AD_COL_SPANS = [2, 3, 4];
  const result = [];
  let adIdx = 0;
  // First ad: between index 8 and 11
  let nextAdAt = 8 + Math.floor(Math.random() * 4);

  for (let i = 0; i < places.length; i++) {
    if (i === nextAdAt) {
      result.push({
        type: 'ad',
        id: `ad-slot-${adIdx++}`,
        colSpan: AD_COL_SPANS[Math.floor(Math.random() * AD_COL_SPANS.length)],
      });
      // Next gap: 6–14 real items after this ad
      nextAdAt = i + 6 + Math.floor(Math.random() * 9);
    }
    result.push(places[i]);
  }
  return result;
}

/* Helper component: Cards list with infinite scroll (mobile) and responsive grid (desktop) */
function CardsList({ children, onSelect, query = '', feedMode = 'all' }){
  const { user } = useUser();
  const [cards, setCards] = useState([]);
  const [allPlaces, setAllPlaces] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cols, setCols] = useState(1);
  const pageRef = useRef(0);
  const containerRef = useRef(null);
  const rowsPerPageRef = useRef(3);
  // Show top ad 40% of the time — stable for this mount
  const [showTopAd] = useState(() => Math.random() > 0.6);
  // Ad positions computed once per full dataset load
  const adFeedRef = useRef(null);
  const adFeedSourceRef = useRef(null);

  // Reset pagination when query, feed mode, or user location changes
  useEffect(() => {
    pageRef.current = 0;
    setCards([]);
    setAllPlaces(null);
    setHasMore(true);
    // trigger initial load (loadMoreCards will be called by existing effect)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, feedMode, user?.lat, user?.lng]);

  useEffect(() => {
    const el = containerRef.current || document.body;

    function calculateCols() {
      const width = el.clientWidth || window.innerWidth;
      const estimated = Math.max(1, Math.floor(width / 220));
      setCols(estimated);
    }

    calculateCols();
    const ro = new ResizeObserver(() => calculateCols());
    if (containerRef.current) ro.observe(containerRef.current);

    // initial load
    loadMoreCards();

    return () => {
      try { if (containerRef.current) ro.unobserve(containerRef.current); } catch(e){}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const needed = cols * rowsPerPageRef.current;
    if (cards.length < needed && hasMore && !loading) {
      loadMoreCards();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cols]);

  // Ensure we load initial page when cards were reset (e.g., query change)
  useEffect(() => {
    if (cards.length === 0 && !loading && hasMore) {
      loadMoreCards();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards.length, loading, hasMore]);

  // load places from backend (once) and store in `allPlaces` for client-side pagination
  async function fetchAllPlaces() {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      let endpoint;
      if (feedMode === 'trending') {
        endpoint = `${API_URL}/places/trending?limit=200`;
      } else {
        const params = new URLSearchParams();
        if (Number.isFinite(Number(user?.lat)) && Number.isFinite(Number(user?.lng))) {
          params.set('lat', String(user.lat));
          params.set('lng', String(user.lng));
          params.set('radiusKm', '5');
        }
        endpoint = `${API_URL}/places/db${params.toString() ? `?${params.toString()}` : ''}`;
      }
      const res = await fetch(endpoint);
      if (!res.ok) {
        console.warn('Failed to fetch places', res.status);
        return null;
      }
      const data = await res.json();
      // normalize each place to expected card shape
      return data.map((p) => ({
        id: p.id,
        nombre: p.nombre || p.nombreLugar || `Lugar ${p.id}`,
        categoria: p.categoria || 'Lugar',
        descripcion: p.descripcion || '',
        imagen: (p.imagen && p.imagen.length) ? p.imagen : (p.fotos && p.fotos[0]) ? p.fotos[0] : '/examples/ensenada1.svg',
        calificacion: Number.isFinite(Number(p.calificacion)) ? Number(p.calificacion) : 0,
        vistas: feedMode === 'trending' ? (p.vistasUltimas24h ?? p.vistas ?? 0) : (p.vistas ?? 0),
        vistasTotales: p.vistas ?? 0,
        vistasUltimas24h: p.vistasUltimas24h ?? null,
        vistasUltimas1h: p.vistasUltimas1h ?? null,
        trendingScore: p.trendingScore ?? null,
        lat: p.lat ?? p.latitud,
        lng: p.lng ?? p.longitud,
        raw: p,
      }));
    } catch (e) {
      console.error('fetchAllPlaces error', e);
      return null;
    }
  }

  async function loadMoreCards(){
    if(loading || !hasMore) return;
    setLoading(true);
    // ensure we have loaded allPlaces once — use local fetched value immediately
    let source = allPlaces;
    if (source === null) {
      const fetched = await fetchAllPlaces();
      source = fetched || [];
      setAllPlaces(source);
    }

    // small delay to keep UX similar
    await new Promise(r => setTimeout(r, 200));
    const columns = cols || Math.max(1, Math.floor((containerRef.current?.clientWidth || window.innerWidth) / 220));
    const perPage = columns * rowsPerPageRef.current;
    const start = pageRef.current * perPage;
    const next = (source.slice(start, start + perPage)).map(p => ({ ...p }));
    setCards(prev => [...prev, ...next]);
    pageRef.current += 1;
    if ((source && pageRef.current * perPage >= source.length) || (pageRef.current >= 50)) setHasMore(false);
    setLoading(false);
  }

  function handleScroll(e){
    const el = e.target;
    if(!el) return;
    if(el.scrollTop + el.clientHeight >= el.scrollHeight - 300){
      loadMoreCards();
    }
  }

  // Build the mixed feed (places + ad slots) — recomputed when cards change,
  // but ad positions are anchored to the full allPlaces dataset via ref so they
  // don't shuffle as new pages load.
  const feedWithAds = useMemo(() => {
    const q = String(query || '').trim().toLowerCase();
    // When searching, don't inject ads
    if (q) return null;
    // Build or reuse stable ad layout for current dataset
    if (allPlaces !== adFeedSourceRef.current) {
      adFeedRef.current = buildFeedWithAds(allPlaces || []);
      adFeedSourceRef.current = allPlaces;
    }
    if (!adFeedRef.current) return cards;
    // Return only the portion of the annotated full feed that corresponds to
    // currently loaded cards (same slice length, preserving ad slots in range)
    const loadedIds = new Set(cards.map(c => c.id));
    const result = [];
    for (const item of adFeedRef.current) {
      if (item.type === 'ad') {
        // Only include an ad slot if it falls after at least one loaded card
        if (result.some(i => i.type !== 'ad')) result.push(item);
      } else if (loadedIds.has(item.id)) {
        result.push(item);
      }
    }
    return result;
  }, [cards, allPlaces, query]);

  function renderCard(c) {
    return (
      <div key={c.id} style={{ position: 'relative' }}>
        {feedMode === 'trending' && c.vistasUltimas1h > 0 && (
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500/90 text-white shadow backdrop-blur-sm pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            {c.vistasUltimas1h} en 1h
          </div>
        )}
        <TarjetaUbicacionIndividual
          id={c.id}
          userId={1}
          nombre={c.nombre}
          categoria={c.categoria}
          descripcion={c.descripcion}
          imagen={c.imagen}
          calificacion={c.calificacion}
          readOnlyRating={true}
          vistas={c.vistas}
          onClick={() => onSelect ? onSelect(c) : null}
        />
      </div>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="p-3 lg:p-6 pb-24 lg:pb-6"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px) + 5rem, 6rem)' }}
      >
        {/* Banner superior — aparece 40% de las veces entre categorías y el grid */}
        {showTopAd && (
          <div className="mb-4">
            <AdSenseBanner fullWidth height={90} />
          </div>
        )}

        <div
          className="grid gap-3 lg:gap-4"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))',
            gridAutoFlow: 'row dense',
          }}
        >
          {(() => {
            const q = String(query || '').trim().toLowerCase();

            // ── Búsqueda activa: sin anuncios ──────────────────────────────
            if (q) {
              const words = q.split(/\s+/).filter(Boolean);
              const scored = cards.map(c => {
                const haystack = [c.nombre, c.categoria, c.descripcion].join(' ').toLowerCase();
                let score = 0;
                for (const w of words) { if (haystack.includes(w)) score += 1; }
                return { c, score };
              }).filter(s => s.score > 0).sort((a, b) => b.score - a.score || String(a.c.nombre).localeCompare(String(b.c.nombre)));

              if (scored.length === 0 && !loading) {
                return <div className="col-span-full text-sm text-[var(--text-tertiary)]">No se encontraron resultados.</div>;
              }
              return scored.map(s => renderCard(s.c));
            }

            // ── Feed normal: lugares + anuncios ───────────────────────────
            if (!feedWithAds || (feedWithAds.length === 0 && !loading)) {
              return <div className="col-span-full text-sm text-[var(--text-tertiary)]">No hay elementos.</div>;
            }

            return feedWithAds.map(item => {
              if (item.type === 'ad') {
                return <AdSenseBanner key={item.id} colSpan={item.colSpan} />;
              }
              return renderCard(item);
            });
          })()}
        </div>
        {children}
        <div className="mt-6 flex justify-center items-center">
          {loading && <div className="text-sm text-gray-500">Cargando...</div>}
        </div>
      </div>
    </>
  );
}
