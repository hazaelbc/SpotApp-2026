import React, { useState, useEffect } from "react";
import { useUser } from "../../userProvider";
import { LuMap } from "react-icons/lu";
import L from "leaflet";
import "../../../node_modules/leaflet/dist/leaflet.css";
import "./ubicacion.css";

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

const Ubicacion = () => {
  const { user, setUser } = useUser(); // Accede al usuario desde el contexto
  const [ubicacion, setUbicacion] = useState(user?.ubicacion || "00"); // Estado local para manejar la ubicación
  const [modalVisible, setModalVisible] = useState(false); // Estado para mostrar/ocultar el modal
  const [pantalla, setPantalla] = useState(1); // Controla la pantalla del modal
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("");
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState("");
  const [map, setMap] = useState(null); // Estado para el mapa
  const [marker, setMarker] = useState(null); // Estado para el marcador
  const [mensaje, setMensaje] = useState("");

  const handleAbrirModal = () => {
    setModalVisible(true); // Muestra el modal
    setPantalla(1); // Reinicia a la primera pantalla
  };
  const resetLeafletContainer = (id) => {
    const container = document.getElementById(id);
    if (container && container._leaflet_id) {
      container._leaflet_id = null;
    }
  };

  const handleCerrarModal = () => {
    if (map) {
      map.remove(); // Elimina el mapa
      setMap(null); // Limpia el estado del mapa
    }
    resetLeafletContainer("map-ubicacion"); // Limpia el contenedor del mapa
    setModalVisible(false); // Oculta el modal
  };
// punto de retorno
  const handleGuardarUbicacion = async () => {
    if (estadoSeleccionado && ciudadSeleccionada) {
      const estado = estadosNorte.find((estado) => estado.nombre === estadoSeleccionado);
      const ciudad = estado.ciudades.find((ciudad) => ciudad.nombre === ciudadSeleccionada);
  
      if (ciudad && ciudad.coordenadas) {
        const [latitud, longitud] =  ubicacion.split(",").map(Number);
  
        console.log("Datos enviados al backend:", {
          id: user.id,
          latitud,
          longitud,
        });
  
        try {
          const response = await fetch(`http://localhost:8080/user-ubicacion/${user.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              latitud,
              longitud,
            }),
          });
  
          console.log("Estado de la respuesta:", response.status);
  
          if (response.ok) {
            console.log("Ubicación actualizada en la base de datos");
            setUser({ ...user, ubicacion: `${estadoSeleccionado}, ${ciudadSeleccionada}` });
          } else {
            const errorData = await response.json();
            console.error("Error al actualizar la ubicación:", errorData);
          }
        } catch (error) {
          console.error("Error de red:", error);
        }
      } else {
        alert("No se encontraron coordenadas para la ciudad seleccionada.");
      }
    } else {
      alert("Por favor selecciona un estado y una ciudad.");
    }
  
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

      // Verifica que la ubicación sea válida
      const coordRegex = /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/;

      if (!coordRegex.test(ubicacion)) {
        console.warn("Ubicación inválida, usando coordenadas predeterminadas.");
        setUbicacion("19.432608, -99.133209"); // Coordenadas de Ciudad de México
        return;
      }

      const [lat, lng] = ubicacion.split(",").map(Number);

      // Inicializa el mapa
      const mapInstance = L.map("map-ubicacion").setView([lat, lng], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstance);

      // Crea o actualiza el marcador
      const newMarker = L.marker([lat, lng], { draggable: true }).addTo(mapInstance);
      setMarker(newMarker);

      // Escucha el evento de arrastre del marcador
      newMarker.on("dragend", (e) => {
        const { lat, lng } = e.target.getLatLng();
        setUbicacion(`${lat.toFixed(6)}, ${lng.toFixed(6)}`); // Actualiza la ubicación con las coordenadas precisas
      });

      // Escucha clics en el mapa para mover el marcador
      mapInstance.on("click", (e) => {
        const { lat, lng } = e.latlng;
        newMarker.setLatLng([lat, lng]); // Mueve el marcador al lugar clicado
        setUbicacion(`${lat.toFixed(6)}, ${lng.toFixed(6)}`); // Actualiza la ubicación
      });

      setMap(mapInstance);

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
  
  return (
    <div>
      <div className="ubicacion-container" onClick={handleAbrirModal} style={{ cursor: "pointer" }}>
        <LuMap style={{ marginRight: "8px" }} />
        {ubicacion === "00" || !estadoSeleccionado || !ciudadSeleccionada
          ? "Agrega una ubicación"
          : `${estadoSeleccionado}, ${ciudadSeleccionada}`}
      </div>
  
      {modalVisible && (
        <div className="modal-overlay-local">
          <div className="modal-content-selector">
            <h2 className="texto-estados">Selecciona tu estado, ciudad y ubicación</h2>
            {/* Selección de estado */}
            <div className="acordeon-contenedor">
            <select
              value={estadoSeleccionado}
              onChange={(e) => setEstadoSeleccionado(e.target.value)}
              className="acordeon-estados"
            >
              <option value="">Selecciona un estado</option>
              {estadosNorte.map((estado) => (
                <option key={estado.nombre} value={estado.nombre} className="option-estados">
                  {estado.nombre}
                </option>
              ))}
            </select>
            <select
              value={ciudadSeleccionada}
              onChange={(e) => {
                setCiudadSeleccionada(e.target.value);
                const estado = estadosNorte.find((estado) => estado.nombre === estadoSeleccionado);
                const ciudad = estado?.ciudades.find((ciudad) => ciudad.nombre === e.target.value);

                if (ciudad && ciudad.coordenadas) {
                  const [lat, lng] = ciudad.coordenadas;
                  setUbicacion(`${lat}, ${lng}`); // Actualiza la ubicación
                  if (map) {
                    map.setView([lat, lng], 13); // Centra el mapa en las coordenadas seleccionadas
                    if (marker) {
                      marker.setLatLng([lat, lng]); // Mueve el marcador si ya existe
                    } else {
                      const newMarker = L.marker([lat, lng], { draggable: true }).addTo(map);
                      setMarker(newMarker); // Crea un nuevo marcador
                    }
                  }
                }
              }}
              className="acordeon-estados"
              disabled={!estadoSeleccionado} // Deshabilita si no hay un estado seleccionado
            >
              <option value="">Selecciona una ciudad</option>
              {estadoSeleccionado &&
                estadosNorte
                  .find((estado) => estado.nombre === estadoSeleccionado)
                  .ciudades.map((ciudad) => (
                    <option key={ciudad.nombre} value={ciudad.nombre}>
                      {ciudad.nombre}
                    </option>
                  ))}
            </select>
            </div>
            
            {/* Selección de ciudad */}
            
  
            {/* Mapa */}
            <div id="map-ubicacion" className="mapa-ubicacion"></div>
  
            {/* Botones */}
            <div className="botones-container">
              <button onClick={handleGuardarUbicacion} className="boton">
                Guardar Ubicación
              </button>
              <button onClick={handleCerrarModal} className="boton boton-cancelar">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ubicacion;