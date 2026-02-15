import React from "react";
import "./tarjeta-ubicacion-individual.css";
import Comentario from "../comentarios/comentarios.jsx";
import Calificacion_ from "../calificacion/calificacion.jsx"

function safeStringify(obj) {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return; // Evita referencias cíclicas
      }
      seen.add(value);
    }
    return value;
  });
}


const TarjetaUbicacionIndividual = ({ imagen, nombre, categoria, vistas,calificacion, onClick,id,userId,descripcion}) => {
  const handleCalificacion = async (nuevaCalificacion) => {
    try {
      console.log("Nueva calificación recibida:", nuevaCalificacion); // Verifica el valor recibido
      // Verifica que el ID sea un número válido
      if (typeof id !== "number" || typeof nuevaCalificacion !== "number" || isNaN(nuevaCalificacion)) {
        console.error("ID o calificación inválidos:", { id, nuevaCalificacion });
        return;
      }
      const payload = {
        resenaId: id,
        usuarioId: userId, // Asegúrate de reemplazar esto con el usuario real si es dinámico
        calificacion: nuevaCalificacion,
      };
  
      const payloadString = JSON.stringify(payload);
      console.log("Enviando calificación:", payload);
      console.log("Tamaño del payload (caracteres):", payloadString.length);
  
      const response = await fetch("http://localhost:8080/historial-calificaciones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: payloadString,
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("Nueva calificación recibida:", nuevaCalificacion); // Verifica el valor recibido
        console.log("✅ Calificación enviada correctamente:", data);
        console.log("Datos enviados al backend:", payload);
        // Aquí podrías actualizar el estado si es necesario
      } else {
        console.log("Nueva calificación recibida:", nuevaCalificacion); // Verifica el valor recibido
        console.error("❌ Error al enviar la calificación. Código:", response.status);
        console.log("Datos enviados al backend:", payload);
        const errorText = await response.text();
        console.error("Respuesta del servidor:", errorText);
      }
    } catch (error) {
      console.error("❌ Error inesperado al enviar la calificación:", error);
    }
  };
  
  return (
    <div className="tarjeta"  onClick={onClick}>
      <div className="tarjeta-contenido">
        <h3 className="tarjeta-titulo">{nombre}</h3>
        <div className="tarjeta-calificacion">
          <Calificacion_ valorInicial={calificacion} onCalificar={handleCalificacion} className="stroke"/>
        </div>
        
      </div>
      <div className="tarjeta-contenido">
        <div className="tarjeta-descripcion">
          <p className="tarjeta-descripcion">{descripcion}</p>
      
        </div>
      </div>
     
      <img src={imagen} alt={nombre} className="tarjeta-imagen" />
      
    </div>
  );
};

export default TarjetaUbicacionIndividual;