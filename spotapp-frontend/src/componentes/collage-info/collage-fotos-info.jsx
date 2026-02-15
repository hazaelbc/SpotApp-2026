import React from "react";
import "./collage-fotos-info.css"; // Asegúrate de crear este archivo para los estilos

const CollageFotosInfo = ({ fotos }) => {
  return (
    <div className="collage-container">
      {fotos.map((foto, index) => (
        <img key={index} src={foto} alt={`Foto ${index + 1}`} className="collage-foto" />
      ))}
    </div>
  );
};

export default CollageFotosInfo;