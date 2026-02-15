import React from "react";
import "./comentarios.css";


const Comentario = ({ foto, link, comentario, nombre }) => {
  // Genera un color pastel aleatorio
  const generatePastelColor = () => {
    const hue = Math.floor(Math.random() * 360); // Matiz aleatorio
    return `hsl(${hue}, 70%, 85%)`; // Color pastel
  };

  const backgroundColor = generatePastelColor();

  return (
    <div className="comentario-container">
      <img src={foto} alt="Foto" className="comentario-foto" />
      <div className="comentario-content">
        {/* <p className="comentario-nombre">{nombre}</p> */}
        <div className="comentario-barra" style={{ backgroundColor }}>
        <p className="comentario-texto">{comentario}</p>
        </div>
      </div>
    </div>
  );
};

export default Comentario;