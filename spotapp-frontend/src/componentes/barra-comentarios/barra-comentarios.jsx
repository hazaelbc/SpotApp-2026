import React, { useState } from "react";
import "./barra-comentarios.css"; // Asegúrate de tener este archivo CSS
import { LuSendHorizontal } from "react-icons/lu";

const BarraComentario = ({ onEnviar, resenaId, usuarioId }) => {
  const [comentario, setComentario] = useState("");

  const handleEnviar = async () => {
    if (comentario.trim() !== "") {
      try {
        // Realiza la solicitud POST al backend
        const response = await fetch("http://localhost:8080/comentarios-resena", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resenaId, // ID de la reseña recibido como prop
            usuarioId, // ID del usuario recibido como prop
            comentario, // Comentario escrito por el usuario
          }),
        });

        if (!response.ok) {
          throw new Error("Error al enviar el comentario");
        }

        const data = await response.json();
        console.log("Comentario enviado:", data);

        // Limpia el campo de texto
        setComentario("");

        // Llama a la función de callback si es necesario
        if (onEnviar) {
          onEnviar(data);
        }
      } catch (error) {
        console.error("Error al enviar el comentario:", error);
      }
    }
  };

  return (
    <div className="barra-comentario-container">
      <input
        type="text"
        className="barra-comentario-input"
        placeholder="Escribe un comentario..."
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
      />
      <button className="barra-comentario-boton" onClick={handleEnviar}>
        <LuSendHorizontal className="barra-comentario-icono" />
      </button>
    </div>
  );
};

export default BarraComentario;