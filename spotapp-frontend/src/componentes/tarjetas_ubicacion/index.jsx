import React from "react";

const TarjetaUbicacionIndividual = ({ imagen, nombre, calificacion, onClick, descripcion, className="" }) => {
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
        <div className="flex items-end justify-between gap-2">
          <h3 className="text-lg font-bold text-white leading-snug line-clamp-2 drop-shadow-md flex-1">
            {nombre}
          </h3>
          {calificacion > 0 && (
            <span className="flex items-center gap-1 flex-shrink-0 mb-0.5">
              <span className="text-yellow-400 text-base leading-none">★</span>
              <span className="text-white text-sm font-semibold leading-none drop-shadow-md">
                {Number(calificacion).toFixed(1)}
              </span>
            </span>
          )}
        </div>
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