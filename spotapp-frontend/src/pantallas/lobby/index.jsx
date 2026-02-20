import React from "react";
import BarraBusqueda from "../../componentes/barra-busqueda";
import FotoPerfil from "../../componentes/foto-perfil";
import ThemeToggle from "../../componentes/themeToggle";
import { useUser } from "../../userProvider";
import { FiBell, FiMail, FiHome, FiCompass } from "react-icons/fi";

export const Lobby = ({ children }) => {
  const { user } = useUser();

  return (
    <>
      {/* Header */}
      <div className="w-full px-4 transition-colors duration-200">
        <div className="py-4 border-b border-gray-200 dark:border-[var(--border-color)]">
          {/* Primera línea: Perfil y herramientas */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Foto de perfil y nombre */}
            <FotoPerfil className="w-8 h-8 sm:w-12 sm:h-12" />
            <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-[var(--text-primary)] truncate max-w-[80px] sm:max-w-none">
              {user?.nombre || "Usuario"}
            </span>
            
            {/* Línea divisora */}
            <div className="h-6 sm:h-8 w-px bg-gray-300 dark:bg-[var(--border-color)] mx-1 sm:mx-2"></div>
            
            {/* Herramientas: home, explorar, notificaciones y mensajes */}
            <div className="flex items-center gap-1 sm:gap-3">
              <button 
                className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors duration-200"
                aria-label="Home"
              >
                <FiHome className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-[var(--text-secondary)]" />
              </button>
              <button 
                className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors duration-200"
                aria-label="Explorar"
              >
                <FiCompass className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-[var(--text-secondary)]" />
              </button>
              <button 
                className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors duration-200"
                aria-label="Notificaciones"
              >
                <FiBell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-[var(--text-secondary)]" />
              </button>
              <button 
                className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors duration-200"
                aria-label="Mensajes"
              >
                <FiMail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-[var(--text-secondary)]" />
              </button>
            </div>
            
            {/* Toggle de tema */}
            <ThemeToggle />

            {/* Línea divisora - solo visible en pantallas grandes */}
            <div className="hidden sm:block h-8 w-px bg-gray-300 dark:bg-[var(--border-color)] mx-2"></div>

            {/* Barra de búsqueda - solo visible en pantallas grandes */}
            <div className="hidden sm:block flex-1 max-w-md">
              <BarraBusqueda placeholder="Buscar en la Lobby..." />
            </div>
          </div>

          {/* Segunda línea: Barra de búsqueda en móvil */}
          <div className="sm:hidden mt-3">
            <BarraBusqueda placeholder="Buscar en la Lobby..." />
          </div>
        </div>
      </div>

      <h1 className="text-gray-900 dark:text-white">Bienvenido a la Lobby</h1>
    </>
  )
 };

 export default Lobby;
