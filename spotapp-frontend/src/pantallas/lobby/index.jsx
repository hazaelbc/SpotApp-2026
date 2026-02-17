import React from "react";
import BarraBusqueda from "../../componentes/barra-busqueda";

export const Lobby = ({ children }) => {
  return (
    <>
      <div>
        <BarraBusqueda placeholder="Buscar en la Lobby..." />
      </div>
      <h1 style={{color: "black"}}>Bienvenido a la Lobby</h1>
    </>
  )
 };

 export default Lobby;
  