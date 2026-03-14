import React, { useEffect, useState, useRef } from "react";
import "./modal-info-ubicacion.css";
import { useUser } from "../../userProvider.jsx";
import L from "leaflet";
import "../../../node_modules/leaflet/dist/leaflet.css";
import Breadcrumblecookie from "../../componentes/breadcrumbs/breadcrumb.jsx";
import Calificacion from "../../componentes/calificacion/calificacion.jsx";
import Comentario from "../../componentes/comentarios";
import BarraComentario from "../../componentes/barra-comentarios/barra-comentarios.jsx";
// const ModalInfoUbicacion = ({ visible, onClose, resena }) => {
//   const { user } = useUser();
//   const [activeScreen, setActiveScreen] = useState("info");
//   const [userLocation, setUserLocation] = useState(null);
//   const mapRef = useRef(null);

//   useEffect(() => {
//     if (visible && activeScreen === "map") {
//       const fetchUserLocation = async () => {
//         try {
//           const response = await fetch(`http://localhost:8080/user-ubicacion/${user.id}`);
//           if (response.ok) {
//             const data = await response.json();
//             setUserLocation({ lat: data.latitud, lng: data.longitud });
//           }
//         } catch (error) {
//           console.error("Error obteniendo ubicación del usuario:", error);
//         }
//       };

//       fetchUserLocation();
//     }
//   }, [visible, activeScreen, user.id]);

//   useEffect(() => {
//     if (visible && activeScreen === "map" && resena) {
//       // Evita volver a montar el mapa si ya existe
//       if (!mapRef.current) {
//         mapRef.current = L.map("map", {
//           center: [resena.latitud, resena.longitud],
//           zoom: 13,
//           minZoom: 5,
//           maxZoom: 18,
//         });

//         L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//           attribution: '&copy; OpenStreetMap contributors',
//         }).addTo(mapRef.current);
//       }

//       const markers = [];

//       // Ícono personalizado para el luga

//       // Ícono personalizado para el usuario con imagen redonda
//       const usuarioIcon = L.divIcon({
//         className: "custom-user-icon", // Clase CSS personalizada
//         html: `<div class="user-icon" style="background-image: url('${user.fotoPerfil || "https://via.placeholder.com/30"}');"></div>`,
//         iconSize: [40, 40], // Tamaño del ícono
//         iconAnchor: [20, 40], // Punto de anclaje
//         popupAnchor: [0, -40], // Punto del popup
//       });

//       // Agrega marcador del lugar
//       markers.push(
//         L.marker([resena.latitud, resena.longitud])
//           .addTo(mapRef.current)
//           .bindPopup(`<b></b> ${resena.nombreLugar}`)
//       );

//       // Agrega marcador del usuario si ya está disponible
//       if (userLocation) {
//         markers.push(
//           L.marker([userLocation.lat, userLocation.lng], { icon: usuarioIcon })
//             .addTo(mapRef.current)
//             .bindPopup("<b>Tu ubicación</b>")
//         );
//       }

//       const group = L.featureGroup(markers);
//       mapRef.current.fitBounds(group.getBounds());

//       setTimeout(() => {
//         mapRef.current?.invalidateSize();
//       }, 100);
//     }
//   }, [visible, activeScreen, resena, userLocation]);

//   // Limpieza solo si el modal se cierra completamente
//   useEffect(() => {
//     if (!visible && mapRef.current) {
//       mapRef.current.remove();
//       mapRef.current = null;
//     }
//   }, [visible]);

//   if (!visible || !resena) return null;

//   const renderContent = () => {
//     switch (activeScreen) {
//       case "info":
//         return (
//           <div className="info">
//             <img
//               src={resena.fotoPrincipal || "https://via.placeholder.com/150"}
//               alt="Imagen de ejemplo"
//               className="info-image"
//             />
//             <p className="info-title">{resena.nombreLugar}</p>
//             <div className="calificacion">
//               <Calificacion valorInicial={resena.calificacion} />
//             </div>
//           </div>
//         );
//       case "map":
//         return <div id="map" className="map" style={{ height: "100%", width: "100%" }}></div>;
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="modal-overlay-info-ubicacion" onClick={onClose}>
//       <div className="modal-content-info" onClick={(e) => e.stopPropagation()}>
//         <Breadcrumblecookie
//           onNavigate={(screen) => setActiveScreen(screen)}
//         />
//         {renderContent()}
//       </div>
//     </div>
//   );
// };

// export default ModalInfoUbicacion;

// import React, { useEffect, useState, useRef } from "react";
// import "./modal-info-ubicacion.css";
// import { useUser } from "../../userProvider.jsx";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import Breadcrumblecookie from "../../componentes/breadcrumbs/breadcrumb.jsx";
// import Calificacion from "../../componentes/calificacion/calificacion.jsx";

