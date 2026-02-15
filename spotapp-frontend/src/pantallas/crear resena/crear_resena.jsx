import React, { useState, useEffect } from "react";
import { LuCamera } from "react-icons/lu";
import "./crear_resena.css";
import L from "leaflet";
import "../../../node_modules/leaflet/dist/leaflet.css";
import { useUser } from "../../userProvider"; 

const estados_Norte = [
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

  const CrearResena = ({onBack}) => {
    const [estadoSeleccionado, setEstadoSeleccionado] = useState("");
    const [ciudadSeleccionada, setCiudadSeleccionada] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [map, setMap] = useState(null);
    const [marker, setMarker] = useState(null);
    const [ubicacion, setUbicacion] = useState("");
    const { user } = useUser(); 
    
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState({
        recreativos: false,
        restaurantes: false,
        parques: false,
        petFriendly: false,
      });
      const [imagenSeleccionada, setImagenSeleccionada] = useState(null);

      const validarCampos = () => {
        if (!imagenSeleccionada) {
          alert("Por favor selecciona una imagen.");
          return false;
        }
        if (!estadoSeleccionado) {
          alert("Por favor selecciona un estado.");
          return false;
        }
        if (!ciudadSeleccionada) {
          alert("Por favor selecciona una ciudad.");
          return false;
        }
        if (!categoriaSeleccionada) {
          alert("Por favor selecciona una categoría.");
          return false;
        }
        if (!ubicacion) {
          alert("Por favor selecciona una ubicación en el mapa.");
          return false;
        }
        return true;
      };

      const handleImagenSeleccionada = (e) => {
        const file = e.target.files[0];
        if (file) {
          setImagenSeleccionada(file); // Guardar la imagen seleccionada en el estado
        }
      };

    const handleAbrirModal = () => {
      if (estadoSeleccionado && ciudadSeleccionada) {
        setModalVisible(true);
      } else {
        alert("Por favor selecciona un estado y una ciudad.");
      }
    };
  
    const handleCerrarModal = () => {
      if (map) {
        map.remove();
        setMap(null);
      }
      setModalVisible(false);
    };

    const handleCategoriaChange = (event) => {
        setCategoriaSeleccionada({
          ...categoriaSeleccionada,
          [event.target.name]: event.target.checked,
        });
      };
   
    useEffect(() => {
      if (modalVisible) {
        const ciudad = estados_Norte
          .find((estado) => estado.nombre === estadoSeleccionado)
          .ciudades.find((ciudad) => ciudad.nombre === ciudadSeleccionada);
  
        const [lat, lng] = ciudad.coordenadas;
  
        const mapInstance = L.map("map-ubicacion").setView([lat, lng], 13);
  
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapInstance);
  
        mapInstance.on("click", (e) => {
          const { lat, lng } = e.latlng;
  
          if (marker) {
            marker.setLatLng([lat, lng]);
          } else {
            const newMarker = L.marker([lat, lng], { draggable: true }).addTo(mapInstance);
            setMarker(newMarker);
          }
  
          setUbicacion(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        });
  
        setMap(mapInstance);
  
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

    useEffect(() => {
        if (ciudadSeleccionada) {
            const ciudad = estados_Norte
              .find((estado) => estado.nombre === estadoSeleccionado)
              .ciudades.find((ciudad) => ciudad.nombre === ciudadSeleccionada);
      
            const [lat, lng] = ciudad.coordenadas;
      
            // Si ya existe un mapa, actualiza su vista
            if (map) {
              map.setView([lat, lng], 13);
              if (marker) {
                marker.setLatLng([lat, lng]);
              } else {
                const newMarker = L.marker([lat, lng], { draggable: true }).addTo(map);
                setMarker(newMarker);
              }
            } else {
              // Crear un nuevo mapa
              const mapInstance = L.map("map-ubicacion").setView([lat, lng], 13);
      
              L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution:
                  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
              }).addTo(mapInstance);
      
              const newMarker = L.marker([lat, lng], { draggable: true }).addTo(mapInstance);
              setMarker(newMarker);
      
              mapInstance.on("click", (e) => {
                const { lat, lng } = e.latlng;
                newMarker.setLatLng([lat, lng]);
                setUbicacion(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
              });
      
              setMap(mapInstance);
            }
          }
      }, [ciudadSeleccionada]);

    const handleSubmit = async (e) => {
      e.preventDefault();
  
      if (!validarCampos()) return; // Validar los campos antes de enviar
  
      const formData = new FormData();
      formData.append("usuarioId", user.id);
      formData.append("latitud", parseFloat(ubicacion.split(",")[0]));
      formData.append("longitud", parseFloat(ubicacion.split(",")[1]));
      formData.append("nombreLugar", document.getElementById("nombreLugar").value);
      formData.append("categoriaId", categoriaSeleccionada); // ID de la categoría
      formData.append("descripcion", document.getElementById("descripcion").value);
      if (imagenSeleccionada) {
        formData.append("fotoPrincipal", imagenSeleccionada); // Imagen seleccionada
      }
  
      try {
        const response = await fetch("http://localhost:8080/resenas", {
          method: "POST",
          body: formData, // Enviar como FormData
        });
  
        const data = await response.json();
  
        if (response.ok) {
          alert("Reseña creada con éxito.");
          onBack(); // Regresar al lobby
        } else {
          alert(`Error al crear la reseña: ${data.message}`);
        }
      } catch (error) {
        console.error("Error al enviar la reseña:", error);
        alert("Error al conectar con el servidor.");
      }
    };
  
    return (
      <div className="crear-resena-container">
        <div className="crear-resena-form">
          {/* Sección para subir imágenes */}
          <div className="crear-resena-imagenes">
                {imagenSeleccionada ? (
                    <div className="imagen-preview">
                    <img src={URL.createObjectURL(imagenSeleccionada)} alt="Vista previa" />
                    </div>
                ) : (
                    <div className="imagen-placeholder">
                    <LuCamera className="icono-imagen" />
                    <p>Selecciona 1 foto</p>
                    <p className="advertencia-tamano-foto">Procura que sea una imagen vertical</p>
                    </div>
                )}
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImagenSeleccionada}
                    className="input-imagen"
                />
            </div>
  
          {/* Sección de campos de texto */}
          <div className="crear-resena-campos">
            <div className="campo">
              <label htmlFor="nombreLugar">Nombre del lugar</label>
              <input type="text" id="nombreLugar" placeholder="Escribe el nombre" />
            </div>
            
            <div className="campo-linea">
            <div className="campo">
                <label>Estado</label>
                <select
                value={estadoSeleccionado}
                onChange={(e) => setEstadoSeleccionado(e.target.value)}
                >
                <option value="">Selecciona un estado</option>
                {estados_Norte.map((estado) => (
                    <option key={estado.nombre} value={estado.nombre}>
                    {estado.nombre}
                    </option>
                ))}
                </select>
            </div>
            <div className="campo">
                <label>Ciudad</label>
                <select
                value={ciudadSeleccionada}
                onChange={(e) => setCiudadSeleccionada(e.target.value)}
                disabled={!estadoSeleccionado}
                >
                <option value="">Selecciona una ciudad</option>
                {estadoSeleccionado &&
                    estados_Norte
                    .find((estado) => estado.nombre === estadoSeleccionado)
                    .ciudades.map((ciudad) => (
                        <option key={ciudad.nombre} value={ciudad.nombre}>
                        {ciudad.nombre}
                        </option>
                    ))}
                </select>
            </div>
            </div>
            <p className="comentario_recomendacion">Cuando tengas tu ubicacion da un click para seleccionar la ubicacion exacta</p>
            <div className="container-mapa">
                 <div id="map-ubicacion" className="mapa_local"></div>
                 <p>Coordenadas seleccionadas: {ubicacion || "No se ha seleccionado una ubicación"}</p>
            </div>
            <FormControl component="fieldset" variant="standard">
              <FormLabel component="legend">Categoría del lugar</FormLabel>
              <FormGroup
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)", // Dos columnas
                  gap: "1rem", // Espaciado entre los elementos
                }}
              >
                <FormControlLabel
                  control={
                    <Radio
                      checked={categoriaSeleccionada === 1}
                      onChange={() => setCategoriaSeleccionada(1)} // Recreativos = 1
                      value={1}
                      name="categoria"
                    />
                  }
                  label="Lugares recreativos"
                  sx={{
                    color: "#1C1C1C", // Cambia el color del texto a negro
                  }}
                />
                <FormControlLabel
                  control={
                    <Radio
                      checked={categoriaSeleccionada === 2}
                      onChange={() => setCategoriaSeleccionada(2)} // Restaurantes = 2
                      value={2}
                      name="categoria"
                    />
                  }
                  label="Restaurantes"
                  sx={{
                    color: "#1C1C1C", // Cambia el color del texto a negro
                  }}
                />
                <FormControlLabel
                  control={
                    <Radio
                      checked={categoriaSeleccionada === 3}
                      onChange={() => setCategoriaSeleccionada(3)} // Parques = 3
                      value={3}
                      name="categoria"
                    />
                  }
                  label="Parques"
                  sx={{
                    color: "#1C1C1C", // Cambia el color del texto a negro
                  }}
                />
                <FormControlLabel
                  control={
                    <Radio
                      checked={categoriaSeleccionada === 4}
                      onChange={() => setCategoriaSeleccionada(4)} // Pet Friendly = 4
                      value={4}
                      name="categoria"
                    />
                  }
                  label="Pet Friendly"
                  sx={{
                    color: "#1C1C1C", // Cambia el color del texto a negro
                  }}
                />
              </FormGroup>
            </FormControl>
            <div className="campo">
              <label htmlFor="descripcion">Descripción</label>
              <textarea id="descripcion" placeholder="Agrega una descripción" rows="4"></textarea>
            </div>
            {/* Selección de estado y ciudad */}
            
            
          </div>
        </div>
  
        {/* Modal con mapa */}
        {modalVisible && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Selecciona la ubicación exacta</h2>
              <div id="map-ubicacion" className="mapa"></div>
              <div className="botones-modal">
                <button onClick={handleCerrarModal}>Cancelar</button>
                <button
                  onClick={() => {
                    alert(`Ubicación seleccionada: ${ubicacion}`);
                    handleCerrarModal();
                  }}
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}
  
        {/* Botones de acción */}
        <div className="crear-resena-botones">
         <button className="btn cancelar" onClick={onBack}>Cancelar</button>
          <button className="btn aceptar" onClick={handleSubmit}>Aceptar</button>
          
        </div>
      </div>
    );
  };
  
  export default CrearResena;