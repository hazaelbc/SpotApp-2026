import React from "react";
import Calificacion_ from "../calificacion/calificacion.jsx"

const TarjetaUbicacionIndividual = ({ imagen, nombre, calificacion, onClick, descripcion, className="", readOnlyRating = false }) => {
  const hasImage = imagen && typeof imagen === 'string' && imagen.trim() !== '';

  return (
    <div
      className={`group relative w-full h-[340px] rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer ${className}`}
      onClick={onClick}
    >
      {/* Fondo: imagen o gradiente fallback */}
      {hasImage ? (
        <img
          src={imagen}
          alt={nombre}
          className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900" />
      )}

      {/* Overlay gradiente siempre visible en la parte inferior */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Overlay adicional en hover para mostrar descripción */}
      <div className="absolute inset-0 z-10 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Contenido inferior — se oculta en hover */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4 transition-opacity duration-300 group-hover:opacity-0">
        <h3 className="text-lg font-bold text-white leading-snug mb-1.5 line-clamp-2 drop-shadow-md">
          {nombre}
        </h3>
        <Calificacion_ valorInicial={calificacion} onCalificar={() => {}} readOnly={readOnlyRating} className="stroke" />
      </div>

      {/* Descripción — aparece en hover */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <h3 className="text-base font-bold text-white text-center mb-2 drop-shadow-md line-clamp-2">
          {nombre}
        </h3>
        {descripcion ? (
          <p className="text-sm text-white/90 text-center leading-relaxed line-clamp-4 drop-shadow">
            {descripcion}
          </p>
        ) : (
          <p className="text-sm text-white/60 text-center italic">Sin descripción</p>
        )}
      </div>
    </div>
  );
};

export default TarjetaUbicacionIndividual;