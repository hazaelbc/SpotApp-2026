import React from "react";
import "./categoria-filtrado.css"; // Asegúrate de crear e importar este archivo CSS

const Categorias = ({ children }) => {
    return (
      <div className="categoria-general-container ">
        {children} {/* Renderiza el contenido que se pase dentro de <Categorias> */}
      </div>
    );
  };
  

export default Categorias;