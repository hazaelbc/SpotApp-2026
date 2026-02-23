import React, { useState } from "react";
import { FiMail, FiChevronRight, FiChevronLeft } from "react-icons/fi";
import FotoPerfil from "../foto-perfil";

export const BarraMensajes = ({ children, className = "" }) => {
    const [isOpen, setIsOpen] = useState(true);
    
    // Datos de prueba de mensajes
    const mensajes = [
        { id: 1, nombre: "María García", ultimoMensaje: "Hola! ¿Cómo estás?", tiempo: "5 min", leido: false },
        { id: 2, nombre: "Carlos López", ultimoMensaje: "Gracias por la recomendación", tiempo: "1 hora", leido: true },
        { id: 3, nombre: "Ana Martínez", ultimoMensaje: "¿Nos vemos mañana?", tiempo: "2 horas", leido: true },
    ];

    return(
        <aside className={`${isOpen ? 'w-80' : 'w-20'} h-full flex transition-all duration-300 ${className}`}>
            {/* Línea divisoria con márgenes superior e inferior */}
            <div className="py-4">
                <div className="h-full border-l border-gray-200 dark:border-[var(--border-color)]"></div>
            </div>

            <div className="flex-1 flex flex-col p-4">
                {/* Título con ícono de correo y botón de colapsar */}
                <div className="mb-4 flex items-center justify-between">
                    {isOpen ? (
                        <>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)] flex items-center gap-2">
                                <FiMail className="w-5 h-5" />
                                Mensajes
                            </h2>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors duration-200"
                                aria-label="Cerrar barra de mensajes"
                            >
                                <FiChevronRight className="w-4 h-4 text-gray-600 dark:text-[var(--text-secondary)]" />
                            </button>
                        </>
                    ) : (
                        <button 
                            onClick={() => setIsOpen(true)}
                            className="w-full p-1.5 hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors duration-200"
                            aria-label="Abrir barra de mensajes"
                        >
                            <FiChevronLeft className="w-4 h-4 text-gray-600 dark:text-[var(--text-secondary)] mx-auto" />
                        </button>
                    )}
                </div>

                {/* Lista de mensajes */}
                <div className="space-y-2">
                    {mensajes.map((mensaje) => (
                        <button
                            key={mensaje.id}
                            className={`w-full flex items-start gap-3 p-3 hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors duration-200 text-left ${!isOpen ? 'justify-center' : ''}`}
                        >
                            {/* Avatar usando FotoPerfil */}
                            <div className="relative flex-shrink-0">
                                <FotoPerfil className="w-10 h-10" />
                                {/* Indicador de no leído cuando está cerrado */}
                                {!mensaje.leido && !isOpen && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-[var(--bg-primary)]"></div>
                                )}
                            </div>

                            {/* Contenido del mensaje - solo visible cuando está abierto */}
                            {isOpen && (
                                <>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`text-sm font-medium ${!mensaje.leido ? 'text-gray-900 dark:text-[var(--text-primary)]' : 'text-gray-700 dark:text-[var(--text-secondary)]'} truncate`}>
                                                {mensaje.nombre}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-[var(--text-tertiary)] flex-shrink-0 ml-2">
                                                {mensaje.tiempo}
                                            </span>
                                        </div>
                                        <p className={`text-sm ${!mensaje.leido ? 'text-gray-700 dark:text-[var(--text-secondary)] font-medium' : 'text-gray-600 dark:text-[var(--text-tertiary)]'} truncate`}>
                                            {mensaje.ultimoMensaje}
                                        </p>
                                    </div>

                                    {/* Indicador de no leído */}
                                    {!mensaje.leido && (
                                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                    )}
                                </>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </aside>
    );
    
};

export default BarraMensajes;