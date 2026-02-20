import React from "react";

export const FotoPerfil = ({ 
  imagen = "/fp_default.webp",
  alt = "Foto de perfil",
  className = "",
  onClick
}) => { 
  return (
    <div 
      onClick={onClick}
      className={`rounded-lg overflow-hidden border border-gray-300 shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${className}`}
    >
      <img 
        src={imagen} 
        alt={alt}
        className="w-full h-full object-cover scale-125"
      />
    </div>
  ); 
};

export default FotoPerfil;