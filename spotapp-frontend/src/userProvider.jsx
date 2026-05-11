import React, { createContext, useState, useContext, useEffect, useRef } from "react";

// API base URL configurable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // true cuando ya se intentó cargar la ubicación (ya sea con éxito o fallo)
  const [locationReady, setLocationReady] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const fetchedUbicacionUserIdRef = useRef(null);
  useEffect(() => {
    if (!user?.id) {
      fetchedUbicacionUserIdRef.current = null;
      setLocationReady(true); // sin usuario no hay nada que esperar
      return;
    }
    // Si ya cargamos para este usuario, marcar listo de inmediato
    if (fetchedUbicacionUserIdRef.current === user.id) {
      setLocationReady(true);
      return;
    }

    setLocationReady(false);

    const loadUbicacion = async () => {
      const startedAt = Date.now();
      const maxWaitMs = 5000; // máximo 5 segundos de espera total
      const minWaitMs = 800; // mínimo 800ms para estabilidad del estado
      let retryCount = 0;
      const maxRetries = 3;

      const attemptLoad = async () => {
        try {
          const res = await fetch(`${API_URL}/user-ubicacion/${user.id}`, {
            signal: AbortSignal.timeout(3000), // timeout por petición de 3s
          });
          
          if (!res.ok) {
            if (retryCount < maxRetries && res.status === 500) {
              retryCount++;
              console.debug(`Reintentando carga de ubicación (intento ${retryCount}/${maxRetries})...`);
              await new Promise(r => setTimeout(r, Math.min(500 * retryCount, 2000)));
              return attemptLoad();
            }
            console.debug(`No se pudo cargar ubicación: ${res.status}`);
            return false;
          }

          const data = await res.json();
          if (data && (data.latitud != null || data.longitud != null || data.ubicacionLabel)) {
            setUser((prev) => ({
              ...prev,
              ubicacion:
                data.latitud != null && data.longitud != null
                  ? `${data.latitud}, ${data.longitud}`
                  : prev?.ubicacion,
              ubicacionLabel: data.ubicacionLabel ?? prev?.ubicacionLabel,
              lat: data.latitud ?? prev?.lat,
              lng: data.longitud ?? prev?.lng,
            }));
            console.debug('Ubicación cargada:', data.ubicacionLabel || `${data.latitud}, ${data.longitud}`);
          }
          return true;
        } catch (e) {
          if (retryCount < maxRetries && (e.name === 'AbortError' || !navigator.onLine)) {
            retryCount++;
            console.debug(`Error al cargar ubicación, reintentando (${retryCount}/${maxRetries}):`, e.message);
            await new Promise(r => setTimeout(r, Math.min(500 * retryCount, 2000)));
            return attemptLoad();
          }
          console.debug('No se pudo cargar ubicación después de reintentos:', e.message);
          return false;
        }
      };

      await attemptLoad();
      
      // Garantiza mínimo minWaitMs pero máximo maxWaitMs de espera total
      fetchedUbicacionUserIdRef.current = user.id;
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, Math.min(minWaitMs, maxWaitMs) - elapsed);
      setTimeout(() => setLocationReady(true), remaining);
    };

    loadUbicacion();
  }, [user?.id]);

  return (
    <UserContext.Provider value={{ user, setUser, locationReady }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);