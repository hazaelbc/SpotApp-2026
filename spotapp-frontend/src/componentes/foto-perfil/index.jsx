import React from "react";

export const FotoPerfil = ({
  imagen = "/fp_default.webp",
  alt = "Foto de perfil",
  className = "",
  onClick
}) => {
  const isClickable = !!onClick;

  return (
    <div
      onClick={onClick}
      className={`rounded-lg overflow-hidden border border-gray-300 shadow-lg transition-all duration-300 ${
        isClickable ? 'cursor-pointer hover:scale-[1.02] hover:shadow-xl' : ''
      } ${className}`}
    >
      <img
        src={imagen || '/fp_default.webp'}
        alt={alt}
        className="w-full h-full object-cover scale-125"
        onError={(e) => { e.currentTarget.src = '/fp_default.webp'; }}
      />
    </div>
  );
};

export default FotoPerfil;