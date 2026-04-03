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
      // Mínimo 1 segundo de espera para que el estado del usuario se estabilice
      const startedAt = Date.now();
      try {
        const res = await fetch(`${API_URL}/user-ubicacion/${user.id}`);
        if (!res.ok) return;
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
        }
      } catch (e) {
        console.debug('No se pudo cargar la ubicación del usuario:', e);
      } finally {
        fetchedUbicacionUserIdRef.current = user.id;
        // Garantiza al menos 1 s antes de que el feed empiece a cargar
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, 1000 - elapsed);
        setTimeout(() => setLocationReady(true), remaining);
      }
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