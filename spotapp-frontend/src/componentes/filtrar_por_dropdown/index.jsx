import React, { useState, useEffect, useRef } from "react";
import { FiFilter, FiHome, FiCompass, FiTrendingUp } from "react-icons/fi";

const defaultOptions = [
    { value: "all", label: "Todos" },
    { value: "nearby", label: "Cercanos" },
    { value: "top_rated", label: "Mejor valorados" },
    { value: "open_now", label: "Abiertos ahora" },
];

const categories = ["Parques", "Restaurantes", "Cafés", "Museos"];

const FiltrarPorDropdown = ({ options = defaultOptions, selectedOption, onSelect, compact = false }) => {
    const [open, setOpen] = useState(false);
    const panelRef = useRef(null);

    useEffect(() => {
        function onKey(e) {
            if (e.key === "Escape") setOpen(false);
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    useEffect(() => {
        function onOutside(e) {
            if (open && panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
        }
        // use mousedown and touchstart to capture before click handlers
        window.addEventListener("mousedown", onOutside);
        window.addEventListener("touchstart", onOutside);
        return () => {
            window.removeEventListener("mousedown", onOutside);
            window.removeEventListener("touchstart", onOutside);
        };
    }, [open]);

    function clearSelection() {
        onSelect && onSelect([]);
    }

    return (
        <div className="sm:hidden relative">
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
                    className={"z-50 flex items-center gap-2 " + (compact ? "p-2 rounded-md hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)]" : "px-3 py-2 bg-gray-100 dark:bg-[var(--bg-secondary)] text-gray-700 dark:text-[var(--text-primary)] rounded-md hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)]")}
                    aria-expanded={open}
                    aria-controls="filtrar-por-panel"
                    aria-label={compact ? 'Filtrar' : undefined}
                >
                    <FiFilter className={compact ? "w-5 h-5" : "w-4 h-4"} />
                    {!compact && <span className="text-sm">Filtrar</span>}
                </button>

            {open && (
                <div ref={panelRef} id="filtrar-por-panel" className={compact ? "absolute right-0 mt-2 z-50 sm:hidden w-64" : "absolute left-0 right-0 mt-2 z-50 sm:hidden"}>
                    <div className="mx-0 bg-white dark:bg-[var(--bg-primary)] rounded-lg shadow-lg ring-1 ring-black/5 p-3 max-h-72 overflow-y-auto w-full">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-[var(--text-primary)]">Filtros</h3>
                            <div className="flex items-center gap-2">
                                <button onClick={clearSelection} className="text-xs text-gray-600">Limpiar</button>
                                <button onClick={() => setOpen(false)} className="text-xs text-gray-600">Cerrar</button>
                            </div>
                        </div>

                        {/* Subheader (nav) - mobile */}
                        <div className="mb-2">
                            <div className="flex items-center gap-3 overflow-x-auto">
                                <button type="button" className="flex items-center gap-2 px-2 py-1 text-sm font-medium text-gray-700 dark:text-[var(--text-primary)] hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)] rounded-lg">
                                    <FiHome className="w-4 h-4" style={{ strokeWidth: 1 }} />
                                    <span>Home</span>
                                </button>
                                <div className="h-6 w-px bg-gray-300 dark:bg-[var(--border-color)]"></div>
                                <button type="button" className="flex items-center gap-2 px-2 py-1 text-sm font-medium text-gray-700 dark:text-[var(--text-primary)] hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)] rounded-lg">
                                    <FiCompass className="w-4 h-4" style={{ strokeWidth: 1 }} />
                                    <span>Explorar</span>
                                </button>
                                <div className="h-6 w-px bg-gray-300 dark:bg-[var(--border-color)]"></div>
                                <button type="button" className="flex items-center gap-2 px-2 py-1 text-sm font-medium text-gray-700 dark:text-[var(--text-primary)] hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)] rounded-lg">
                                    <FiTrendingUp className="w-4 h-4" style={{ strokeWidth: 1 }} />
                                    <span>Tendencias</span>
                                </button>
                            </div>
                        </div>

                        {/* Mini header (categories) - mobile */}
                        <div className="mb-3">
                            <div className="flex gap-2 overflow-x-auto">
                                {categories.map((c, i) => (
                                    <React.Fragment key={c}>
                                        <button type="button" className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-[var(--text-primary)] hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)] rounded-lg">
                                            <span className="truncate">{c}</span>
                                        </button>
                                        {i < categories.length - 1 && <div className="h-6 w-px bg-gray-300 dark:bg-[var(--border-color)]"></div>}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        {/* (Opciones removidas por petición: 'Todos', 'Cercanos', etc.) */}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FiltrarPorDropdown;