import React from "react";
import BarraBusqueda from "../../componentes/barra-busqueda";
import FotoPerfil from "../../componentes/foto-perfil";

export const Lobby = ({ children }) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:relative sm:justify-center items-center gap-4 mt-6 px-4">
        <div className="w-full sm:max-w-2xl order-2 sm:order-1">
          <BarraBusqueda placeholder="Buscar en la Lobby..." />
        </div>
        <div className="sm:absolute sm:right-11 order-1 sm:order-2">
          <FotoPerfil className="w-14 h-14 sm:w-16 sm:h-16"/>
        </div>
      </div>
      <h1 style={{color: "black"}}>Bienvenido a la Lobby</h1>
    </>
  )
 };

 export default Lobby;
