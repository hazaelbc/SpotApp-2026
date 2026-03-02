import React from "react";
import { FiCompass, FiBookmark, FiPlus, FiUser, FiSettings } from "react-icons/fi";

const BarraHerramientasMovil = ({
    className = "",
    onExplore,
    onSaved,
    onCreate,
    onProfile,
    onSettings,
}) => {
    const items = [
        { key: "saved", label: "Guardados", onClick: onSaved, icon: FiBookmark },
        { key: "create", label: "Crear", onClick: onCreate, icon: FiPlus },
        { key: "profile", label: "Perfil", onClick: onProfile, icon: FiUser },
        { key: "settings", label: "Ajustes", onClick: onSettings, icon: FiSettings },
    ];

    return (
        <nav
            className={`fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[var(--bg-primary)] border-t border-gray-200 dark:border-[var(--border-color)] shadow-sm md:hidden ${className}`}
            role="navigation"
            aria-label="Barra de herramientas móvil"
        >
            <ul className="flex justify-between items-center px-2 py-1">
                {items.map((it, idx) => {
                    const Icon = it.icon;
                    return (
                        <React.Fragment key={it.key}>
                            <li className="flex-1 text-center">
                                <button
                                    onClick={it.onClick}
                                    aria-label={it.label}
                                    className="inline-flex flex-col items-center text-gray-700 dark:text-[var(--text-secondary)] hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)] w-full p-1.5 sm:p-2 rounded-lg transition-colors duration-200"
                                >
                                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5" style={{ strokeWidth: 1 }} />
                                    <span className="text-xs font-medium text-gray-700 dark:text-[var(--text-primary)] mt-0.5">{it.label}</span>
                                </button>
                            </li>
                            {idx < items.length - 1 && (
                                <div className="h-6 w-px bg-gray-300 dark:bg-[var(--border-color)] mx-1"></div>
                            )}
                        </React.Fragment>
                    );
                })}
            </ul>
        </nav>
    );
};

export default BarraHerramientasMovil;