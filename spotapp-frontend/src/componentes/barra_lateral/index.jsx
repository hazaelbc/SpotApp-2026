import React from "react";
import { FiFolder, FiStar, FiBookmark, FiHome, FiPlus, FiUsers } from "react-icons/fi";
import "@radix-ui/themes/styles.css";

export const BarraLateral = ({ children, className = "", compact = false, onHome, onFavorites, onSaved, onCollections, onCreate, onFriends }) => {
    return(
        <aside className={`${compact ? 'w-full' : 'w-64'} flex ${className}`}>
            <nav className={`flex-1 flex flex-col ${compact ? 'p-0' : 'p-4'} space-y-2`}>
                {/* Sección de navegación */}
                <div className="space-y-1">
                    <button onClick={() => onHome && onHome()} className={`w-full flex items-center gap-3 ${compact ? 'pl-0 py-3' : 'py-2'} text-sm text-gray-700 dark:text-[var(--text-primary)] hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors duration-200 min-w-0`}>
                        <FiHome className="w-4 h-4 sm:w-5 sm:h-5" style={{ strokeWidth: 1 }} />
                        <span className="truncate">Home</span>
                    </button>
                    <button onClick={() => onFavorites && onFavorites()} className={`w-full flex items-center gap-3 ${compact ? 'pl-0 py-3' : 'py-2'} text-sm text-gray-700 dark:text-[var(--text-primary)] hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors duration-200 min-w-0`}>
                        <FiStar className="w-4 h-4 sm:w-5 sm:h-5" style={{ strokeWidth: 1 }} />
                        <span className="truncate">Favoritos</span>
                    </button>
                    <button onClick={() => onSaved && onSaved()} className={`w-full flex items-center gap-3 ${compact ? 'pl-0 py-3' : 'py-2'} text-sm text-gray-700 dark:text-[var(--text-primary)] hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors duration-200 min-w-0`}>
                        <FiBookmark className="w-4 h-4 sm:w-5 sm:h-5" style={{ strokeWidth: 1 }} />
                        <span className="truncate">Guardados</span>
                    </button>
                    <button onClick={() => onCollections && onCollections()} className={`w-full flex items-center gap-3 ${compact ? 'pl-0 py-3' : 'py-2'} text-sm text-gray-700 dark:text-[var(--text-primary)] hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors duration-200 min-w-0`}>
                        <FiFolder className="w-4 h-4 sm:w-5 sm:h-5" style={{ strokeWidth: 1 }} />
                        <span className="truncate">Colecciones</span>
                    </button>
                    <button onClick={() => onFriends && onFriends()} className={`w-full flex items-center gap-3 ${compact ? 'pl-0 py-3' : 'py-2'} text-sm text-gray-700 dark:text-[var(--text-primary)] hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors duration-200 min-w-0`}>
                        <FiUsers className="w-4 h-4 sm:w-5 sm:h-5" style={{ strokeWidth: 1 }} />
                        <span className="truncate">Amigos</span>
                    </button>
                </div>

                {/* Divisor + Iniciar reseña */}
                {onCreate && (
                    <div className={`${compact ? 'pt-2' : 'pt-2'}`}>
                        <div className="h-px bg-[var(--border-color)] mb-3" />
                        <button
                            onClick={onCreate}
                            className={`w-full flex items-center gap-3 ${compact ? 'pl-0 py-3' : 'py-2'} text-sm text-[var(--text-secondary)] hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors duration-200 min-w-0`}
                        >
                            <FiPlus className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" style={{ strokeWidth: 1 }} />
                            <span className="truncate">Iniciar reseña</span>
                        </button>
                    </div>
                )}
            </nav>
        </aside>
    );

};