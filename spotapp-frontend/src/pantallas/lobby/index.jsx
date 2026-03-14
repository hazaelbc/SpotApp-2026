import React, { useState, useEffect, useRef } from "react";
import BarraBusqueda from "../../componentes/barra-busqueda";
import FotoPerfil from "../../componentes/foto-perfil";
import Ubicacion from "../../componentes/Ubicacion/ubicacion.jsx";
import ThemeToggle from "../../componentes/themeToggle";
import { BarraLateral } from "../../componentes/barra_lateral";
import { BarraMensajes } from "../../componentes/barra_mensajes";
import TarjetaUbicacionIndividual from "../../componentes/tarjetas_ubicacion";
import BarraHerramientasMovil from "../../componentes/barra_herramientas_movil";
import { useUser } from "../../userProvider";
import { FiBell, FiHome, FiCompass, FiSettings, FiTrendingUp, FiMap, FiFilter, FiMail } from "react-icons/fi";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import DropdownFiltrarPor from "../../componentes/filtrar_por_dropdown";
import PerfilTarjetaUbicacion from "../../componentes/perfil_tarjeta_ubicacion";
import SavedList from "../../componentes/saved_list";

export const Lobby = ({ children }) => {
  const { user } = useUser();

  const [location, setLocation] = useState('');
  const [draftLocation, setDraftLocation] = useState('');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isMobileSearchVisible, setIsMobileSearchVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [viewMode, setViewMode] = useState('all'); // 'all' | 'favorites' | 'saved'

  useEffect(() => {
    try {
      const stored = localStorage.getItem('spotapp_location');
      if (stored) {
        setLocation(stored);
        setDraftLocation(stored);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="w-full px-4 transition-colors duration-200 flex-shrink-0">
          <div className="py-3 lg:py-2 border-b border-gray-200 dark:border-[var(--border-color)]">
          {/* Primera línea: Perfil y herramientas */}
          <div className="flex items-center gap-2 lg:gap-4">
            
            {/* Foto de perfil y nombre (ocultos en app; visibles en desktop lg+) */}
            <FotoPerfil
              className="hidden lg:block w-10 h-10 lg:w-12 lg:h-12 aspect-square rounded-lg overflow-hidden flex-shrink-0"
              onClick={() => console.log("Ir al perfil")}
            />
            <span className="hidden lg:inline-block text-base font-medium text-gray-900 dark:text-[var(--text-primary)] truncate max-w-[120px]">
              {user?.nombre || "Usuario"}
            </span>
            
            {/* Línea divisora (solo escritorio) */}
            <div className="hidden lg:block h-6 sm:h-8 w-px bg-gray-300 dark:bg-[var(--border-color)] mx-1 lg:mx-2"></div>
            
            {/* Herramientas: notificaciones */}
            <div className="flex items-center gap-1 sm:gap-3">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="p-2 sm:p-2 hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    aria-label="Notificaciones"
                    >
                    <FiBell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-[var(--text-secondary)]" style={{ strokeWidth: 1 }} />
                  </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                  <DropdownMenu.Content sideOffset={6} align="center" className="w-80 bg-white dark:bg-[var(--bg-primary)] rounded-lg shadow-lg ring-1 ring-black/5 overflow-hidden z-50 origin-top">
                    <div className="px-3 py-2 flex items-center justify-between border-b border-gray-100 dark:border-[var(--border-color)]">
                      <span className="text-sm font-medium text-gray-900 dark:text-[var(--text-primary)]">Notificaciones</span>
                      <button className="text-xs text-blue-600 hover:underline">Marcar todo leído</button>
                    </div>

                    <div className="max-h-64  overflow-y-auto">
                      <DropdownMenu.Item className="flex items-start gap-3 px-3 py-3 hover:bg-gray-50 dark:hover:bg-[var(--bg-tertiary)] [data-highlighted]:bg-gray-100">
                        <FotoPerfil className="w-8 h-8 aspect-square rounded-lg overflow-hidden flex-shrink-0" imagen="/fp_default.webp" alt="Reseñador" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 dark:text-[var(--text-primary)] truncate">Nueva reseña en Café Central: "Excelente servicio y ambiente"</p>
                          <p className="text-xs text-gray-500">Hace 2 horas</p>
                        </div>
                      </DropdownMenu.Item>

                      <DropdownMenu.Item className="flex items-start gap-3 px-3 py-3 hover:bg-gray-50 dark:hover:bg-[var(--bg-tertiary)] [data-highlighted]:bg-gray-100">
                        <FotoPerfil className="w-8 h-8 aspect-square rounded-lg overflow-hidden flex-shrink-0" imagen="/fp_default.webp" alt="Sistema" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 dark:text-[var(--text-primary)] truncate">Sistema: tu publicación fue aprobada</p>
                          <p className="text-xs text-gray-500">1 día</p>
                        </div>
                      </DropdownMenu.Item>

                      <DropdownMenu.Item className="flex items-start gap-3 px-3 py-3 hover:bg-gray-50 dark:hover:bg-[var(--bg-tertiary)] [data-highlighted]:bg-gray-100">
                        <FotoPerfil className="w-8 h-8 aspect-square rounded-lg overflow-hidden flex-shrink-0" imagen="/fp_default.webp" alt="Usuario Juan" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 dark:text-[var(--text-primary)] truncate">Usuario Juan comentó tu reseña</p>
                          <p className="text-xs text-gray-500">3 días</p>
                        </div>
                      </DropdownMenu.Item>
                    </div>

                    <div className="px-3 py-2 border-t border-gray-100 dark:border-[var(--border-color)]">
                      <DropdownMenu.Item className="w-full text-center text-sm text-gray-600 hover:text-gray-800">Ver todas las notificaciones</DropdownMenu.Item>
                    </div>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>             
            </div>

            {/* Divisor específico entre notificaciones y ubicación (solo app mode) */}
            <div className="lg:hidden block h-6 w-px bg-gray-300 dark:bg-[var(--border-color)] mx-2"></div>

            {/* Línea divisora - solo visible en pantallas grandes */}
            <div className="hidden lg:block h-8 w-px bg-gray-300 dark:bg-[var(--border-color)] mx-2"></div>

            <div className="flex">
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="flex items-center gap-2 p-2 sm:p-2 hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Seleccionar ubicación"
                title={(user?.ubicacionLabel) || location || 'Click para seleccionar ubicación'}
              >
                <FiMap className="w-5 h-5 text-gray-600 dark:text-[var(--text-secondary)]" style={{ strokeWidth: 1 }} />
                <div className="hidden lg:block flex-1 min-w-0 max-w-[260px]">
                  <div
                    role="navigation"
                    aria-label="breadcrumb"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {(() => {
                      const label = user?.ubicacionLabel || location;
                      if (!label) {
                        return (
                          <span style={{
                            color: 'var(--text-tertiary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            Click para seleccionar ubicación
                          </span>
                        );
                      }
                      const parts = String(label).split(/[<>]/).map(p => p.trim()).filter(Boolean);
                      return parts.map((part, i) => (
                        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <span style={{
                            maxWidth: i === parts.length - 1 ? '140px' : '90px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: i === parts.length - 1 ? 'var(--text-primary)' : 'var(--text-secondary)',
                            fontWeight: i === parts.length - 1 ? 700 : 500,
                            display: 'inline-block'
                          }}>{part}</span>
                          {i < parts.length - 1 && (
                            <span style={{ margin: '0 6px', color: 'var(--text-tertiary)' }}>›</span>
                          )}
                        </span>
                      ));
                    })()}
                  </div>
                </div>
              </button>
            </div>

            <div className="hidden lg:block h-8 w-px bg-gray-300 dark:bg-[var(--border-color)] mx-2"></div>

            {/* Barra de búsqueda - solo visible en desktop */}
            <div className="hidden lg:block flex-1 max-w-md">
              <BarraBusqueda placeholder="Buscar en la Lobby..." />
            </div>

            {/* Configuración y Toggle de tema - esquina derecha */}
            <div className="ml-auto flex items-center gap-2">
              {/* Messages button - visible in app mode only */}
              <button onClick={() => setIsMessagesOpen(true)} className="lg:hidden p-2 rounded-md hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label="Mensajes">
                <FiMail className="w-5 h-5 text-gray-700 dark:text-[var(--text-secondary)]" style={{ strokeWidth: 1 }} />
              </button>
              {/* Theme toggle and config - desktop only */}
              <div className="hidden lg:flex items-center gap-2">
                <ThemeToggle />
                <button 
                  className="flex items-center gap-2 px-3 py-1.5 sm:py-2 hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors duration-200"
                  aria-label="Configuración"
                >
                  <FiSettings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-[var(--text-secondary)]" style={{ strokeWidth: 1 }} />
                  <span className="text-sm font-medium text-gray-700 dark:text-[var(--text-primary)]">Configuración</span>
                </button>
              </div>
            </div>
          </div>

          {/* Segunda línea: Barra de búsqueda en app mode + icono de filtrar */}
          <div className="lg:hidden mt-3 sticky top-12 z-20 px-4">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <BarraBusqueda placeholder="Buscar en la Lobby..." />
              </div>
              <div className="flex-shrink-0">
                <DropdownFiltrarPor compact onSelect={(v) => { console.log('Filtro seleccionado', v); setIsFiltersOpen(false); }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Layout principal: Barra lateral + Contenido + Barra de mensajes */}
      <div className="flex flex-1 overflow-hidden">
        {/* Barra lateral - solo desktop (lg+) */}
        <div className="hidden lg:block">
          <BarraLateral onFavorites={() => { setViewMode('favorites'); setSelectedCard(null); }} onSaved={() => { setViewMode('saved'); setSelectedCard(null); }} onCollections={() => { setViewMode('collections'); setSelectedCard(null); }} /> 
        </div>
        <div className="py-4">
          <div className="hidden lg:block h-full border-r border-gray-200 dark:border-[var(--border-color)]"></div>
        </div>
        {/* Contenido principal */}
        <main className="flex-1 overflow-y-auto">
          {/* Combined sticky header: main subheader + mini-header - desktop only */}
          <div className="hidden lg:block sticky top-0 z-50 bg-[var(--bg-primary)] backdrop-blur-sm shadow-sm">
            <div className="px-4 py-1">
              {/* Secciones de navegación (subheader) */}
              <div className="flex flex-wrap gap-3 sm:gap-6 justify-start sm:justify-center items-center">
                <button aria-label="Home" className="flex items-center gap-2 px-2 py-1 text-sm sm:text-base sm:px-4 sm:py-1.5 font-medium text-gray-700 dark:text-[var(--text-primary)] hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                  <FiHome className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5" style={{ strokeWidth: 1 }} />
                  <span>Home</span>
                </button>
                <div className="hidden lg:block h-6 w-px bg-gray-300 dark:bg-[var(--border-color)]"></div>
                <button aria-label="Explorar" className="flex items-center gap-2 px-2 py-1 text-sm sm:text-base sm:px-4 sm:py-1.5 font-medium text-gray-700 dark:text-[var(--text-primary)] hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                  <FiCompass className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5" style={{ strokeWidth: 1 }} />
                  <span>Explorar</span>
                </button>
                <div className="hidden lg:block h-6 w-px bg-gray-300 dark:bg-[var(--border-color)]"></div>
                <button aria-label="Tendencias" className="flex items-center gap-2 px-2 py-1 text-sm sm:text-base sm:px-4 sm:py-1.5 font-medium text-gray-700 dark:text-[var(--text-primary)] hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                  <FiTrendingUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5" style={{ strokeWidth: 1 }} />
                  <span>Tendencias</span>
                </button>
              </div>
            </div>

            {/* Mini-header (inside same sticky container) */}
            <div className="px-4">
              <div className="flex flex-nowrap sm:flex-wrap gap-2 sm:gap-6 justify-start sm:justify-center items-center h-8 overflow-hidden border-t border-[var(--border-color)]">
                <button
                  onClick={() => setIsFiltersOpen(true)}
                  className="sm:hidden flex items-center gap-2 px-2 py-1 text-xs font-medium text-gray-700 dark:text-[var(--text-primary)] hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)] rounded-lg"
                  aria-label="Filtros"
                >
                  <FiFilter className="w-4 h-4" style={{ strokeWidth: 1 }} />
                  <span>Filtros</span>
                </button>
                {[
                  {
                    label: "Parques",
                    icon: (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 align-middle" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2C7.03 2 2.5 6.03 2.5 11c0 4.97 4.53 9 9.5 9s9.5-4.03 9.5-9c0-4.97-4.53-9-9.5-9zm0 2c3.87 0 7 3.13 7 7 0 3.87-3.13 7-7 7s-7-3.13-7-7c0-3.87 3.13-7 7-7zm0 3a4 4 0 100 8 4 4 0 000-8z"/></svg>
                    )
                  },
                  {
                    label: "Restaurantes",
                    icon: (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 align-middle" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 21v-2a4 4 0 014-4h8a4 4 0 014 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    )
                  },
                  {
                    label: "Cafés",
                    icon: (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 align-middle" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 19V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14"/><path d="M7 10h10M7 14h10"/></svg>
                    )
                  },
                  {
                    label: "Museos",
                    icon: (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 21V7a4 4 0 018 0v14"/><path d="M8 21h8"/></svg>
                    )
                  }
                ].map((cat, idx, arr) => (
                  <React.Fragment key={cat.label}>
                    <button aria-label={`Filtrar por ${cat.label}`} className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-4 text-xs sm:text-sm font-medium text-gray-700 dark:text-[var(--text-primary)] hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors duration-200 bg-transparent min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                      {cat.icon}
                      <span className="truncate whitespace-nowrap min-w-0">{cat.label}</span>
                    </button>
                    {idx < arr.length - 1 && (
                      <div className="h-6 w-px bg-gray-300 dark:bg-[var(--border-color)]"></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
            {/* Línea divisoria final */}
            <div className="px-4">
              <div className="border-b border-[var(--border-color)]"></div>
            </div>
          </div>

          {/* Contenido scrolleable */}
          <div className="p-4">
          
          {/* Lista de tarjetas o vista detalle (desktop) */}
          {selectedCard ? (
            <PerfilTarjetaUbicacion item={selectedCard} onBack={() => setSelectedCard(null)} />
          ) : (
            viewMode === 'favorites' || viewMode === 'saved' ? (
              <SavedList mode={viewMode === 'saved' ? 'saved' : 'favorites'} onSelect={(c) => setSelectedCard(c)} />
            ) : (
              <CardsList onSelect={setSelectedCard} children={children} />
            )
          )}
          </div>
        </main>

        {/* Barra de mensajes - oculta en móvil y tablets */}
        <div className="hidden lg:block">
          <BarraMensajes />
        </div>
      </div>

      {/* Sidebar removed - replaced by mobile navigation bar */}

      {/* Messages Drawer (mobile) */}
      <div className={`fixed inset-y-0 right-0 z-50 w-80 transform bg-white dark:bg-[var(--bg-primary)] shadow-lg transition-transform duration-200 ${isMessagesOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-[var(--text-primary)]">Mensajes</h3>
            <button onClick={() => setIsMessagesOpen(false)} className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)]">Cerrar</button>
          </div>
          <BarraMensajes />
        </div>
      </div>

      {/* Filters Modal (mobile) */}
      <div className={`${isFiltersOpen ? 'fixed inset-0 z-50 flex items-center justify-center' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50" onClick={() => setIsFiltersOpen(false)}></div>
        <div className="relative z-60 w-full max-w-sm mx-4 bg-white dark:bg-[var(--bg-primary)] rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-[var(--border-color)] flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 dark:text-[var(--text-primary)]">Filtros</h4>
            <button onClick={() => setIsFiltersOpen(false)} className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)]">Cerrar</button>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-600">Aquí van los filtros (checkboxes y opciones).</p>
          </div>
        </div>
      </div>
      {/* Modal de ubicación - controlado por el botón del header */}
      <Ubicacion
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />

      {/* Mobile navigation bar (fixed, visible only on mobile) */}
      <BarraHerramientasMovil
        onExplore={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onSaved={() => { setViewMode('saved'); setSelectedCard(null); }}
        onCreate={() => setIsFiltersOpen(true)}
        onProfile={() => console.log('Ir al perfil')}
        onSettings={() => {}}
      />
    </div>
  )
 };

 export default Lobby;

/* Helper component: Cards list with infinite scroll (mobile) and responsive grid (desktop) */
function CardsList({ children, onSelect }){
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cols, setCols] = useState(1);
  const pageRef = useRef(0);
  const containerRef = useRef(null);
  const rowsPerPageRef = useRef(3);

  useEffect(() => {
    const el = containerRef.current || document.body;

    function calculateCols() {
      const width = el.clientWidth || window.innerWidth;
      const estimated = Math.max(1, Math.floor(width / 220));
      setCols(estimated);
    }

    calculateCols();
    const ro = new ResizeObserver(() => calculateCols());
    if (containerRef.current) ro.observe(containerRef.current);

    // initial load
    loadMoreCards();

    return () => {
      try { if (containerRef.current) ro.unobserve(containerRef.current); } catch(e){}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const needed = cols * rowsPerPageRef.current;
    if (cards.length < needed && hasMore && !loading) {
      loadMoreCards();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cols]);

  function generateCard(id){
    const pics = [
      '/examples/ensenada1.svg',
      '/examples/ensenada2.svg',
      '/examples/ensenada3.svg',
      '/examples/ensenada4.svg',
    ];
    const names = ['Malecón Ensenada','Plaza Cívica','Punta Banda','Calle Primera','Mercado Hidalgo','Zona Centro'];
    // Base coords for Ensenada
    const baseLat = 31.8667;
    const baseLng = -116.5964;
    const offset = ((id % 5) - 2) * 0.002; // small spread
    return {
      id,
      nombre: names[id % names.length] + (id > names.length ? ` ${id}` : ''),
      categoria: ['Café','Restaurante','Parque','Museo'][id % 4],
      descripcion: 'Descripción breve de ejemplo para la tarjeta. Aquí va un texto resumido.',
      imagen: pics[id % pics.length],
      calificacion: 3 + (id % 3) + 0.5 * ((id+1)%2),
      vistas: 50 + id * 3,
      lat: +(baseLat + offset).toFixed(6),
      lng: +(baseLng + offset).toFixed(6),
    };
  }

  async function loadMoreCards(){
    if(loading || !hasMore) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 350));
    const next = [];
    const columns = cols || Math.max(1, Math.floor((containerRef.current?.clientWidth || window.innerWidth) / 220));
    const perPage = columns * rowsPerPageRef.current;
    const start = pageRef.current * perPage;
    for(let i=0;i<perPage;i++){
      next.push(generateCard(start + i + 1));
    }
    setCards(prev => [...prev, ...next]);
    pageRef.current += 1;
    if(pageRef.current >= 50) setHasMore(false);
    setLoading(false);
  }

  function handleScroll(e){
    const el = e.target;
    if(!el) return;
    if(el.scrollTop + el.clientHeight >= el.scrollHeight - 300){
      loadMoreCards();
    }
  }

  return (
    <>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="p-3 lg:p-6 pb-24 lg:pb-6"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px) + 5rem, 6rem)' }}
      >
        <div 
          className="grid gap-3 lg:gap-5 justify-center"
          style={{ 
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 260px))'
          }}
        >
          {cards.map(c => (
            <div key={c.id} className="w-full">
              <TarjetaUbicacionIndividual
                id={c.id}
                userId={1}
                nombre={c.nombre}
                categoria={c.categoria}
                descripcion={c.descripcion}
                imagen={c.imagen}
                calificacion={c.calificacion}
                vistas={c.vistas}
                onClick={() => onSelect ? onSelect(c) : console.log('Tarjeta clickeada', c.id)}
              />
            </div>
          ))}
        </div>
        {children}
        <div className="mt-6 flex justify-center items-center">
          {loading && <div className="text-sm text-gray-500">Cargando...</div>}
        </div>
      </div>
    </>
  );
}
