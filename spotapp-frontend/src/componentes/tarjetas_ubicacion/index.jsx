import React from "react";
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
    <div 
      className="group relative w-full sm:w-[270px] h-[350px] sm:h-[400px] rounded-md overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
      onClick={onClick}
    >
      {/* Imagen de fondo */}
      <img 
        src={imagen} 
        alt={nombre} 
        className="absolute inset-0 w-full h-full object-cover z-10 transition-all duration-700 delay-0 group-hover:blur-sm group-hover:delay-700"
      />
      
      {/* Contenido inferior */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4 sm:p-5">
        {/* Título */}
        <h3 className="text-xl sm:text-2xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] mb-2 transition-opacity duration-500 delay-0 group-hover:opacity-0 group-hover:delay-500 break-words">
          {nombre}
        </h3>
        
        {/* Calificación */}
        <div className="w-full sm:w-[170px] transition-opacity duration-500 delay-0 group-hover:opacity-0 group-hover:delay-500">
          <Calificacion_ valorInicial={calificacion} onCalificar={handleCalificacion} className="stroke"/>
        </div>
      </div>
      
      {/* Descripción (aparece en hover) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 opacity-0 invisible transition-all duration-500 delay-0 group-hover:opacity-100 group-hover:visible group-hover:delay-1000 px-4 w-full max-w-[240px]">
        <p className="text-sm sm:text-base text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] text-center leading-relaxed break-words">
          {descripcion}
        </p>
      </div>
    </div>
  );
};

export default TarjetaUbicacionIndividual;