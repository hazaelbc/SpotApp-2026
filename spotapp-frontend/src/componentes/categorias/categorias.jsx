import React, { useState, useEffect } from "react";
// API base URL configurable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
import { LuFolder, LuSquareCheck, LuUser } from "react-icons/lu"
import CategoriasGeneral from "../filtrado-categoria/categoria-general";
import TarjetasUbicacion from "../tarjetas-ubicacion/tarjetaUbicacion";
import ModalInfoUbicacion from "../../pantallas/modal-info-ubicacion/modal-info-ubicacion.jsx";
import Ubicacion from "../Ubicacion/ubicacion.jsx";
import {useUser}  from "../../userProvider.jsx"; 
import "./categoria.css"

const Categorias = ({ searchTerm }) => {
  const { user, setUser } = useUser();
  const [isUserReady, setIsUserReady] = useState(false);
  const [resenas, setResenas] = useState([]); // Estado para almacenar las reseñas
  const [modalVisible, setModalVisible] = useState(false); // Estado para controlar el modal
  const [selectedResena, setSelectedResena] = useState(null); // Estado para la reseña seleccionada
  const [ubicacionUsuario, setUbicacionUsuario] = useState(null); // Estado para la ubicación del usuario

  const filteredResenas = resenas.filter((resena) =>
    resena.nombreLugar.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCardClick = (resenas) => {
    setModalVisible(true); // Muestra el modal
    setSelectedResena(resenas);
  };

  const closeModal = () => {
    setSelectedResena(null);
    setModalVisible(false); // Oculta el modal
  };
  
  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radio de la Tierra en kilómetros
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distancia en kilómetros
  };


  useEffect(() => {
    const obtenerUbicacionUsuario = async () => {
      try {
        // Accede al usuario y copia su ID
        const userId = user?.id;
        // if (!userId) {
        //   console.warn("El ID del usuario no está disponible.");
        //   return;
        // }
  
        console.log("Obteniendo ubicación del usuario con ID:", userId);
  
        // Accede a la tabla de ubicación opcional con el ID del usuario
        const response = await fetch(`${API_URL}/user-ubicacion/${userId}`);
        if (!response.ok) {
          console.error("Error al obtener la ubicación del usuario:", response.status);
          return;
        }
  
        const data = await response.json();
        console.log("Datos de la ubicación obtenidos:", data);
  
        // Copia la latitud y longitud en una variable
        if (data.latitud && data.longitud) {
          const latitud = parseFloat(data.latitud);
          const longitud = parseFloat(data.longitud);
          console.log("Latitud:", latitud, "Longitud:", longitud);
  
          // Guarda la ubicación en el estado
          setUbicacionUsuario({ lat: latitud, lon: longitud });
        } else {
          console.warn("La ubicación del usuario no es válida:", data);
        }
      } catch (error) {
        console.error("Error al obtener la ubicación del usuario:", error);
      }
    };
  
    obtenerUbicacionUsuario();
  }, [user]);

  // Función para obtener los datos desde la API
  useEffect(() => {
    console.log("Ubicación del usuario:", ubicacionUsuario);
  
    const fetchResenas = async () => {
      try {
        const response = await fetch(`${API_URL}/resenas`);
        const data = await response.json();
        console.log("Reseñas obtenidas:", data);
  
        if (ubicacionUsuario) {
          const resenasFiltradas = data.filter((resena) => {
            console.log("Coordenadas de la reseña:", resena.latitud, resena.longitud);
            const distancia = calcularDistancia(
              ubicacionUsuario.lat,
              ubicacionUsuario.lon,
              resena.latitud,
              resena.longitud
            );
            console.log("Distancia calculada:", distancia);
            return distancia <= 20; // Filtra las reseñas dentro de un radio de 10 km
          });
  
          setResenas(resenasFiltradas);
          console.log("Reseñas filtradas:", resenasFiltradas);
        } else {
          setResenas(data);
        }
      } catch (error) {
        console.error("Error al obtener las reseñas:", error);
      }
    };
  
    fetchResenas();
  }, [ubicacionUsuario]);

  return (
    <SimpleGrid columns={2} gap="14" width="full" className="categorias-container">
      <For each={["plain"]}>
        {(variant) => (
          <Tabs.Root key={variant} defaultValue="members" variant={variant}>
            <div className="ubicacion-container">
              <Ubicacion />
            </div>
            <Tabs.List>
              <Tabs.Trigger value="Lugares Reacreativos" className="categoria-trigger" >
                Lugares Reacreativos
              </Tabs.Trigger>
              <Tabs.Trigger value="Restaurantes" className="categoria-trigger">
                Restaurantes
              </Tabs.Trigger>
              <Tabs.Trigger value="Parques" className="categoria-trigger">
                Parques
              </Tabs.Trigger>
              <Tabs.Trigger value="Pet Friendly" className="categoria-trigger">
                Pet Friendly
              </Tabs.Trigger>
              
            </Tabs.List>
            
            
            <Tabs.Content value="Lugares Reacreativos" className="categoria-content">
                Descubre los mejores lugares para disfrutar y relajarte en tu tiempo libre.
                <CategoriasGeneral>
                {filteredResenas
                  .filter((resena) => resena.categoriaId === 1) // Filtra las reseñas por categoriaId igual a 1
                  .map((resena) => (
                    <TarjetasUbicacion
                      key={resena.id} // Usa el ID como clave única
                      imagen={resena.fotoPrincipal}// Imagen temporal
                      nombre={resena.nombreLugar} // Muestra el nombre del lugar
                      categoria={resena.categoriaId}
                       // Muestra la categoría
                      vistas={resena.vistas}
                      onClick={() => handleCardClick(resena)}// Asegúrate de pasar esta función
                      calificacion={resena.calificacion}
                      id={resena.id} // Asegúrate de pasar el ID
                      userId={user?.id} // Asegúrate de pasar el ID del usuario
                      descripcion={resena.descripcion} 
                      // Puedes usar una imagen real aqu
                    />
                    
                ))}
                </CategoriasGeneral>
            </Tabs.Content>
            <Tabs.Content value="Restaurantes" className="categoria-content">
                Encuentra restaurantes con las mejores opciones gastronómicas para todos los gustos.
                <CategoriasGeneral>
                
                  {filteredResenas
                  .filter((resena) => resena.categoriaId === 2) // Filtra las reseñas por categoriaId igual a 1
                  .map((resena) => (
                    <TarjetasUbicacion
                      key={resena.id} // Usa el ID como clave única
                      imagen={resena.fotoPrincipal} // Imagen temporal
                      nombre={resena.nombreLugar} // Muestra el nombre del lugar
                      calificacion={resena.calificacion} // Muestra la calificación
                      categoria={resena.categoriaId} // Muestra la categoría
                      onClick={() => handleCardClick(resena)} // Asegúrate de pasar esta función
                      id={resena.id} // Asegúrate de pasar el ID
                      userId={user?.id} 
                      descripcion={resena.descripcion} 
                    />
                ))}
                
                </CategoriasGeneral>
            </Tabs.Content>
            <Tabs.Content value="Parques" className="categoria-content">
                Explora parques ideales para actividades al aire libre y disfrutar de la naturaleza.
                <CategoriasGeneral>
                {filteredResenas
                  .filter((resena) => resena.categoriaId === 3) // Filtra las reseñas por categoriaId igual a 1
                  .map((resena) => (
                    <TarjetasUbicacion
                      key={resena.id} // Usa el ID como clave única
                      imagen={resena.fotoPrincipal} // Imagen temporal
                      nombre={resena.nombreLugar} // Muestra el nombre del lugar
                      categoria={resena.categoriaId}
                      calificacion={resena.calificacion} // Muestra la categoría
                      onClick={() => handleCardClick(resena)} // Asegúrate de pasar esta función
                      id={resena.id} // Asegúrate de pasar el ID
                      userId={user?.id} 
                      descripcion={resena.descripcion} 
                    />
                ))}
                </CategoriasGeneral>
            </Tabs.Content>
            <Tabs.Content value="Pet Friendly" className="categoria-content">
                Lugares ideales para disfrutar con tus mascotas en un ambiente amigable.
                <CategoriasGeneral>
                {filteredResenas
                  .filter((resena) => resena.categoriaId === 4) // Filtra las reseñas por categoriaId igual a 1
                  .map((resena) => (
                    <TarjetasUbicacion
                      key={resena.id} // Usa el ID como clave única
                      imagen={resena.fotoPrincipal} // Imagen temporal
                      nombre={resena.nombreLugar} // Muestra el nombre del lugar
                      categoria={resena.categoriaId}
                      calificacion={resena.calificacion} // Muestra la categoría
                      onClick={() => handleCardClick(resena)} // Asegúrate de pasar esta función
                      id={resena.id} // Asegúrate de pasar el ID
                      userId={user?.id} 
                      descripcion={resena.descripcion} 
                    />
                ))}
                </CategoriasGeneral>
            </Tabs.Content>
            <Tabs.Content value="tasks" className="categoria-content">
                Organiza y gestiona tus eventos y actividades de manera eficiente.
                <CategoriasGeneral>
                {filteredResenas
                  .filter((resena) => resena.categoriaId === 5) // Filtra las reseñas por categoriaId igual a 1
                  .map((resena) => (
                    <TarjetasUbicacion
                      key={resena.id} // Usa el ID como clave única
                      imagen={resena.fotoPrincipal} // Imagen temporal
                      nombre={resena.nombreLugar} // Muestra el nombre del lugar
                      categoria={resena.categoriaId}
                      calificacion={resena.calificacion} // Muestra la categoría
                      onClick={() => handleCardClick(resena)} // Asegúrate de pasar esta función
                      id={resena.id} // Asegúrate de pasar el ID
                      userId={user?.id} 
                      descripcion={resena.descripcion} // Asegúrate de pasar la descripción
                    />
                ))}
                </CategoriasGeneral>
            </Tabs.Content>
            
          </Tabs.Root>
        )}
      </For>
      <ModalInfoUbicacion visible={modalVisible} onClose={closeModal} resena={selectedResena}/>
    </SimpleGrid>
  )
}



export default Categorias;