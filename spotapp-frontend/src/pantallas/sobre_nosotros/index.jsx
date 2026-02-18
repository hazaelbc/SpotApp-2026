import React from "react";
import Header_Login from "../../componentes/Header_Login";

const SobreNosotros = ({ children }) => {
  return (
    <>
      <Header_Login />
      <div 
        className="relative flex justify-center items-center min-h-screen pt-16 px-4 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bg_login.webp')" }}
      >
        {/* Overlay con opacidad y desenfoque */}
        <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm"></div>
        
        {/* Contenido sobre el overlay */}
        <div className="relative z-10 w-full">
          {children}
        </div>
      </div>
    </>
  );
};

export default SobreNosotros;