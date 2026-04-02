import React, { createContext, useState, useContext, useEffect, useRef } from "react";

// API base URL configurable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Intenta cargar los datos del usuario desde localStorage
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null; // Si no hay datos, devuelve null
  });

  useEffect(() => {
    // Guarda los datos del usuario en localStorage cada vez que cambien
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user"); // Limpia localStorage si el usuario es null
    }
  }, [user]);

  // Cargar ubicación desde la BD cuando el usuario inicia sesión
  const fetchedUbicacionRef = useRef(false);
  useEffect(() => {
    if (!user) return;
    // Evita repetir la petición si ya se hizo
    if (fetchedUbicacionRef.current) return;

    const loadUbicacion = async () => {
      try {
        const res = await fetch(`${API_URL}/user-ubicacion/${user.id}`);
        if (!res.ok) return;
        const data = await res.json();
        // Si hay datos de ubicación, mezclar en el user global
        if (data && (data.latitud || data.longitud || data.ubicacionLabel)) {
          setUser((prev) => ({ ...prev, ubicacion: data.latitud && data.longitud ? `${data.latitud}, ${data.longitud}` : prev?.ubicacion, ubicacionLabel: data.ubicacionLabel ?? prev?.ubicacionLabel, lat: data.latitud ?? prev?.lat, lng: data.longitud ?? prev?.lng }));
        }
      } catch (e) {
        // no bloquear la app si falla
        console.debug('No se pudo cargar la ubicación del usuario:', e);
      } finally {
        fetchedUbicacionRef.current = true;
      }
    };

    loadUbicacion();
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);