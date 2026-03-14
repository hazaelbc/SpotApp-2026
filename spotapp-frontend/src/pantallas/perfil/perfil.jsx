import React from "react";
import "./perfil.css";
import Breadcumb_perfil from "../../componentes/breadcumbs-perfil/breadcumb-perfil";

const Perfil = ({ nombre = "Usuario Anónimo", fotoPerfil , onBackToCategories}) => {
  return (
    

    <div className="perfil-container">
      <div className="breadcrumbs">
        <Breadcumb_perfil onGoToCategories={onBackToCategories}  />  
      </div>
      {/* Encabezado con fondo */}
      <div className="perfil-header"></div>

      {/* Imagen de perfil */}
      <img
        className="perfil-avatar"
        src={fotoPerfil || '/fp_default.webp'} // Imagen por defecto local
        alt="Foto de perfil"
      />

      {/* Nombre del usuario */}
      <h2 className="perfil-nombre">{nombre}</h2>

      {/* Línea divisoria */}
      <div className="perfil-divider"></div>

      {/* Contenido adicional */}
    
    </div>
  );
};

export default Perfil;




// const ModalInfoUbicacion = ({ visible, onClose, resena}) => {
//   const [activeScreen, setActiveScreen] = useState("info"); // Estado para manejar la pantalla activa
//   const [currentResena, setCurrentResena] = useState(resena); // Estado local para mantener los datos

//   useEffect(() => {
//     let map;
  
//     if (visible && activeScreen === "map") {
//       map = L.map("map").setView([19.432608, -99.133209], 13);
  
//       L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//         attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//       }).addTo(map);
  
//       // 👇 Esto es lo importante
//       setTimeout(() => {
//         map.invalidateSize(); // Forzar a Leaflet a redibujar correctamente
//       }, 100); // Un pequeño delay ayuda a asegurar que el DOM esté renderizado
//     }
    
//     return () => {
//       if (map) {
//         map.remove(); // Limpiar al desmontar
//       }
//     };
//   }, [visible, activeScreen]);

//   if (!visible || !resena) return null;
//     console.log(resena);
//     const renderContent = () => {
//       switch (activeScreen) {
//         case "info":
//           return (
//             <div className="info">
//               <img
//                 src="https://m.media-amazon.com/images/I/917XBpa2hQL._AC_UF1000,1000_QL80_.jpg"
//                 alt="Imagen de ejemplo"
//                 className="info-image"
//               />
//               <p className="info-title">{resena.nombreLugar}</p>
//               <div  className="calificacion">
//                 <Calificacion/>
//               </div>
              
//             </div>
//           );
//         case "map":
//           return <div id="map" className="map"></div>; // Contenedor del mapa
//         default:
//           return null;
//       }
//     };

//     return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//         <Breadcrumblecookie
//           onNavigate={(screen) => setActiveScreen(screen)} // Maneja la navegación
//         />
//         {renderContent()}
//       </div>
      
//     </div>
//   );
// };

// export default ModalInfoUbicacion;










// import React,  { useState } from "react";
// import { useLocation } from "react-router-dom";
// import { FaHome, FaUserFriends, FaCog } from "react-icons/fa"; // Importa los íconos que necesites
// import SearchBar from "../../componentes/search-bar/search-bar.jsx"; // Asegúrate de que la ruta sea correcta
// import  Categorias from "../../componentes/categorias/categorias.jsx"; // Asegúrate de que la ruta sea correcta
// import "./lobby.css"; // Asegúrate de que la ruta sea correcta
// import TarjetasUbicacion from "../../componentes/tarjetas-ubicacion/tarjetaUbicacion.jsx";
// import { MagicCard } from "react-magic-motion"; // Importa MagicCard
// import "react-magic-motion/card.css"; // Importa los estilos de MagicCard

// import Perfil from "../perfil/perfil.jsx"; // A
// // 
// // segúrate de que la ruta sea correcta
// const Lobby = () => {
//   console.log("Componente Lobby renderizado");

//   // Desestructuramos directamente las propiedades del usuario desde location.state
//   const { state } = useLocation();
//   const { nombre, fotoPerfil } = state?.user || {}; // Asegúrate de que user esté definido

//   const [searchTerm, setSearchTerm] = useState("");
//   const [isExpanded, setIsExpanded] = useState(false);
//   const [showPerfil, setShowPerfil] = useState(false); // Estado para alternar entre categorías y perfil

//   // Estado para controlar la expansión
//   let hoverTimeout = null; // Variable para almacenar el temporizador

//     const handleSearch = (value) => {
//       setSearchTerm(value);
//       console.log("Término de búsqueda:", value);
//     };

//     const handleMouseEnter = () => {
//       setIsExpanded(false); // Expande el contenedor al hacer hover
//       hoverTimeout = setTimeout(() => {
//         setIsExpanded(true); // Cierra después de 3 segundos
//       }, 2000); // 3000 ms = 3 segundos
//     };
  
//     // Maneja el fin del hover
//     const handleMouseLeave = () => {
//       clearTimeout(hoverTimeout); // Cancela el temporizador si el mouse sale antes de los 3 segundos
//     };

//     const handleProfileClick = () => {
//       setShowPerfil(true); // Cambia el estado para mostrar el perfil
//     };
    
  
//     const handleBackToCategories = () => {
//       setShowPerfil(false); // Vuelve a las categorías
//     };
//     return (
//       <div>
        
//         <div
//           className="foto-perfil-container" // Cambia a la vista de perfil
//           >
//             {fotoPerfil && (
//               <img
//                 src={fotoPerfil}
//                 alt="Foto de perfil"
//               />
//             )}
//          </div>
//       <div className="search-bar">
//         <SearchBar placeholder="Buscar usuarios..." onSearch={handleSearch}/>   
//       </div>

//       <div className="contenido-principal">
//         {showPerfil ? (
//           <Perfil nombre={nombre} fotoPerfil={fotoPerfil}  onBackToCategories={handleBackToCategories} /> // Muestra el perfil
//         ) : (
//           <div className="categorias-container">
//             <Categorias onShowPerfil={handleProfileClick}/> {/* Muestra las categorías */}
//           </div>
//         )}
//       </div>
//       </div>
//     );
//   };

// export default Lobby;




// import { Breadcrumb } from "@chakra-ui/react";
// import { LuHouse, LuSmile } from "react-icons/lu";
// import "./bread-cumb.css";

// const Breadcumb_perfil = () => {
//   return (
//     <Breadcrumb.Root>
//       <Breadcrumb.List>
//         {/* Elemento estático: Información */}
//         <Breadcrumb.Item>
//           <Breadcrumb.Link href="#" className="breadcrumb-link active">
//             <LuHouse />
//             Inicio
//           </Breadcrumb.Link>
//         </Breadcrumb.Item>
//         <Breadcrumb.Separator />

//         {/* Elemento estático: Mapa */}
//         <Breadcrumb.Item>
//           <Breadcrumb.Link href="#" className="breadcrumb-link">
//             <LuSmile />
//             Pefil
//           </Breadcrumb.Link>
//         </Breadcrumb.Item>
//       </Breadcrumb.List>
//     </Breadcrumb.Root>
//   );
// };

// export default Breadcumb_perfil;