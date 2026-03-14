import React, { useState, useEffect, useRef } from "react";
import { renderToStaticMarkup } from 'react-dom/server';
import { FaUtensils, FaCoffee, FaShoppingCart, FaBeer, FaStore } from 'react-icons/fa';
import { useUser } from "../../userProvider";
import { LuMap } from "react-icons/lu";
import L from "leaflet";
import "../../../node_modules/leaflet/dist/leaflet.css";
import "./ubicacion.css";
import { useTheme } from "../../contexts/themeContext";

const estadosNorte = [
    {
      nombre: "Baja California",
      ciudades: [
        { nombre: "Tijuana", coordenadas: [32.5149, -117.0382] },
        { nombre: "Mexicali", coordenadas: [32.6245, -115.4523] },
        { nombre: "Ensenada", coordenadas: [31.8667, -116.5964] },
      ],
    },
    {
      nombre: "Sonora",
      ciudades: [
        { nombre: "Hermosillo", coordenadas: [29.0729, -110.9559] },
        { nombre: "Nogales", coordenadas: [31.3086, -110.9422] },
        { nombre: "Ciudad Obregón", coordenadas: [27.4828, -109.9304] },
      ],
    },
    {
      nombre: "Chihuahua",
      ciudades: [
        { nombre: "Chihuahua", coordenadas: [28.6353, -106.0889] },
        { nombre: "Ciudad Juárez", coordenadas: [31.6904, -106.4245] },
        { nombre: "Delicias", coordenadas: [28.1901, -105.4701] },
      ],
    },
    {
      nombre: "Coahuila",
      ciudades: [
        { nombre: "Saltillo", coordenadas: [25.4381, -100.9781] },
        { nombre: "Torreón", coordenadas: [25.5428, -103.4068] },
        { nombre: "Piedras Negras", coordenadas: [28.7041, -100.5235] },
      ],
    },
    {
      nombre: "Nuevo León",
      ciudades: [
        { nombre: "Monterrey", coordenadas: [25.6866, -100.3161] },
        { nombre: "San Nicolás", coordenadas: [25.7500, -100.3000] },
        { nombre: "Guadalupe", coordenadas: [25.6768, -100.2565] },
      ],
    },
    {
      nombre: "Tamaulipas",
      ciudades: [
        { nombre: "Reynosa", coordenadas: [26.0922, -98.2779] },
        { nombre: "Matamoros", coordenadas: [25.8693, -97.5027] },
        { nombre: "Nuevo Laredo", coordenadas: [27.4763, -99.5164] },
      ],
    },
  ];