const ModalInfoUbicacion = ({ visible, onClose, resena }) => {
  const { user } = useUser();
  const [activeScreen, setActiveScreen] = useState("info");
  const [userLocation, setUserLocation] = useState(null);
  const [comentarios, setComentarios] = useState([]); // Estado para los comentarios
  const mapRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!scrollRef.current) return;

    const scrollContainer = scrollRef.current;
    let scrollInterval;

    const startAutoScroll = () => {
      scrollInterval = setInterval(() => {
        if (scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight) {
          scrollContainer.scrollTop = 0; // Reinicia el scroll al inicio
        } else {
          scrollContainer.scrollTop += 1; // Desplaza hacia abajo
        }
      }, 50); // Velocidad del scroll (ajustable)
    };

    const stopAutoScroll = () => {
      clearInterval(scrollInterval);
    };

    // Inicia el scroll automático
    startAutoScroll();

    // Detiene el scroll automático al interactuar con el contenedor
    scrollContainer.addEventListener("mouseenter", stopAutoScroll);
    scrollContainer.addEventListener("mouseleave", startAutoScroll);

    // Limpia los eventos y el intervalo al desmontar el componente
    return () => {
      stopAutoScroll();
      scrollContainer.removeEventListener("mouseenter", stopAutoScroll);
      scrollContainer.removeEventListener("mouseleave", startAutoScroll);
    };
  }, []);

  useEffect(() => {
    const fetchComentarios = async () => {
      try {
        const response = await fetch(`http://localhost:8080/comentarios-resena/resena/${resena.id}`);
        if (response.ok) {
          const data = await response.json();
          setComentarios(data);
        } else {
          console.error("Error al cargar los comentarios:", response.status);
        }
      } catch (error) {
        console.error("Error de red al cargar los comentarios:", error);
      }
    };

    if (visible && resena) {
      fetchComentarios();
    }
  }, [visible, resena]);

  useEffect(() => {
    if (visible && activeScreen === "map") {
      const fetchUserLocation = async () => {
        try {
          const response = await fetch(`http://localhost:8080/user-ubicacion/${user.id}`);
          if (response.ok) {
            const data = await response.json();
            setUserLocation({ lat: data.latitud, lng: data.longitud });
          }
        } catch (error) {
          console.error("Error obteniendo ubicación del usuario:", error);
        }
      };

      fetchUserLocation();
    }
  }, [visible, activeScreen, user.id]);

  useEffect(() => {
    if (visible && activeScreen === "map" && resena) {
      if (!mapRef.current) {
        mapRef.current = L.map("map", {
          center: [resena.latitud, resena.longitud],
          zoom: 13,
          minZoom: 5,
          maxZoom: 18,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(mapRef.current);
      }

      const markers = [];

      const usuarioIcon = L.divIcon({
        className: "custom-user-icon",
        html: `<div class="user-icon" style="background-image: url('${user.fotoPerfil || "https://via.placeholder.com/30"}');"></div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
      });

      markers.push(
        L.marker([resena.latitud, resena.longitud])
          .addTo(mapRef.current)
          .bindPopup(`<b>${resena.nombreLugar}</b>`)
      );

      if (userLocation) {
        markers.push(
          L.marker([userLocation.lat, userLocation.lng], { icon: usuarioIcon })
            .addTo(mapRef.current)
            .bindPopup("<b>Tu ubicación</b>")
        );
      }

      const group = L.featureGroup(markers);
      mapRef.current.fitBounds(group.getBounds());

      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 100);
    }
  }, [visible, activeScreen, resena, userLocation]);

  useEffect(() => {
    if (!visible && mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
  }, [visible]);

  if (!visible || !resena) return null;

  return (
    <div className="modal-overlay-info-ubicacion" onClick={onClose}>
      <div className="modal-content-info" onClick={(e) => e.stopPropagation()}>
        <Breadcrumblecookie onNavigate={(screen) => setActiveScreen(screen)} />

        <div className="content-container">
          <div className={`info ${activeScreen === "info" ? "visible" : "hidden"}`}>
            <img
              src={resena.fotoPrincipal || '/fp_default.webp'}
              alt="Imagen del lugar"
              className="info-image"
            />
            <div className="info-details">
              <p className="info-title">{resena.nombreLugar}</p>
              <div className="calificacion">
                <Calificacion valorInicial={resena.calificacion} />
              </div>
            </div>
            
            <div className="comentarios-container-local" ref={scrollRef}>
              <div className="comentarios-scroll">
                {comentarios.map((comentario) => (
                  <Comentario
                    key={comentario.id}
                    nombre={comentario.usuario.nombre}
                    foto={comentario.usuario.fotoPerfil}
                    comentario={comentario.comentario}
                  />
                ))}
              </div>
            </div>
            <div className="barra-comentario-container-local">
              <BarraComentario 
                resenaId={resena.id} // Pasa el ID de la reseña dinámicamente
                usuarioId={user.id} // Pasa el ID del usuario desde el userProvider
                onEnviar={(data) => {
                  // Opcional: Actualiza la lista de comentarios después de enviar uno nuevo
                  setComentarios((prevComentarios) => [...prevComentarios, data]);
                }}
              ></BarraComentario>
            </div>
          </div>

          <div className={`map-container ${activeScreen === "map" ? "visible" : "hidden"}`}>
            <div id="map" className="map" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalInfoUbicacion;
