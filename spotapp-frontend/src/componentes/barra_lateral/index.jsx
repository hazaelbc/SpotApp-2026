import React from "react";
import { FiFolder, FiStar, FiBookmark, FiTrendingUp } from "react-icons/fi";
import "@radix-ui/themes/styles.css";

export const BarraLateral = ({ children, className = "" }) => {
    return(
        <aside className={`w-64 h-full flex ${className}`}>
            <nav className="flex-1 flex flex-col p-4 space-y-2">
                {/* Sección de navegación */}
                <div className="space-y-1">
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-[var(--text-primary)] hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors duration-200">
                        <FiStar className="w-4 h-4" />
                        <span>Favoritos</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-[var(--text-primary)] hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors duration-200">
                        <FiBookmark className="w-4 h-4" />
                        <span>Guardados</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-[var(--text-primary)] hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors duration-200">
                        <FiFolder className="w-4 h-4" />
                        <span>Colecciones</span>
                    </button>
                </div>
            </nav>

            {/* Línea divisoria con márgenes superior e inferior */}
            <div className="py-4">
                <div className="h-full border-r border-gray-200 dark:border-[var(--border-color)]"></div>
            </div>
        </aside>
    );

};