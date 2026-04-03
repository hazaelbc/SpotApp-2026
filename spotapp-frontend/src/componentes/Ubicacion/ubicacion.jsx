import React, { useState, useEffect, useRef } from "react";
import { createPortal } from 'react-dom';
import { FaLocationArrow } from 'react-icons/fa';
import { FiEdit, FiSliders } from 'react-icons/fi';
import { useUser } from "../../userProvider";
import { LuMap } from "react-icons/lu";
import L from "leaflet";
import "../../../node_modules/leaflet/dist/leaflet.css";
import "./ubicacion.css";
import { useTheme } from "../../contexts/themeContext";

// API base URL: use VITE_API_URL if provided, otherwise fallback to backend on port 3000
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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

const Ubicacion = ({ isOpen: controlledIsOpen, onClose: controlledOnClose, onSaveLocation: controlledOnSave, ignoreUserInitial = false } = {}) => {
  const { user, setUser } = useUser();
  const [ubicacion, setUbicacion] = useState(ignoreUserInitial ? "00" : (user?.ubicacion || "00"));
  const [internalModalVisible, setInternalModalVisible] = useState(false);
  const modalVisible = controlledIsOpen !== undefined ? controlledIsOpen : internalModalVisible;

  // step: 'choice' | 'exact-map' | 'city-search'
  // First-time users start at 'choice'. Returning users go to their previously chosen mode.
  const isFirstTime = !user?.ubicacionLabel && !user?.lat;
  const [step, setStep] = useState(isFirstTime ? 'choice' : 'exact-map');

  const [estadoSeleccionado, setEstadoSeleccionado] = useState("");
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState("");
  const [paisSeleccionado, setPaisSeleccionado] = useState('Mexico');
  const [ubicacionLabel, setUbicacionLabel] = useState(user?.ubicacionLabel || '');
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const tileLayerRef = useRef({ light: null, dark: null, current: null });
  const [mensaje, setMensaje] = useState("");
  const { isDark } = useTheme();
  const [loadingPosition, setLoadingPosition] = useState(false);

  // City-search step state
  const [cityQuery, setCityQuery] = useState('');
  const [cityResults, setCityResults] = useState([]);
  const [citySearchLoading, setCitySearchLoading] = useState(false);
  const [cityMap, setCityMap] = useState(null);
  const [cityMarker, setCityMarker] = useState(null);
  const cityTileLayerRef = useRef({ light: null, dark: null, current: null });
  const [cityUbicacion, setCityUbicacion] = useState({ lat: null, lng: null });
  const [cityLabel, setCityLabel] = useState('');
  const [mapMenuOpen, setMapMenuOpen] = useState(false);
  const mapMenuBtnRef = useRef(null);

  // Reset step when modal opens/closes
  useEffect(() => {
    if (modalVisible) {
      setStep(isFirstTime ? 'choice' : 'exact-map');
      setCityQuery('');
      setCityResults([]);
      setCityUbicacion({ lat: null, lng: null });
      setCityLabel('');
    }
  }, [modalVisible, isFirstTime]);

  const handleAbrirModal = () => {
    setInternalModalVisible(true);
    setStep(isFirstTime ? 'choice' : 'exact-map');
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
    if (cityMap) {
      cityMap.remove();
      setCityMap(null);
    }
    resetLeafletContainer("map-ubicacion");
    resetLeafletContainer("map-city-search");
    document.body.style.overflow = "";
    if (controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalModalVisible(false);
    }
  };

  const handleGuardarUbicacion = async () => {
    let latitud;
    let longitud;
    if (marker && typeof marker.getLatLng === 'function') {
      const ll = marker.getLatLng();
      latitud = ll.lat;
      longitud = ll.lng;
    } else {
      const coordRegex = /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/;
      if (!coordRegex.test(ubicacion)) {
        alert('No se ha seleccionado una ubicación. Mueve el marcador en el mapa.');
        return;
      }
      [latitud, longitud] = ubicacion.split(',').map(Number);
    }

    try {
      const built = await reverseGeocodeAndFill(latitud, longitud).catch(() => '');
      const labelToSave = built || ubicacionLabel || '';
      if (typeof controlledOnSave === 'function') {
        try { controlledOnSave({ latitud, longitud, ubicacionLabel: labelToSave }); } catch (e) { console.error('onSaveLocation callback error', e); }
        handleCerrarModal();
        return;
      }

      const response = await fetch(`${API_URL}/user-ubicacion/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitud, longitud, ubicacionLabel: labelToSave }),
      });
      if (response.ok) {
        setUser((prev) => ({
          ...prev,
          ubicacion: `${latitud.toFixed(6)}, ${longitud.toFixed(6)}`,
          ubicacionLabel: labelToSave,
          lat: latitud,
          lng: longitud,
        }));
      } else {
        console.error('Error al actualizar la ubicación:', response.status);
      }
    } catch (err) { console.error('Network error', err); }

    handleCerrarModal();
  };

  const handleGuardarCiudad = async () => {
    if (cityUbicacion.lat == null || cityUbicacion.lng == null) {
      alert('Por favor busca y selecciona una ciudad primero.');
      return;
    }
    const { lat: latitud, lng: longitud } = cityUbicacion;
    const labelToSave = cityLabel || '';

    try {
      if (typeof controlledOnSave === 'function') {
        try { controlledOnSave({ latitud, longitud, ubicacionLabel: labelToSave }); } catch (e) { console.error('onSaveLocation callback error', e); }
        handleCerrarModal();
        return;
      }

      const response = await fetch(`${API_URL}/user-ubicacion/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitud, longitud, ubicacionLabel: labelToSave }),
      });
      if (response.ok) {
        setUser((prev) => ({
          ...prev,
          ubicacion: `${latitud.toFixed(6)}, ${longitud.toFixed(6)}`,
          ubicacionLabel: labelToSave,
          lat: latitud,
          lng: longitud,
        }));
      } else {
        console.error('Error al actualizar la ubicación:', response.status);
      }
    } catch (err) { console.error('Network error', err); }

    handleCerrarModal();
  };

  // ── Exact-map: auto-geolocation on mount ──
  const handleUseMyLocation = (mapInstance, markerInstance) => {
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
      const mapRef = mapInstance || map;
      const markerRef = markerInstance || marker;
      setTimeout(() => {
        try {
          if (mapRef) {
            mapRef.setView([lat, lng], 15);
            if (markerRef) {
              markerRef.setLatLng([lat, lng]);
            }
          }
        } catch (e) { /* ignore */ }
      }, 100);
      await reverseGeocodeAndFill(lat, lng);
      setLoadingPosition(false);
      setMensaje('');
    }, (err) => {
      setLoadingPosition(false);
      setMensaje('');
      console.warn('No se pudo obtener la ubicación:', err.message || err.code);
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
  };

  // ── Exact-map initialization ──
  useEffect(() => {
    if (!modalVisible || step !== 'exact-map') return;

    const container = document.getElementById("map-ubicacion");
    if (!container) return;
    if (container._leaflet_id) {
      container._leaflet_id = null;
    }

    const coordRegex = /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/;
    const hasSavedCoords = user?.lat && user?.lng && (user.lat !== 0 || user.lng !== 0);
    let lat;
    let lng;
    if (coordRegex.test(ubicacion)) {
      [lat, lng] = ubicacion.split(",").map(Number);
    } else if (hasSavedCoords) {
      lat = user.lat; lng = user.lng;
    } else {
      lat = 19.432608;
      lng = -99.133209;
    }

    const mapInstance = L.map("map-ubicacion", {
      zoomControl: false,
      attributionControl: false,
      zoomSnap: 0.5,
      zoomDelta: 1,
      scrollWheelZoom: false,
      minZoom: 10,
    }).setView([lat, lng], 16);

    // Asymmetric scroll zoom: zoom-in faster, zoom-out slower
    mapInstance.getContainer().addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.deltaY < 0) mapInstance.zoomIn(0.7);
      else mapInstance.zoomOut(0.35);
    }, { passive: false });

    const darkTiles = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; Stadia Maps &copy; OpenMapTiles &copy; OpenStreetMap contributors',
      maxZoom: 19
    });
    const lightTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    });

    tileLayerRef.current.dark = darkTiles;
    tileLayerRef.current.light = lightTiles;

    if (isDark) {
      darkTiles.addTo(mapInstance);
      tileLayerRef.current.current = darkTiles;
    } else {
      lightTiles.addTo(mapInstance);
      tileLayerRef.current.current = lightTiles;
    }

    L.control.zoom({ position: 'topleft' }).addTo(mapInstance);
    L.control.scale({ position: 'bottomleft' }).addTo(mapInstance);

    const FullscreenControl = L.Control.extend({
      onAdd: function() {
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
      onAdd: function() {
        const btn = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom');
        btn.title = 'Centrar en mi ubicación';
        btn.innerHTML = '&#x1F4CD;';
        L.DomEvent.on(btn, 'click', function(e){ L.DomEvent.stopPropagation(e); handleUseMyLocation(mapInstance, newMarker); });
        L.DomEvent.disableClickPropagation(btn);
        return btn;
      }
    });
    new LocateControl({ position: 'topright' }).addTo(mapInstance);

    let userImg = '/fp_default.webp';
    try {
      const raw = (typeof user !== 'undefined' && user?.fotoPerfil) ? user.fotoPerfil : '';
      if (raw && typeof raw === 'string' && !/placeholder\.com/i.test(raw)) {
        userImg = raw;
      }
    } catch (e) { userImg = '/fp_default.webp'; }
    const html = `<div class="div-marker"><div class="avatar"><img src="${userImg}" alt="marker"/></div><div class="marker-tip"></div></div>`;
    const divIcon = L.divIcon({ html, className: 'custom-div-icon', iconSize: [48, 56], iconAnchor: [24, 56] });

    const newMarker = L.marker([lat, lng], { draggable: true, icon: divIcon }).addTo(mapInstance);
    setMarker(newMarker);

    newMarker.on("dragend", async (e) => {
      const { lat, lng } = e.target.getLatLng();
      setUbicacion(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      await reverseGeocodeAndFill(lat, lng);
    });

    mapInstance.on("click", async (e) => {
      const { lat, lng } = e.latlng;
      newMarker.setLatLng([lat, lng]);
      setUbicacion(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      await reverseGeocodeAndFill(lat, lng);
    });

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

    setTimeout(() => { mapInstance.invalidateSize(); }, 100);

    // Auto-trigger geolocation only for exact-mode users with no saved coords
    const isCityMode = localStorage.getItem('spotapp_location_mode') === 'city';
    const hasCoords = coordRegex.test(ubicacion) || hasSavedCoords;
    if (!hasCoords && !isCityMode) {
      handleUseMyLocation(mapInstance, newMarker);
    }

  }, [modalVisible, step]);

  // Cleanup exact-map when step changes away or modal closes
  useEffect(() => {
    if (!modalVisible || step !== 'exact-map') {
      if (map) {
        try { map.remove(); } catch (e) { /* ignore */ }
        setMap(null);
        setMarker(null);
        resetLeafletContainer("map-ubicacion");
      }
    }
  }, [modalVisible, step]);

  // Swap tile layer (exact-map) when theme changes
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

  // ── City-search map initialization ──
  useEffect(() => {
    if (!modalVisible || step !== 'city-search') return;

    const container = document.getElementById("map-city-search");
    if (!container) return;
    if (container._leaflet_id) {
      container._leaflet_id = null;
    }

    // If user already has a saved location, center there; otherwise Mexico City
    const hasSaved = user?.lat && user?.lng && (user.lat !== 0 || user.lng !== 0);
    const initLat = hasSaved ? user.lat : 19.432608;
    const initLng = hasSaved ? user.lng : -99.133209;

    const mapInstance = L.map("map-city-search", {
      zoomControl: true,
      attributionControl: false,
      zoomSnap: 0.5,
      zoomDelta: 1,
      scrollWheelZoom: false,
      minZoom: 10,
    }).setView([initLat, initLng], hasSaved ? 16 : 5);

    // Asymmetric scroll zoom: zoom-in faster, zoom-out slower
    mapInstance.getContainer().addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.deltaY < 0) mapInstance.zoomIn(0.7);
      else mapInstance.zoomOut(0.35);
    }, { passive: false });

    const darkTiles = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; Stadia Maps &copy; OpenMapTiles &copy; OpenStreetMap contributors',
      maxZoom: 19
    });
    const lightTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    });

    cityTileLayerRef.current.dark = darkTiles;
    cityTileLayerRef.current.light = lightTiles;

    if (isDark) {
      darkTiles.addTo(mapInstance);
      cityTileLayerRef.current.current = darkTiles;
    } else {
      lightTiles.addTo(mapInstance);
      cityTileLayerRef.current.current = lightTiles;
    }

    L.control.scale({ position: 'bottomleft' }).addTo(mapInstance);

    setTimeout(() => { mapInstance.invalidateSize(); }, 100);

    setCityMap(mapInstance);

    // Click en el mapa mueve el marcador
    mapInstance.on('click', (e) => {
      const { lat, lng } = e.latlng;
      setCityUbicacion({ lat, lng });
      // mover marcador existente o crear uno nuevo
      setCityMarker(prev => {
        if (prev) { prev.setLatLng([lat, lng]); return prev; }
        let userImg2 = '/fp_default.webp';
        try { const raw = user?.fotoPerfil || ''; if (raw && !/placeholder\.com/i.test(raw)) userImg2 = raw; } catch(e2){}
        const html2 = `<div class="div-marker"><div class="avatar"><img src="${userImg2}" alt="marker"/></div><div class="marker-tip"></div></div>`;
        const icon2 = L.divIcon({ html: html2, className: 'custom-div-icon', iconSize: [48, 56], iconAnchor: [24, 56] });
        const m2 = L.marker([lat, lng], { draggable: true, icon: icon2 }).addTo(mapInstance);
        m2.on('dragend', (ev) => { const p = ev.target.getLatLng(); setCityUbicacion({ lat: p.lat, lng: p.lng }); });
        return m2;
      });
    });

    // Place marker at saved location if exists — same avatar icon as exact-map
    if (hasSaved) {
      let userImg = '/fp_default.webp';
      try { const raw = user?.fotoPerfil || ''; if (raw && !/placeholder\.com/i.test(raw)) userImg = raw; } catch(e){}
      const avatarHtml = `<div class="div-marker"><div class="avatar"><img src="${userImg}" alt="marker"/></div><div class="marker-tip"></div></div>`;
      const avatarIcon = L.divIcon({ html: avatarHtml, className: 'custom-div-icon', iconSize: [48, 56], iconAnchor: [24, 56] });
      const m = L.marker([initLat, initLng], { draggable: true, icon: avatarIcon }).addTo(mapInstance);
      m.on('dragend', (e) => {
        const { lat, lng } = e.target.getLatLng();
        setCityUbicacion({ lat, lng });
      });
      setCityMarker(m);
      setCityUbicacion({ lat: initLat, lng: initLng });
      setCityLabel(user?.ubicacionLabel || '');
    } else {
      setCityMarker(null);
    }

    return () => {
      // cleanup handled by the step-change effect below
    };
  }, [modalVisible, step]);

  // Cleanup city-search map when step changes away or modal closes
  useEffect(() => {
    if (!modalVisible || step !== 'city-search') {
      if (cityMap) {
        try { cityMap.remove(); } catch (e) { /* ignore */ }
        setCityMap(null);
        setCityMarker(null);
        resetLeafletContainer("map-city-search");
      }
    }
  }, [modalVisible, step]);

  // Swap tile layer (city-search) when theme changes
  useEffect(() => {
    if (!cityMap || !cityTileLayerRef.current) return;
    const desired = isDark ? cityTileLayerRef.current.dark : cityTileLayerRef.current.light;
    if (!desired) return;
    try {
      const cur = cityTileLayerRef.current.current;
      if (cur !== desired) {
        if (cur) cityMap.removeLayer(cur);
        desired.addTo(cityMap);
        cityTileLayerRef.current.current = desired;
        setTimeout(() => { try { cityMap.invalidateSize(); } catch(e){} }, 200);
      }
    } catch (e) {
      console.error('Error swapping city tile layers by theme', e);
    }
  }, [isDark, cityMap]);

  const encontrarEstadoYCiudad = (latitud, longitud) => {
    const rad = (x) => (x * Math.PI) / 180;
    const calcularDistancia = (lat1, lon1, lat2, lon2) => {
      const R = 6371;
      const dLat = rad(lat2 - lat1);
      const dLon = rad(lon2 - lon1);
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };
    let estadoCercano = "";
    let ciudadCercana = "";
    let distanciaMinima = Infinity;
    for (const estado of estadosNorte) {
      for (const ciudad of estado.ciudades) {
        const distancia = calcularDistancia(latitud, longitud, ciudad.coordenadas[0], ciudad.coordenadas[1]);
        if (distancia < distanciaMinima) {
          distanciaMinima = distancia;
          estadoCercano = estado.nombre;
          ciudadCercana = ciudad.nombre;
        }
      }
    }
    if (distanciaMinima !== Infinity) return { estado: estadoCercano, ciudad: ciudadCercana };
    return { estado: "", ciudad: "" };
  };

  useEffect(() => {
    if (ignoreUserInitial || typeof controlledOnSave === 'function') return;
    const fetchUbicacion = async () => {
      try {
        const response = await fetch(`${API_URL}/user-ubicacion/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.latitud && data.longitud) {
            const { estado, ciudad } = encontrarEstadoYCiudad(data.latitud, data.longitud);
            setUbicacion(`${data.latitud}, ${data.longitud}`);
            setEstadoSeleccionado(estado);
            setCiudadSeleccionada(ciudad);
            if (ciudad || estado) {
              const labelParts = [];
              if (ciudad) labelParts.push(ciudad);
              if (estado) labelParts.push(estado);
              labelParts.push('Mexico');
              setUbicacionLabel(labelParts.join(' < '));
            }
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
  }, [user.id, ignoreUserInitial, controlledOnSave]);

  async function reverseGeocodeAndFill(lat, lng) {
    try {
      setMensaje('Buscando dirección...');
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'es', 'User-Agent': 'SpotApp/1.0' } });
      if (!res.ok) return '';
      const data = await res.json();
      const addr = data.address || {};
      const state = addr.state || addr.region || '';
      const city = addr.city || addr.town || addr.village || addr.municipality || '';
      const country = addr.country || 'Mexico';
      if (state) setEstadoSeleccionado(state);
      if (city) setCiudadSeleccionada(city);
      if (country) setPaisSeleccionado(country);
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

  // ── City search: Nominatim forward geocoding ──
  const handleCitySearch = async () => {
    if (!cityQuery.trim()) return;
    setCitySearchLoading(true);
    setCityResults([]);
    try {
      const encoded = encodeURIComponent(cityQuery.trim());
      const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=5&featuretype=city`;
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'es', 'User-Agent': 'SpotApp/1.0' }
      });
      if (!res.ok) throw new Error('Nominatim error');
      const data = await res.json();
      setCityResults(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('city search error', e);
      setCityResults([]);
    } finally {
      setCitySearchLoading(false);
    }
  };

  const handleCityResultSelect = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const rawLabel = result.display_name || '';
    // Trim display_name to city, state, country (first 3 comma-parts)
    const parts = rawLabel.split(',').map(s => s.trim()).filter(Boolean);
    const trimmedLabel = parts.slice(0, 3).join(', ');

    setCityUbicacion({ lat, lng });
    setCityLabel(trimmedLabel || rawLabel);
    setCityResults([]);
    setCityQuery(trimmedLabel || rawLabel);

    if (cityMap) {
      cityMap.setView([lat, lng], 16);

      // Place or move city marker
      if (cityMarker) {
        cityMarker.setLatLng([lat, lng]);
      } else {
        let userImg = '/fp_default.webp';
        try { const raw = user?.fotoPerfil || ''; if (raw && !/placeholder\.com/i.test(raw)) userImg = raw; } catch(e){}
        const avatarHtml = `<div class="div-marker"><div class="avatar"><img src="${userImg}" alt="marker"/></div><div class="marker-tip"></div></div>`;
        const avatarIcon = L.divIcon({ html: avatarHtml, className: 'custom-div-icon', iconSize: [48, 56], iconAnchor: [24, 56] });
        const newCityMarker = L.marker([lat, lng], { draggable: true, icon: avatarIcon }).addTo(cityMap);
        newCityMarker.on('dragend', (e) => {
          const { lat: la, lng: ln } = e.target.getLatLng();
          setCityUbicacion({ lat: la, lng: ln });
        });
        setCityMarker(newCityMarker);
      }
    }
  };

  // ── Render ──
  const renderChoiceScreen = () => (
    <div className="flex flex-1 min-h-0 gap-0">
      {/* Card 1: Exact location */}
      <button
        onClick={() => { localStorage.setItem('spotapp_location_mode', 'exact'); setStep('exact-map'); }}
        className="flex flex-col items-center justify-center gap-5 flex-1 px-6 py-10 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors border-r border-[var(--border-color)] cursor-pointer text-center"
      >
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] shadow-sm">
          <FaLocationArrow className="text-[var(--accent-color)] text-2xl" />
        </div>
        <div>
          <p className="text-base font-semibold text-[var(--text-primary)] mb-1.5">Compartir mi ubicación</p>
          <p className="text-sm text-[var(--text-tertiary)] leading-relaxed max-w-[180px]">La app detecta tu posición automáticamente</p>
        </div>
      </button>

      {/* Card 2: City search */}
      <button
        onClick={() => { localStorage.setItem('spotapp_location_mode', 'city'); setStep('city-search'); }}
        className="flex flex-col items-center justify-center gap-5 flex-1 px-6 py-10 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer text-center"
      >
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] shadow-sm">
          <FiEdit className="text-[var(--accent-color)] text-2xl" />
        </div>
        <div>
          <p className="text-base font-semibold text-[var(--text-primary)] mb-1.5">Prefiero escribir mi ciudad</p>
          <p className="text-sm text-[var(--text-tertiary)] leading-relaxed max-w-[180px]">Elige tu zona sin compartir tu posición exacta</p>
        </div>
      </button>
    </div>
  );

  const renderExactMapScreen = () => (
    <>
      {/* Map */}
      <div className="relative flex-1 min-h-0">
        <div id="map-ubicacion" className="h-full w-full" style={{ backgroundColor: isDark ? '#1e1e1e' : '#f1f5f9' }} />
        {loadingPosition && (
          <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-[var(--bg-secondary)]/95 border border-[var(--border-color)] px-4 py-2.5 rounded-xl flex items-center gap-2.5 shadow-md">
              <svg className="w-4 h-4 animate-spin text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              <p className="text-xs text-[var(--text-secondary)]">Obteniendo ubicación...</p>
            </div>
          </div>
        )}
        {ubicacionLabel && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-[var(--bg-secondary)]/95 border border-[var(--border-color)] px-3 py-1.5 rounded-xl shadow-md pointer-events-none">
            <p className="text-xs text-[var(--text-secondary)] whitespace-nowrap">{ubicacionLabel}</p>
          </div>
        )}
        {mensaje && (
          <div className="absolute top-3 right-3 z-50 bg-[var(--bg-secondary)]/95 border border-[var(--border-color)] px-3 py-1.5 rounded-xl shadow-md pointer-events-none">
            <p className="text-xs text-[var(--text-secondary)]">{mensaje}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2 px-4 sm:px-5 py-3 sm:py-3.5 border-t border-[var(--border-color)] flex-shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {isFirstTime && (
            <button
              onClick={() => setStep('choice')}
              className="px-4 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
            >
              Atras
            </button>
          )}
          <button
            onClick={handleCerrarModal}
            className="px-4 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            Cancelar
          </button>
        </div>
        <button
          onClick={handleGuardarUbicacion}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] text-sm font-semibold hover:opacity-80 transition-opacity"
        >
          Guardar ubicación
        </button>
      </div>
    </>
  );

  const renderCitySearchScreen = () => (
    <>
      {/* Search bar */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-[var(--border-color)] relative z-20">
        <div className="flex gap-2">
          <input
            type="text"
            value={cityQuery}
            onChange={(e) => setCityQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCitySearch(); }}
            placeholder="Busca tu ciudad o municipio..."
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--text-tertiary)] transition-colors"
          />
          <button
            onClick={handleCitySearch}
            disabled={citySearchLoading}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50 flex-shrink-0"
          >
            {citySearchLoading ? (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
              </svg>
            )}
            Buscar
          </button>
        </div>

        {/* Results dropdown — absolute so it overlays the map */}
        {cityResults.length > 0 && (
          <div className="absolute left-4 right-4 top-full mt-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-xl overflow-hidden z-30">
            {cityResults.map((result, idx) => {
              const parts = (result.display_name || '').split(',').map(s => s.trim()).filter(Boolean);
              const primary = parts[0] || result.display_name;
              const secondary = parts.slice(1, 3).join(', ');
              return (
                <button
                  key={result.place_id || idx}
                  onClick={() => handleCityResultSelect(result)}
                  className="w-full text-left px-4 py-2.5 hover:bg-[var(--bg-tertiary)] transition-colors border-b border-[var(--border-color)] last:border-0"
                >
                  <p className="text-sm text-[var(--text-primary)] font-medium truncate">{primary}</p>
                  {secondary && <p className="text-xs text-[var(--text-tertiary)] truncate mt-0.5">{secondary}</p>}
                </button>
              );
            })}
          </div>
        )}

        {cityLabel && (
          <p className="mt-2 text-xs text-[var(--text-secondary)] px-1">
            <span className="text-[var(--text-tertiary)]">Seleccionado:</span> {cityLabel}
          </p>
        )}
      </div>

      {/* City map */}
      <div className="relative flex-1 min-h-0">
        <div id="map-city-search" className="h-full w-full" style={{ backgroundColor: isDark ? '#1e1e1e' : '#f1f5f9' }} />
        {!cityUbicacion.lat && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <p className="text-xs text-[var(--text-tertiary)] bg-[var(--bg-secondary)]/80 px-3 py-2 rounded-xl border border-[var(--border-color)]">Busca una ciudad para ver el marcador</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2 px-4 sm:px-5 py-3 sm:py-3.5 border-t border-[var(--border-color)] flex-shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {isFirstTime && (
            <button
              onClick={() => setStep('choice')}
              className="px-4 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
            >
              Atras
            </button>
          )}
          <button
            onClick={handleCerrarModal}
            className="px-4 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            Cancelar
          </button>
        </div>
        <button
          onClick={handleGuardarCiudad}
          disabled={cityUbicacion.lat == null}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] text-sm font-semibold hover:opacity-80 transition-opacity disabled:opacity-40"
        >
          Guardar ubicación
        </button>
      </div>
    </>
  );

  // Header text varies by step
  const headerText = {
    choice: { title: 'Configura tu ubicación', subtitle: 'Elige cómo quieres que SpotApp conozca tu zona.' },
    'exact-map': { title: 'Tu ubicación', subtitle: 'Mueve el marcador para ajustar. No compartas tu posición exacta.' },
    'city-search': { title: 'Busca tu ciudad', subtitle: 'Selecciona un punto de referencia público, no tu dirección.' },
  };
  const currentHeader = headerText[step] || headerText['exact-map'];

  return (
    <div>
      {/* Trigger: solo visible en modo no-controlado */}
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

      {modalVisible && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="flex flex-col w-full sm:w-[min(780px,92vw)] h-[92dvh] sm:h-[62vh] bg-[var(--bg-primary)] rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-[var(--border-color)] flex-shrink-0">
              <div className="min-w-0 pr-2">
                <p className="text-[15px] sm:text-base font-semibold text-[var(--text-primary)] truncate">{currentHeader.title}</p>
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5 leading-snug line-clamp-2 sm:line-clamp-none">{currentHeader.subtitle}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {(step === 'exact-map' || step === 'city-search') && (
                  <div className="relative">
                    <button
                      ref={mapMenuBtnRef}
                      onClick={() => setMapMenuOpen(v => !v)}
                      className="p-2 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                      aria-label="Más opciones"
                    >
                      <FiSliders className="w-4 h-4" />
                    </button>
                    {mapMenuOpen && createPortal(
                      <>
                        <div className="fixed inset-0 z-[10000]" onClick={() => setMapMenuOpen(false)} />
                        <div
                          className="fixed z-[10001] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-xl min-w-[210px] overflow-hidden"
                          style={(() => {
                            const r = mapMenuBtnRef.current?.getBoundingClientRect();
                            return r ? { top: r.bottom + 6, right: window.innerWidth - r.right } : { top: 60, right: 16 };
                          })()}
                        >
                          {step === 'city-search' && (
                            <button
                              onClick={() => { setMapMenuOpen(false); localStorage.setItem('spotapp_location_mode', 'exact'); setStep('exact-map'); }}
                              className="w-full text-left px-4 py-3 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors flex items-center gap-2.5"
                            >
                              <FaLocationArrow className="text-[var(--accent-color)] text-xs flex-shrink-0" />
                              Usar mi ubicación exacta
                            </button>
                          )}
                          {step === 'exact-map' && (
                            <>
                              <button
                                onClick={() => { setMapMenuOpen(false); if (map && marker) handleUseMyLocation(map, marker); }}
                                className="w-full text-left px-4 py-3 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors flex items-center gap-2.5 border-b border-[var(--border-color)]"
                              >
                                <FaLocationArrow className="text-[var(--accent-color)] text-xs flex-shrink-0" />
                                Usar mi ubicación exacta
                              </button>
                              <button
                                onClick={() => { setMapMenuOpen(false); localStorage.setItem('spotapp_location_mode', 'city'); setStep('city-search'); }}
                                className="w-full text-left px-4 py-3 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors flex items-center gap-2.5"
                              >
                                <FiEdit className="text-[var(--accent-color)] text-xs flex-shrink-0" />
                                Buscar ciudad
                              </button>
                            </>
                          )}
                        </div>
                      </>,
                      document.body
                    )}
                  </div>
                )}
                <button
                  onClick={handleCerrarModal}
                  className="p-2 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                  aria-label="Cerrar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Body: step-based rendering */}
            {step === 'choice' && renderChoiceScreen()}
            {step === 'exact-map' && renderExactMapScreen()}
            {step === 'city-search' && renderCitySearchScreen()}

          </div>
        </div>
      , document.body)}
    </div>
  );
};

export default Ubicacion;
