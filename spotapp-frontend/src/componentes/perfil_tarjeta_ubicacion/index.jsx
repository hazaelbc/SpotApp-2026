import React, { useMemo, useState, useEffect, useRef } from 'react';
import { FiArrowLeft, FiMapPin, FiStar, FiBookmark, FiShare2 } from 'react-icons/fi';
import { getFavorites, getSaved, isFavorited, isSaved, toggleFavorite, toggleSaved } from '../../utils/bookmarks';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, Marker } from 'react-leaflet';
import L from 'leaflet';
import { useUser } from '../../userProvider';
import '../Ubicacion/ubicacion.css';
import BuzonResenas from '../buzon_resenas';
import GaleriaEfimera from '../galeria_efimera';
import '../../../node_modules/leaflet/dist/leaflet.css';

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

  if(!item) return null;


  const defaultCenter = useMemo(() => [31.8667, -116.5964], []); // Ensenada

  // Detect theme (tailwind 'dark' class or prefers-color-scheme)
  const [isDark, setIsDark] = useState(() => {
    if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) return true;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return true;
    return false;
  });

  useEffect(() => {
    try {
      setIsFav(isFavorited(item.id));
      setIsSavedState(isSaved(item.id));
    } catch (e) {}
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
      obs.disconnect();
      if (mq && mq.removeEventListener) mq.removeEventListener('change', update);
      else if (mq && mq.removeListener) mq.removeListener(update);
    };
  }, []);

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
    const url = `https://router.project-osrm.org/route/v1/driving/${origin[1]},${origin[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson`;
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) return [];
    const data = await response.json();
    const coords = data?.routes?.[0]?.geometry?.coordinates;
    if (!Array.isArray(coords)) return [];
    return coords.map(([lng, lat]) => [lat, lng]);
  }

  async function handleRouteClick(){
    if (routeLoading) return;
    setRouteLoading(true);
    setRouteError('');
    setRouteCoords([]);

    try {
      const destination = await getDestinationCoords();
      const resolvedDestination = destination || defaultCenter;
      setDestinationPos(resolvedDestination);
      setShowMap(true);

      if (!navigator.geolocation) {
        setUserPos(null);
        setRouteError('No se pudo obtener tu ubicación actual.');
        setRouteLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const origin = [position.coords.latitude, position.coords.longitude];
          setUserPos(origin);

          try {
            const route = await getRoute(origin, resolvedDestination);
            if (route.length > 0) {
              setRouteCoords(route);
              // Animation will start via effect watching `routeCoords`
            } else {
              setRouteCoords([origin, resolvedDestination]);
              setRouteError('No se pudo calcular ruta vial exacta. Mostrando línea directa.');
            }
          } catch {
            setRouteCoords([origin, resolvedDestination]);
            setRouteError('No se pudo calcular ruta vial exacta. Mostrando línea directa.');
          }

          setRouteLoading(false);
        },
        () => {
          setUserPos(null);
          setRouteError('Activa ubicación para ver la ruta desde tu posición actual.');
          setRouteLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 7000,
          maximumAge: 120000,
        },
      );
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

  function handleToggleFav(e){
    try{ e && e.stopPropagation(); }catch(e){}
    try{
      const next = toggleFavorite(item);
      setIsFav(!!next);
    }catch(e){ console.warn(e); }
  }

  function handleToggleSaved(e){
    try{ e && e.stopPropagation(); }catch(e){}
    try{
      const next = toggleSaved(item);
      setIsSavedState(!!next);
    }catch(e){ console.warn(e); }
  }

  // For demo: build a larger set of images to exercise the gallery behavior
  const demoImages = useMemo(() => {
    const base = Array.isArray(item?.fotos) && item.fotos.length ? item.fotos.slice() : [item.imagen].filter(Boolean);
    // add many placeholder images (picsum) to test rotation/layouts — made larger per request
    const placeholders = Array.from({ length: 48 }, (_, i) => `https://picsum.photos/seed/spotapp-${i}/1000/800`);
    // ensure uniqueness and avoid duplicates
    const combined = [...base, ...placeholders].filter(Boolean);
    return Array.from(new Set(combined));
  }, [item]);

  return (
    <div className="p-4 lg:p-6">
      <button onClick={onBack} className="mb-4 inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:underline">
        <FiArrowLeft /> Volver
      </button>

      <div className="bg-[var(--bg-secondary)] dark:bg-[var(--bg-secondary)] rounded-lg overflow-hidden shadow">
        <div className="w-full h-56 lg:h-72 bg-gray-100">
          <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />
        </div>

        <div className="p-4 lg:p-6">
          <div className="flex items-start gap-4 justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-[var(--text-primary)] truncate">{item.nombre}</h1>
                {typeof item.calificacion === 'number' && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-lg" style={{ color: 'rgba(255,193,7,0.95)' }}>
                      {item.calificacion % 1 === 0 ? '★' : '✦'}
                    </span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{item.calificacion.toFixed(1)}</span>
                  </div>
                )}
              </div>
              <div className="mt-1 text-sm text-[var(--text-secondary)] flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleRouteClick}
                  disabled={routeLoading}
                  className="inline-flex items-center gap-1 hover:text-[var(--accent-blue)] disabled:opacity-70"
                  aria-label="Ver ruta más corta"
                  title="Mostrar ruta en el mapa"
                >
                  <FiMapPin />
                  <span>{routeLoading ? 'Calculando ruta...' : 'Cómo llegar'}</span>
                </button>
                <span className="inline-flex items-center gap-1">{item.categoria}</span>
                <span className="inline-flex items-center gap-1">{item.vistas} vistas</span>
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
              <button
                type="button"
                className="p-2 text-[var(--text-secondary)] hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
                aria-label="Compartir"
                title="Compartir"
              >
                <FiShare2 className="w-5 h-5" style={{ strokeWidth: 1 }} />
              </button>
            </div>
          </div>

          <p className="mt-4 text-[var(--text-primary)]">{item.descripcion}</p>

          <div className="mt-6">
            <GaleriaEfimera images={demoImages} intervalSeconds={10} crop={true} maxSlots={8} />
          </div>

          {showMap && (
            <section className="mt-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Ruta al lugar</h2>
              {routeError && <p className="mt-2 text-sm text-[var(--text-tertiary)]">{routeError}</p>}
              <div className="mt-3 rounded-lg overflow-hidden border border-[var(--border-color)]">
                <MapContainer
                  center={destinationPos || defaultCenter}
                  zoom={13}
                  style={{ height: '320px', width: '100%' }}
                >
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
                    <Marker position={userPos} icon={createUserDivIcon()}>
                      <Popup>Tu ubicación</Popup>
                    </Marker>
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
          )}

          <section className="mt-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Reseñas</h2>
            <div className="mt-3">
              <BuzonResenas placeId={item.id} />
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
