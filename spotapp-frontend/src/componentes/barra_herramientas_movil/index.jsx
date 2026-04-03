import React, { useState } from "react";
import { FiHome, FiStar, FiPlus, FiMenu, FiUsers, FiBookmark, FiFolder, FiUser, FiLogOut } from "react-icons/fi";
import ThemeToggle from "../themeToggle";

const BarraHerramientasMovil = ({
    className = "",
    onHome,
    onFavorites,
    onCreate,
    onSaved,
    onCollections,
    onFriends,
    onProfile,
    onLogout,
}) => {
    const [isMoreOpen, setIsMoreOpen] = useState(false);

    const items = [
        { key: "home", label: "Inicio", onClick: onHome, icon: FiHome },
        { key: "favorites", label: "Favoritos", onClick: onFavorites, icon: FiStar },
        { key: "create", label: "Crear", onClick: onCreate, icon: FiPlus },
        { key: "more", label: "Más", onClick: () => setIsMoreOpen(true), icon: FiMenu },
    ];

    return (
        <>
            <nav
                className={`fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[var(--bg-primary)] border-t border-gray-200 dark:border-[var(--border-color)] shadow-sm lg:hidden z-50 ${className}`}
                style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 0.25rem)' }}
                role="navigation"
                aria-label="Barra de herramientas móvil"
            >
                <ul className="flex justify-between items-center px-1.5 sm:px-2 py-1">
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

            {isMoreOpen && (
                <div className="fixed inset-0 z-[70] lg:hidden flex items-end" role="dialog" aria-modal="true" aria-label="Más opciones">
                    <div className="absolute inset-0 bg-black/45" onClick={() => setIsMoreOpen(false)} />
                    <div className="relative w-full rounded-t-2xl bg-white dark:bg-[var(--bg-primary)] border-t border-[var(--border-color)] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] shadow-xl">
                        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-gray-300 dark:bg-[var(--border-color)]" />
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => { setIsMoreOpen(false); onFriends && onFriends(); }} className="flex items-center gap-2 px-3 py-3 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-sm text-[var(--text-primary)] transition-colors">
                                <FiUsers className="w-4 h-4" style={{ strokeWidth: 1 }} /> Amigos
                            </button>
                            <button onClick={() => { setIsMoreOpen(false); onSaved && onSaved(); }} className="flex items-center gap-2 px-3 py-3 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-sm text-[var(--text-primary)] transition-colors">
                                <FiBookmark className="w-4 h-4" style={{ strokeWidth: 1 }} /> Guardados
                            </button>
                            <button onClick={() => { setIsMoreOpen(false); onCollections && onCollections(); }} className="flex items-center gap-2 px-3 py-3 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-sm text-[var(--text-primary)] transition-colors">
                                <FiFolder className="w-4 h-4" style={{ strokeWidth: 1 }} /> Colecciones
                            </button>
                            <button onClick={() => { setIsMoreOpen(false); onProfile && onProfile(); }} className="flex items-center gap-2 px-3 py-3 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-sm text-[var(--text-primary)] transition-colors">
                                <FiUser className="w-4 h-4" style={{ strokeWidth: 1 }} /> Perfil
                            </button>
                            <div className="flex items-center justify-between gap-2 px-3 py-3 rounded-xl bg-[var(--bg-secondary)] text-sm text-[var(--text-primary)]">
                                <span className="font-medium">Tema</span>
                                <ThemeToggle />
                            </div>
                            <button onClick={() => { setIsMoreOpen(false); onLogout && onLogout(); }} className="flex items-center gap-2 px-3 py-3 rounded-xl bg-[var(--bg-secondary)] hover:bg-red-500/10 text-sm text-red-500 transition-colors">
                                <FiLogOut className="w-4 h-4" style={{ strokeWidth: 1 }} /> Cerrar sesión
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BarraHerramientasMovil;