const Ubicacion = ({ isOpen: controlledIsOpen, onClose: controlledOnClose } = {}) => {
  const { user, setUser } = useUser(); // Accede al usuario desde el contexto
  const [ubicacion, setUbicacion] = useState(user?.ubicacion || "00"); // Estado local para manejar la ubicación
  const [internalModalVisible, setInternalModalVisible] = useState(false); // Estado interno
  // Si el padre pasa isOpen, usamos ese valor (modo controlado); si no, usamos el estado interno
  const modalVisible = controlledIsOpen !== undefined ? controlledIsOpen : internalModalVisible;
  const [pantalla, setPantalla] = useState(1); // Controla la pantalla del modal
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("");
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState("");
  const [paisSeleccionado, setPaisSeleccionado] = useState('Mexico');
  const [ubicacionLabel, setUbicacionLabel] = useState(user?.ubicacionLabel || '');
  const [map, setMap] = useState(null); // Estado para el mapa
  const [marker, setMarker] = useState(null); // Estado para el marcador
  const tileLayerRef = useRef({ light: null, dark: null, current: null });
  const [mensaje, setMensaje] = useState("");
  const [noPOI, setNoPOI] = useState(false);
  const { isDark } = useTheme();
  const [loadingPosition, setLoadingPosition] = useState(false);
  

  const handleAbrirModal = () => {
    setInternalModalVisible(true);
    setPantalla(1);
    document.body.style.overflow = "hidden";
  };
  const resetLeafletContainer = (id) => {
    const container = document.getElementById(id);
    if (container && container._leaflet_id) {
      container._leaflet_id = null;
    }
  };

  const handleCerrarModal = () => {
    if (map) {
      map.remove();
      setMap(null);
    }
    resetLeafletContainer("map-ubicacion");
    document.body.style.overflow = "";
    if (controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalModalVisible(false);
    }
  };
// punto de retorno
  const handleGuardarUbicacion = async () => {
    // Use marker position if available, otherwise fall back to ubicacion text
    let latitud;
    let longitud;
    if (marker && typeof marker.getLatLng === 'function') {
      const ll = marker.getLatLng();
      latitud = ll.lat;
      longitud = ll.lng;
    } else {
      const coordRegex = /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/;
      if (!coordRegex.test(ubicacion)) {
        alert('No se ha seleccionado una ubicación. Usa "Usar mi ubicación" o mueve el marcador en el mapa.');
        return;
      }
      [latitud, longitud] = ubicacion.split(',').map(Number);
    }

    try {
      const response = await fetch(`http://localhost:8080/user-ubicacion/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitud, longitud, ubicacionLabel: ubicacionLabel || '' }),
      });
      if (response.ok) {
        // ensure label is up-to-date before updating local user
        try {
          const built = await reverseGeocodeAndFill(latitud, longitud);
          const labelToSave = built || ubicacionLabel || '';
          setUser({ ...user, ubicacion: `${latitud.toFixed(6)}, ${longitud.toFixed(6)}`, ubicacionLabel: labelToSave });
        } catch(e) {
          setUser({ ...user, ubicacion: `${latitud.toFixed(6)}, ${longitud.toFixed(6)}`, ubicacionLabel });
        }
      } else {
        console.error('Error al actualizar la ubicación:', response.status);
      }
    } catch (err) { console.error('Network error', err); }

    handleCerrarModal();
  };

  const handleSiguientePantalla = () => {
    if (estadoSeleccionado && ciudadSeleccionada) {
      const estado = estadosNorte.find((estado) => estado.nombre === estadoSeleccionado);
      const ciudad = estado.ciudades.find((ciudad) => ciudad.nombre === ciudadSeleccionada);
  
      if (ciudad && ciudad.coordenadas) {
        setPantalla(2); // Cambia a la pantalla del mapa
        setUbicacion(`${ciudad.coordenadas[0]}, ${ciudad.coordenadas[1]}`); // Actualiza la ubicación
      } else {
        alert("No se encontraron coordenadas para la ciudad seleccionada.");
      }
    } else {
      alert("Por favor selecciona un estado y una ciudad.");
    }
  };
  
  useEffect(() => {
    if (modalVisible) {
      const container = document.getElementById("map-ubicacion");

      // Limpia el contenedor si ya tiene un mapa asociado
      if (container._leaflet_id) {
        container._leaflet_id = null;
      }

      // Verifica que la ubicación sea válida; si no, usa coords por defecto para centrar el mapa
      const coordRegex = /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/;
      let lat;
      let lng;
      if (coordRegex.test(ubicacion)) {
        [lat, lng] = ubicacion.split(",").map(Number);
      } else {
        // no setear el estado global aquí — solo usar coordenadas por defecto para inicializar el mapa
        lat = 19.432608;
        lng = -99.133209;
      }

      // Inicializa el mapa
      const mapInstance = L.map("map-ubicacion", { zoomControl: false }).setView([lat, lng], 13);

      // Create both dark and light tile layers, but add only the one matching app theme
      // Use a less-ink, more gray dark tiles (Stadia Alidade Smooth Dark)
      const darkTiles = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; Stadia Maps &copy; OpenMapTiles &copy; OpenStreetMap contributors',
        maxZoom: 19
      });

      const lightTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      });

      // store tile layers for later swapping
      tileLayerRef.current.dark = darkTiles;
      tileLayerRef.current.light = lightTiles;

      // add initial tile layer according to theme
      if (isDark) {
        darkTiles.addTo(mapInstance);
        tileLayerRef.current.current = darkTiles;
      } else {
        lightTiles.addTo(mapInstance);
        tileLayerRef.current.current = lightTiles;
      }

      // Add default zoom control (positioned top left to make room for custom controls)
      L.control.zoom({ position: 'topleft' }).addTo(mapInstance);

      // Scale control (bottom left)
      L.control.scale({ position: 'bottomleft' }).addTo(mapInstance);

      // Fullscreen and locate custom controls
      const FullscreenControl = L.Control.extend({
        onAdd: function(map) {
          const btn = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom');
          btn.title = 'Toggle fullscreen';
          btn.innerHTML = '&#x26F6;';
          L.DomEvent.on(btn, 'click', function(e){ L.DomEvent.stopPropagation(e); toggleMapFullscreen(); });
          L.DomEvent.disableClickPropagation(btn);
          return btn;
        }
      });
      new FullscreenControl({ position: 'topright' }).addTo(mapInstance);

      const LocateControl = L.Control.extend({
        onAdd: function(map) {
          const btn = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom');
          btn.title = 'Centrar en mi ubicación';
          btn.innerHTML = '&#x1F4CD;';
          L.DomEvent.on(btn, 'click', function(e){ L.DomEvent.stopPropagation(e); handleUseMyLocation(); });
          L.DomEvent.disableClickPropagation(btn);
          return btn;
        }
      });
      new LocateControl({ position: 'topright' }).addTo(mapInstance);

      // (map style toggle removed to simplify modal - user requested minimal options)

      // create custom DivIcon for marker (uses user photo if available)
      // sanitize user image: avoid external placeholder hosts that may fail in offline/dev
      let userImg = '/fp_default.webp';
      try {
        const raw = (typeof user !== 'undefined' && user?.fotoPerfil) ? user.fotoPerfil : '';
        if (raw && typeof raw === 'string' && !/placeholder\.com/i.test(raw)) {
          userImg = raw;
        }
      } catch (e) { userImg = '/fp_default.webp'; }
      const userName = (typeof user !== 'undefined' && user?.nombre) ? user.nombre : 'Yo';
      const html = `<div class="div-marker"><div class="avatar"><img src="${userImg}" alt="marker"/></div><div class="marker-tip"></div></div>`;
      const divIcon = L.divIcon({ html, className: 'custom-div-icon', iconSize: [48, 56], iconAnchor: [24, 56] });

      // Crea o actualiza el marcador
      const newMarker = L.marker([lat, lng], { draggable: true, icon: divIcon }).addTo(mapInstance);
      setMarker(newMarker);

      // Escucha el evento de arrastre del marcador
      newMarker.on("dragend", async (e) => {
        const { lat, lng } = e.target.getLatLng();
        const latn = lat.toFixed(6);
        const lngn = lng.toFixed(6);
        setUbicacion(`${latn}, ${lngn}`); // Actualiza la ubicación con las coordenadas precisas
        await reverseGeocodeAndFill(lat, lng);
      });

      // Escucha clics en el mapa para mover el marcador
      mapInstance.on("click", async (e) => {
        const { lat, lng } = e.latlng;
        newMarker.setLatLng([lat, lng]); // Mueve el marcador al lugar clicado
        setUbicacion(`${lat.toFixed(6)}, ${lng.toFixed(6)}`); // Actualiza la ubicación
        await reverseGeocodeAndFill(lat, lng);
      });

      // helper to toggle fullscreen style on the map container
      function toggleMapFullscreen(){
        const el = document.getElementById('map-ubicacion');
        if(!el) return;
        if(el.classList.contains('fullscreen')){
          el.classList.remove('fullscreen');
        } else {
          el.classList.add('fullscreen');
        }
        setTimeout(() => { try { mapInstance.invalidateSize(); } catch(e){} }, 200);
      }

      setMap(mapInstance);

      // Fetch POIs from backend (proxy to Overpass) for current viewport
      async function fetchPOIs() {
        try {
          setNoPOI(false);
          const b = mapInstance.getBounds();
          const bbox = `${b.getSouth()},${b.getWest()},${b.getNorth()},${b.getEast()}`;
          // call backend endpoint which proxies Overpass for security and CORS
          // request default categories: restaurant,cafe,supermarket
          const res = await fetch(`http://localhost:8080/places?bbox=${encodeURIComponent(bbox)}&categories=restaurant,cafe,supermarket`);
          if (!res.ok) {
            console.log('places fetch status', res.status);
            setNoPOI(true);
            return;
          }
          const features = await res.json();
          const featArray = Array.isArray(features) ? features : (features?.features || []);

          // determine reference point for radius checks: marker position if present, otherwise map center
          const ref = (marker && typeof marker.getLatLng === 'function') ? marker.getLatLng() : mapInstance.getCenter();
          const refLat = ref.lat;
          const refLng = ref.lng;

          // haversine distance in kilometers
          const haversineKm = (lat1, lon1, lat2, lon2) => {
            const toRad = (v) => (v * Math.PI) / 180;
            const R = 6371; // km
            const dLat = toRad(lat2 - lat1);
            const dLon = toRad(lon2 - lon1);
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c;
          };

          // check if any feature lies within 2 km of reference point
          let anyWithin2km = false;
          for (const f of featArray) {
            let latF = null;
            let lonF = null;
            if (f.geometry && Array.isArray(f.geometry.coordinates)) {
              lonF = f.geometry.coordinates[0];
              latF = f.geometry.coordinates[1];
            } else if (f.lat && f.lon) {
              latF = f.lat; lonF = f.lon;
            } else if (f.center && f.center.lat && f.center.lon) {
              latF = f.center.lat; lonF = f.center.lon;
            }
            if (latF != null && lonF != null) {
              const d = haversineKm(refLat, refLng, latF, lonF);
              if (d <= 2) { anyWithin2km = true; break; }
            }
          }

          console.log('places response', res.status, featArray.length, 'anyWithin2km', anyWithin2km);
          setNoPOI(!anyWithin2km);

          // remove previous layer
          if (mapInstance._poiLayer) mapInstance.removeLayer(mapInstance._poiLayer);
          // helper: detect a simple category for styling
          const detectCategory = (feature) => {
            const tags = feature.properties?.tags || {};
            if (tags.amenity === 'restaurant' || tags.cuisine) return 'restaurant';
            if (tags.amenity === 'cafe') return 'cafe';
            if (tags.shop === 'supermarket') return 'supermarket';
            if (tags.amenity === 'bar') return 'bar';
            if (tags.shop === 'convenience') return 'convenience';
            return 'default';
          };

          const iconForCategory = (cat) => {
            switch (cat) {
              case 'restaurant': return { Icon: FaUtensils, color: '#E9573F' };
              case 'cafe': return { Icon: FaCoffee, color: '#8B5CF6' };
              case 'supermarket': return { Icon: FaShoppingCart, color: '#10B981' };
              case 'bar': return { Icon: FaBeer, color: '#F59E0B' };
              case 'convenience': return { Icon: FaStore, color: '#06B6D4' };
              default: return { Icon: FaUtensils, color: 'var(--accent-green)' };
            }
          };

          const makeDivIcon = (feature) => {
            const cat = detectCategory(feature);
            const { Icon, color } = iconForCategory(cat);
            const svg = renderToStaticMarkup(React.createElement(Icon, { color, size: 18 }));
            const html = `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;color:${color}">${svg}</div>`;
            return L.divIcon({ html, className: 'poi-div-icon', iconSize: [28, 28], iconAnchor: [14, 14] });
          };

          mapInstance._poiLayer = L.geoJSON(features, {
            pointToLayer: (feature, latlng) => L.marker(latlng, { icon: makeDivIcon(feature) }),
            onEachFeature: (feature, layer) => {
              const name = feature.properties?.tags?.name || 'Lugar';
              const info = Object.entries(feature.properties?.tags || {}).slice(0,5).map(([k,v]) => `${k}: ${v}`).join('<br/>');
              layer.bindPopup(`<strong>${name}</strong><br/>${info}`);
            }
          }).addTo(mapInstance);
        } catch (e) {
          // ignore POI errors silently but mark state for the UI
          console.error('fetchPOIs error', e);
          setNoPOI(true);
        }
      }

      // initial load and reload on moveend
      fetchPOIs();
      mapInstance.on('moveend', () => { fetchPOIs(); });

      // Asegúrate de que el mapa se renderice correctamente
      setTimeout(() => {
        mapInstance.invalidateSize();
      }, 100);
    }

    return () => {
      if (map) {
        map.remove();
        setMap(null);
      }
    };
  }, [modalVisible]);

  // Swap tile layer when app theme changes
  useEffect(() => {
    if (!map || !tileLayerRef.current) return;
    const desired = isDark ? tileLayerRef.current.dark : tileLayerRef.current.light;
    if (!desired) return;
    try {
      const cur = tileLayerRef.current.current;
      if (cur !== desired) {
        if (cur) map.removeLayer(cur);
        desired.addTo(map);
        tileLayerRef.current.current = desired;
        setTimeout(() => { try { map.invalidateSize(); } catch(e){} }, 200);
      }
    } catch (e) {
      console.error('Error swapping tile layers by theme', e);
    }
  }, [isDark, map]);
  
  const encontrarEstadoYCiudad = (latitud, longitud) => {
    const rad = (x) => (x * Math.PI) / 180; // Convierte grados a radianes

    const calcularDistancia = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Radio de la Tierra en kilómetros
      const dLat = rad(lat2 - lat1);
      const dLon = rad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // Distancia en kilómetros
    };

    let estadoCercano = "";
    let ciudadCercana = "";
    let distanciaMinima = Infinity;

    for (const estado of estadosNorte) {
      for (const ciudad of estado.ciudades) {
        const distancia = calcularDistancia(
          latitud,
          longitud,
          ciudad.coordenadas[0],
          ciudad.coordenadas[1]
        );

        if (distancia < distanciaMinima) {
          distanciaMinima = distancia;
          estadoCercano = estado.nombre;
          ciudadCercana = ciudad.nombre;
        }
      }
    }

    if (distanciaMinima !== Infinity) {
      return { estado: estadoCercano, ciudad: ciudadCercana };
    }

    return { estado: "", ciudad: "" }; // Si no se encuentra, devuelve valores vacíos
  };

  useEffect(() => {
    const fetchUbicacion = async () => {
      try {
        const response = await fetch(`http://localhost:8080/user-ubicacion/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.latitud && data.longitud) {
            const { estado, ciudad } = encontrarEstadoYCiudad(data.latitud, data.longitud);
            setUbicacion(`${data.latitud}, ${data.longitud}`); // Actualiza la ubicación
            setEstadoSeleccionado(estado); // Actualiza el estado seleccionado
            setCiudadSeleccionada(ciudad); // Actualiza la ciudad seleccionada
            // set a compact label when possible
            if (ciudad || estado) {
              const labelParts = [];
              if (ciudad) labelParts.push(ciudad);
              if (estado) labelParts.push(estado);
              labelParts.push('Mexico');
              setUbicacionLabel(labelParts.join(' < '));
            }
            // if backend returns a stored compact label, use it (overrides the constructed one)
            if (data.ubicacionLabel) setUbicacionLabel(data.ubicacionLabel);
          }
        } else {
          console.error("Error al recuperar la ubicación:", response.status);
        }
      } catch (error) {
        console.error("Error de red al recuperar la ubicación:", error);
      }
    };
  
    fetchUbicacion();
  }, [user.id]);

  // Reverse geocode using Nominatim to fill state/city from coords
  async function reverseGeocodeAndFill(lat, lng) {
    try {
      setMensaje('Buscando dirección...');
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'es' } });
      if (!res.ok) return;
      const data = await res.json();
      const addr = data.address || {};
      const state = addr.state || addr.region || '';
      const city = addr.city || addr.town || addr.village || addr.municipality || '';
      const country = addr.country || 'Mexico';
      if (state) setEstadoSeleccionado(state);
      if (city) setCiudadSeleccionada(city);
      if (country) setPaisSeleccionado(country);
      // build compact label: City < State < Country
      if (city || state || country) {
        const labelParts = [];
        if (city) labelParts.push(city);
        if (state) labelParts.push(state);
        if (country) labelParts.push(country);
        const built = labelParts.join(' < ');
        setUbicacionLabel(built);
        return built;
      }
      return '';
    } catch (err) {
      console.error('reverseGeocode error', err);
      return '';
    } finally {
      setMensaje('');
    }
  }

  // Use browser geolocation to get quick position, center map and reverse-geocode
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation no está disponible en este navegador.');
      return;
    }
    setLoadingPosition(true);
    setMensaje('Obteniendo ubicación...');
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const coordStr = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setUbicacion(coordStr);
      setPantalla(2);
      // try to center map if exists
      setTimeout(() => {
        try {
          if (map) {
            map.setView([lat, lng], 13);
            if (marker) {
              marker.setLatLng([lat, lng]);
            } else {
              const m = L.marker([lat, lng], { draggable: true }).addTo(map);
              setMarker(m);
              m.on('dragend', async (e) => {
                const { lat: nl, lng: nlng } = e.target.getLatLng();
                setUbicacion(`${nl.toFixed(6)}, ${nlng.toFixed(6)}`);
                await reverseGeocodeAndFill(nl, nlng);
              });
            }
          }
        } catch (e) {
          // ignore
        }
      }, 300);
      await reverseGeocodeAndFill(lat, lng);
      setLoadingPosition(false);
      setMensaje('');
    }, (err) => {
      setLoadingPosition(false);
      setMensaje('');
      alert('No se pudo obtener la ubicación: ' + (err.message || err.code));
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
  };

  // permission diagnostic removed to keep modal minimal; we still handle geolocation errors on attempt
  
  return (
    <div>
      {/* Trigger: solo visible en modo no-controlado (ej: categorias.jsx) */}
      {controlledIsOpen === undefined && (
        <div
          className="flex items-center cursor-pointer text-[var(--text-tertiary)] text-base transition-colors"
          onClick={handleAbrirModal}
        >
          <LuMap className="mr-2 text-lg text-[var(--text-tertiary)]" />
          {ubicacionLabel
            ? ubicacionLabel
            : (ubicacion === "00" || !estadoSeleccionado || !ciudadSeleccionada
              ? "Agrega una ubicación"
              : `${ciudadSeleccionada} < ${estadoSeleccionado} < ${paisSeleccionado}`)}
        </div>
      )}
  
      {modalVisible && (
        <div className={`fixed inset-0 ${isDark ? 'bg-black/60' : 'bg-black/35'} backdrop-blur-sm z-50 flex justify-center items-center p-4`}>
          <div className={`flex flex-col items-center justify-center p-5 rounded-lg shadow-lg w-[min(800px,90vw)] max-h-[90vh] overflow-auto bg-[var(--bg-secondary)] text-[var(--text-primary)]`}>
            <h2 className="text-xl ml-2 font-semibold text-[var(--text-primary)]">Selecciona tu estado, ciudad y ubicación</h2>
            <div className="flex flex-col gap-1 w-full m-0 py-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-center justify-center gap-1 sm:gap-2 w-full mx-auto py-0 px-2 max-w-[calc(100%-32px)]">
                <div className="w-full sm:w-auto flex-shrink-0">
                  <button
                    onClick={handleUseMyLocation}
                    className="w-full sm:w-auto px-4 py-1.5 text-sm font-medium h-8 rounded-md bg-[var(--accent-green)] hover:bg-[var(--accent-green-hover)] text-white transition disabled:opacity-70 whitespace-nowrap sm:min-w-[120px]"
                    disabled={loadingPosition}
                  >
                    {loadingPosition ? 'Obteniendo...' : 'Usar mi ubicación'}
                  </button>
                </div>
                <div className="w-full sm:w-auto mt-1 sm:mt-0 text-sm text-[var(--text-secondary)] font-light leading-tight truncate sm:whitespace-normal sm:overflow-visible sm:text-left text-center">No compartas tu ubicación exacta; mueve el marcador para indicar una posición.</div>
              </div>
            </div>
            {/* (Seleccionar ciudad eliminado - ahora el usuario puede arrastrar el marcador para indicar una ubicación aproximada) */}
            
  
            {/* Mapa (envoltorio relativo para overlays dentro del mapa) */}
            <div className="relative w-full mt-3">
              <div id="map-ubicacion" className="h-96 w-full rounded-lg shadow-lg overflow-hidden bg-[var(--bg-tertiary)] border-[var(--border-color)]"></div>
              {noPOI && (
                <div className="absolute top-3 left-3 z-50 max-w-xs bg-[var(--bg-secondary)]/95 border border-[var(--border-color)] p-2 rounded-md flex items-start gap-2">
                  <div className="flex-1 text-sm text-[var(--text-primary)]">No se encontraron lugares en un radio de 2 km.</div>
                  <button onClick={() => setNoPOI(false)} className="text-[var(--text-tertiary)] hover:text-white ml-2" aria-label="Cerrar aviso">✕</button>
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 mt-3 w-full">
              <button onClick={handleCerrarModal} className="px-4 py-2 rounded-md bg-transparent text-[var(--text-secondary)] border-[var(--border-color)] hover:bg-[var(--bg-tertiary)]">
                Cancelar
              </button>
              <button onClick={handleGuardarUbicacion} className="px-4 py-2 rounded-md bg-[var(--accent-green)] hover:bg-[var(--accent-green-hover)] text-white font-semibold">
                Guardar Ubicación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ubicacion;