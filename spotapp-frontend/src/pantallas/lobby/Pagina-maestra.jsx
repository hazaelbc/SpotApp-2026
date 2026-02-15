import React, { useState } from "react";
import { LuPlus } from "react-icons/lu";
import SearchBar from "../../componentes/search-bar/search-bar.jsx";
import Categorias from "../../componentes/categorias/categorias.jsx";
import "./lobby.css";
import TarjetasUbicacion from "../../componentes/tarjetas-ubicacion/tarjetaUbicacion.jsx";
import { useUser } from "../../userProvider.jsx";
import Perfil from "../perfil/perfil.jsx";
import CrearResena from "../crear resena/crear_resena.jsx";
import { useNavigate } from "react-router-dom";

const Lobby = () => {
  const { user, setUser } = useUser(); // usamos el user del contexto directamente

  if (!user) return <div>Cargando usuario...</div>; // Seguridad básica

  const [searchTerm, setSearchTerm] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPerfil, setShowPerfil] = useState(false);
  const [showCrearResena, setShowCrearResena] = useState(false);
  const [hoverDelayTimeout, setHoverDelayTimeout] = useState(null);
  const navigate = useNavigate(); // Hook para redirigir al usuario

  const handleLogout = () => {
    localStorage.removeItem("authToken"); // Elimina el token de autenticación
    setUser(null); // Limpia el estado del usuario en el contexto
    navigate("/"); // Redirige al inicio de sesión
  };


  const handleSearch = (value) => {
    setSearchTerm(value);
    console.log("Término de búsqueda:", value);
  };

  const handleProfileClick = () => {
    setShowPerfil(true);
    setIsExpanded(false);
  };

  const handleBackToCategories = () => {
    setShowPerfil(false);
    setShowCrearResena(false);
    setIsExpanded(false);
  };

  const handleCrearResenaClick = () => {
    setShowCrearResena(true);
    setShowPerfil(false);
    setIsExpanded(false);
  };

  return (
    <div>
      {/* MagicCard solo si NO estás en perfil ni crear reseña */}
      {!showPerfil && !showCrearResena && (
  <MagicCard
    isCardExpanded={isExpanded}
    onBackgroundFadeClick={() => setIsExpanded(false)}
    transition={{
      type: "spring",
      stiffness: 200,
      damping: 20,
    }}
  >
    <div
      className={`foto-perfil-container ${isExpanded ? "expanded" : ""}`}
      onMouseEnter={() => {
        const timeout = setTimeout(() => {
          setIsExpanded(true);
        }, 3000); // 3 segundos
        setHoverDelayTimeout(timeout);
      }}
      onMouseLeave={() => {
        if (hoverDelayTimeout) {
          clearTimeout(hoverDelayTimeout);
          setHoverDelayTimeout(null);
        }
        setIsExpanded(false);
      }}
      onClick={() => {
        if (hoverDelayTimeout) {
          clearTimeout(hoverDelayTimeout);
          setHoverDelayTimeout(null);
        }
        setShowPerfil(true);
        setIsExpanded(false);
      }}
      style={{ cursor: "pointer" }}
    >
      <img src={user.fotoPerfil} alt="Foto de perfil" />
      <p className="nombre-usuario">{user.nombre}</p>
    </div>
  </MagicCard>
)}
      <div>
        <button onClick={handleLogout} className="logout-button">
          Cerrar sesión
        </button>
        <img
            src={"/Logo.png"} // Usa la imagen del usuario o la predeterminada
            alt="Foto de perfil"
            className="logo-app"
          />
          
          <div className="search-bar">
          
          <SearchBar placeholder="Buscar usuarios..." onSearch={handleSearch} />
        </div>
      </div>
      

      <div className="contenido-principal">
        {showPerfil ? (
          <Perfil
            nombre={user.nombre}
            fotoPerfil={user.fotoPerfil}
            onBackToCategories={handleBackToCategories}
          />
        ) : showCrearResena ? (
          <CrearResena onBack={handleBackToCategories} />
        ) : (
          <div className="categorias-container">
            <Categorias onShowPerfil={handleProfileClick} searchTerm={searchTerm} />
          </div>
        )}
      </div>

      {/* Botón de crear reseña solo si NO estás viendo perfil ni creando reseña */}
      {!showPerfil && !showCrearResena && (
        <button className="crear-resena-boton" onClick={handleCrearResenaClick}>
          <LuPlus size={24} />
        </button>
      )}
    </div>
  );
};

export default Lobby;
