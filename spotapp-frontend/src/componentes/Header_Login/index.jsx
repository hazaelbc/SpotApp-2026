import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Header_Login = () => {
  const navigate = useNavigate();
  const [logoLoaded, setLogoLoaded] = useState(false);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 w-full h-16 bg-gray-900 text-white shadow-md"
      style={{ backgroundColor: '#A22522' }}
    >
      <div className="h-full px-2 sm:px-4 lg:px-6 flex items-center">
        {/* Logo - izquierda */}
        <div className="flex items-center gap-3">
          {!logoLoaded && (
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gray-700 rounded animate-pulse"></div>
          )}
          <img
            src="/Logo.png"
            alt="SpotApp Logo"
            className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 object-contain ${logoLoaded ? 'block' : 'hidden'}`}
            onLoad={() => setLogoLoaded(true)}
            onError={() => setLogoLoaded(true)} // Si falla, oculta el skeleton igual
          />
        </div>

        {/* Espaciador para empujar opciones a la derecha */}
        <div className="flex-1"></div>

        {/* Opciones - derecha */}
        <div className="flex items-center gap-2 sm:gap-4 lg:gap-8">
          <span onClick={() => navigate("/lobby") } className="text-[10px] sm:text-xs lg:text-base font-medium hover:text-gray-400 cursor-pointer uppercase tracking-tight sm:tracking-wide whitespace-nowrap">
            Iniciar Sesión
          </span>
          <span onClick={() => navigate("/registro") } className="text-[10px] sm:text-xs lg:text-base font-medium hover:text-gray-400 cursor-pointer uppercase tracking-tight sm:tracking-wide whitespace-nowrap">
            Registrarse
          </span>
          <span onClick={() => navigate("/contacto") } className="text-[10px] sm:text-xs lg:text-base font-medium hover:text-gray-400 cursor-pointer uppercase tracking-tight sm:tracking-wide whitespace-nowrap">
            Sobre Nosotros
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header_Login;
