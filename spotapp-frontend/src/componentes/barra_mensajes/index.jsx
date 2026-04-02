import React, { useState, useRef, useEffect, useCallback } from "react";
import { FiMail, FiChevronRight, FiChevronLeft, FiSend, FiUsers } from "react-icons/fi";
import FotoPerfil from "../foto-perfil";
import { useUser } from "../../userProvider";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function PlaceCard({ place, fromMe }) {
    const [imagen, setImagen] = useState(place.imagen || null);
    useEffect(() => {
        if (imagen || !place.id) return;
        fetch(`${API_URL}/places/${place.id}`)
            .then(r => r.ok ? r.json() : null)
            .then(p => {
                if (!p) return;
                const url = p.imagen || (Array.isArray(p.fotos) && p.fotos[0]) || null;
                if (url) setImagen(url);
            })
            .catch(() => {});
    }, [place.id]);

    return (
        <div className={`flex ${fromMe ? 'justify-end' : 'justify-start'} w-full`}>
            <button
                onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-place', { detail: place }))}
                className="text-left rounded-xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-secondary)] transition-opacity hover:opacity-80 active:opacity-60"
                style={{ width: '72%' }}
            >
                <div className="w-full h-32 bg-[var(--bg-tertiary)] overflow-hidden">
                    {imagen
                        ? <img src={imagen.startsWith('/uploads/') ? `${API_URL}${imagen}` : imagen} alt={place.nombre} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        : <div className="w-full h-full animate-pulse bg-[var(--bg-tertiary)]" />
                    }
                </div>
                <div className="px-2.5 py-2">
                    <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{place.nombre}</p>
                    {place.categoria && <p className="text-[10px] text-[var(--text-tertiary)] truncate">{place.categoria}</p>}
                    <p className="text-[10px] text-[var(--text-secondary)] mt-1">Ver reseña →</p>
                </div>
            </button>
        </div>
    );
}

// Extraído fuera de BarraMensajes para que React no lo trate como tipo nuevo en cada render
function SendBar({ value, onChange, onSend, inputRef }) {
    return (
        <div className="p-2 border-t border-gray-300 dark:border-[var(--border-color)] relative z-[100] bg-transparent shrink-0">
            <div className="relative flex items-center">
                <input
                    ref={inputRef}
                    value={value}
                    onChange={onChange}
                    onKeyDown={(e) => { if (e.key === 'Enter') onSend(); }}
                    className="w-full px-3 py-1.5 pl-4 pr-10 sm:px-4 sm:py-1.5 sm:pl-4 sm:pr-10 text-sm sm:text-base bg-white dark:bg-[var(--bg-secondary)] text-gray-700 dark:text-[var(--text-primary)] border border-gray-300 dark:border-[var(--border-color)] rounded-lg placeholder:text-gray-400 dark:placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-[#3D5A6F] focus:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shadow-sm transition duration-100 ease-in"
                    placeholder="Escribe un mensaje..."
                    autoFocus
                />
                <button
                    onClick={onSend}
                    className="absolute right-2 sm:right-2 top-1/2 -translate-y-1/2 p-2 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-200"
                    aria-label="Enviar mensaje"
                >
                    <FiSend className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-[var(--text-tertiary)] transition-colors duration-200" style={{ strokeWidth: 1 }} />
                </button>
            </div>
        </div>
    );
}

// Extraído fuera de BarraMensajes — evita el remount en cada re-render del padre
function ChatPanel({ amigo, onBack, setUnreadCounts }) {
    const { user } = useUser();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [convId, setConvId] = useState(null);
    const [loadingConv, setLoadingConv] = useState(true);
    const scrollRef = useRef();
    const inputRef = useRef();
    const lastIdRef = useRef(0);
    const convIdRef = useRef(null);

    const scrollToBottom = useCallback(() => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, []);

    // Obtener o crear conversación y cargar mensajes iniciales
    useEffect(() => {
        if (!amigo || !user?.id) return;
        let mounted = true;
        setLoadingConv(true);
        setMessages([]);
        lastIdRef.current = 0;

        fetch(`${API_URL}/chat/conversation/${user.id}/${amigo.id}`)
            .then((r) => r.ok ? r.json() : null)
            .then(async (conv) => {
                if (!mounted || !conv) return;
                setConvId(conv.id);
                convIdRef.current = conv.id;
                const res = await fetch(`${API_URL}/chat/messages/${conv.id}`);
                if (!res.ok || !mounted) return;
                const msgs = await res.json();
                if (!mounted) return;
                setMessages(Array.isArray(msgs) ? msgs : []);
                if (msgs.length) lastIdRef.current = msgs.at(-1).id;
                setLoadingConv(false);
                setTimeout(scrollToBottom, 80);
                // Marcar como leído al abrir
                fetch(`${API_URL}/chat/conversation/${conv.id}/read`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id }),
                }).then(() => {
                    setUnreadCounts((prev) => { const next = { ...prev }; delete next[amigo.id]; return next; });
                }).catch(() => {});
            })
            .catch(() => { if (mounted) setLoadingConv(false); });

        return () => { mounted = false; };
    }, [amigo?.id, user?.id]);

    // Polling de nuevos mensajes cada 4 segundos
    useEffect(() => {
        if (!convId) return;
        const poll = async () => {
            try {
                const res = await fetch(`${API_URL}/chat/messages/${convId}?since=${lastIdRef.current}`);
                if (!res.ok) return;
                const newMsgs = await res.json();
                if (!Array.isArray(newMsgs) || newMsgs.length === 0) return;
                setMessages((prev) => [...prev, ...newMsgs]);
                lastIdRef.current = newMsgs.at(-1).id;
                setTimeout(scrollToBottom, 60);
                // Si hay mensajes entrantes, marcar como leído
                const hasIncoming = newMsgs.some((m) => m.usuarioId !== user?.id);
                if (hasIncoming && convIdRef.current) {
                    fetch(`${API_URL}/chat/conversation/${convIdRef.current}/read`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: user.id }),
                    }).then(() => {
                        setUnreadCounts((prev) => { const next = { ...prev }; delete next[amigo.id]; return next; });
                    }).catch(() => {});
                }
            } catch (e) {}
        };
        const interval = setInterval(poll, 4000);
        const onRefresh = (e) => { if (e.detail?.conversationId === convId) poll(); };
        window.addEventListener('chat-refresh', onRefresh);
        return () => { clearInterval(interval); window.removeEventListener('chat-refresh', onRefresh); };
    }, [convId]);

    const send = async () => {
        if (!input.trim() || !convId || !user?.id) return;
        const text = input.trim();
        setInput('');
        try {
            const res = await fetch(`${API_URL}/chat/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationId: convId, usuarioId: user.id, content: text }),
            });
            if (!res.ok) return;
            const msg = await res.json();
            setMessages((prev) => [...prev, msg]);
            lastIdRef.current = msg.id;
            setTimeout(scrollToBottom, 60);
        } catch (e) {}
        inputRef.current?.focus();
    };

    return (
        <div className="flex flex-col w-full h-full min-h-0 overflow-hidden border-t border-gray-300 dark:border-[var(--border-color)]">
            {/* Header */}
            <div className="px-3 py-2 border-b border-gray-300 dark:border-[var(--border-color)] flex items-center gap-3 shrink-0 bg-transparent">
                <button onClick={onBack} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)]">
                    <FiChevronLeft className="w-4 h-4 text-gray-600 dark:text-[var(--text-secondary)]" style={{ strokeWidth: 1 }} />
                </button>
                {amigo?.fotoPerfil && amigo.fotoPerfil !== 'https://via.placeholder.com/150' ? (
                    <img src={amigo.fotoPerfil} alt={amigo.nombre} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                ) : (
                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center justify-center flex-shrink-0">
                        <FiUsers className="w-4 h-4 text-[var(--text-tertiary)]" style={{ strokeWidth: 1 }} />
                    </div>
                )}
                <span className="font-medium text-sm text-[var(--text-primary)] truncate">{amigo?.nombre}</span>
            </div>

            {/* Mensajes */}
            <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-3 py-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="flex flex-col justify-end min-h-full gap-1.5">
                {loadingConv ? (
                    <div className="m-auto text-xs text-[var(--text-tertiary)]">Cargando...</div>
                ) : messages.length === 0 ? (
                    <div className="m-auto text-xs text-[var(--text-tertiary)] text-center">
                        Aún no hay mensajes.<br/>¡Di algo!
                    </div>
                ) : (
                    messages.map((m) => {
                        const fromMe = m.usuarioId === user?.id;
                        const content = m.content || '';

                        let place = null;
                        if (content.startsWith('📍PLACE:')) {
                            try { place = JSON.parse(content.slice('📍PLACE:'.length)); } catch {}
                        }
                        if (!place && content.startsWith('📍')) {
                            const withoutPin = content.replace(/^📍\s*/, '');
                            const [nombre] = withoutPin.split(' — ');
                            if (nombre) place = { nombre };
                        }

                        if (place) return <PlaceCard key={m.id} place={place} fromMe={fromMe} />;

                        return (
                            <div key={m.id} className={`flex ${fromMe ? 'justify-end' : 'justify-start'} w-full`}>
                                <div className={`px-3 py-2 rounded-xl text-sm max-w-[80%] break-words ${fromMe
                                    ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                                    : 'bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)]'
                                }`}>
                                    {content}
                                </div>
                            </div>
                        );
                    })
                )}
                </div>
            </div>

            {/* Input */}
            <SendBar value={input} onChange={(e) => setInput(e.target.value)} onSend={send} inputRef={inputRef} />
        </div>
    );
}

export const BarraMensajes = ({ children, className = "" }) => {
    const { user } = useUser();
    const [isOpen, setIsOpen] = useState(true);
    const [amigos, setAmigos] = useState([]);
    const [loadingAmigos, setLoadingAmigos] = useState(true);
    const [conversations, setConversations] = useState({});
    const [activeConversation, setActiveConversation] = useState(null);
    const [selectedContactId, setSelectedContactId] = useState(null);
    const [unreadCounts, setUnreadCounts] = useState({});

    useEffect(() => {
        if (!user?.id) return;
        let mounted = true;
        fetch(`${API_URL}/amistad/amigos/${user.id}`)
            .then((r) => r.ok ? r.json() : [])
            .then((data) => {
                if (!mounted) return;
                const list = (Array.isArray(data) ? data : []).sort((a, b) => a.nombre.localeCompare(b.nombre));
                setAmigos(list);
                setLoadingAmigos(false);
            })
            .catch(() => { if (mounted) setLoadingAmigos(false); });
        return () => { mounted = false; };
    }, [user?.id]);

    // Polling de mensajes no leídos cada 6 segundos
    useEffect(() => {
        if (!user?.id) return;
        const fetchUnread = () => {
            fetch(`${API_URL}/chat/unread/${user.id}`)
                .then((r) => r.ok ? r.json() : {})
                .then((data) => setUnreadCounts(data))
                .catch(() => {});
        };
        fetchUnread();
        const interval = setInterval(fetchUnread, 6000);
        return () => clearInterval(interval);
    }, [user?.id]);

    const [externalModalOpen, setExternalModalOpen] = useState(false);
    const contactsRef = useRef();
    const itemRefs = useRef([]);
    const letters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

    const handleScroll = () => {
        if (!contactsRef.current) return;
        const container = contactsRef.current;
        const containerTop = container.scrollTop;
        const containerHeight = container.clientHeight;

        itemRefs.current.forEach((el) => {
            if (!el) return;
            const itemCenter = el.offsetTop + el.clientHeight / 2;
            const relativeY = itemCenter - containerTop;
            const percent = relativeY / containerHeight;

            let scale = 1;
            let rotateX = 0;

            if (percent < 0.05) {
                const factor = Math.min(Math.max((0.05 - percent) / 0.05, 0), 2);
                scale = 0.95 - (factor * 0.4);
                rotateX = 10 + (factor * 60);
            } else if (percent > 0.95) {
                const factor = Math.min(Math.max((percent - 0.95) / 0.05, 0), 2);
                scale = 0.95 - (factor * 0.4);
                rotateX = -10 - (factor * 60);
            } else {
                const distFromCenter = percent - 0.5;
                scale = 1 - (Math.abs(distFromCenter) / 0.45) * 0.05;
                rotateX = (distFromCenter / 0.45) * -10;
            }

            el.style.transform = `perspective(600px) rotateX(${rotateX}deg) scale(${scale})`;
            el.style.transformOrigin = 'center center';
            el.style.zIndex = Math.round(100 - Math.abs(percent - 0.5) * 100);
        });
    };

    useEffect(() => {
        if (!activeConversation) {
            setTimeout(handleScroll, 50);
        }
        window.addEventListener('resize', handleScroll);
        return () => window.removeEventListener('resize', handleScroll);
    }, [activeConversation, isOpen]);

    useEffect(() => {
        function onGalleryEvent(e) {
            try {
                setExternalModalOpen(Boolean(e?.detail?.open));
            } catch (err) { setExternalModalOpen(false); }
        }
        window.addEventListener('gallery-lightbox', onGalleryEvent);
        return () => window.removeEventListener('gallery-lightbox', onGalleryEvent);
    }, []);

    const scrollToLetter = (letter) => {
        const container = contactsRef.current;
        if (!container) return;
        const target = container.querySelector(`[data-letter="${letter}"]`);
        if (!target) return;
        const targetRect = target.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const offset = targetRect.top - containerRect.top + container.scrollTop;
        container.scrollTo({ top: offset, behavior: 'smooth' });
    };

    return(
        <aside className={`${isOpen ? 'w-80' : 'w-20'} h-full flex transition-all duration-300 overflow-x-hidden ${className}`}>
            {/* Línea divisoria con márgenes superior e inferior */}
            <div className="py-4">
                <div className="h-full border-l border-gray-300 dark:border-[var(--border-color)]"></div>
            </div>

            <div className="flex-1 flex flex-col p-4 relative">
                {/* Título con ícono de correo y botón de colapsar */}
                <div className="mb-4 flex items-center justify-between">
                    {isOpen ? (
                        <>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)] flex items-center gap-2">
                                <FiMail className="w-4 h-4 sm:w-5 sm:h-5" style={{ strokeWidth: 1 }} />
                                Mensajes
                            </h2>
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    setActiveConversation(null);
                                }}
                                className="p-1.5 hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors duration-200"
                                aria-label="Cerrar barra de mensajes"
                            >
                                <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-[var(--text-secondary)]" style={{ strokeWidth: 1 }} />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => {
                                setIsOpen(true);
                                setActiveConversation(null);
                            }}
                            className="w-full p-1.5 hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors duration-200"
                            aria-label="Abrir barra de mensajes"
                        >
                            <FiChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-[var(--text-secondary)] mx-auto" style={{ strokeWidth: 1 }} />
                        </button>
                    )}
                </div>

                {/* Lista de contactos */}
                {(!activeConversation || !isOpen) && (
                    <div className="flex-1 flex relative overflow-hidden">
                        <div
                            ref={contactsRef}
                            onScroll={handleScroll}
                            className="flex-1 overflow-y-auto pr-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative"
                            style={{ scrollBehavior: 'smooth' }}
                        >
                            <div className="space-y-2">
                            {loadingAmigos ? (
                                [1,2,3].map((i) => (
                                    <div key={i} className={`flex items-center gap-3 p-3 ${!isOpen ? 'justify-center' : ''}`}>
                                        <div className="w-10 h-10 rounded-lg bg-[var(--bg-tertiary)] animate-pulse flex-shrink-0" />
                                        {isOpen && <div className="flex-1 h-4 rounded bg-[var(--bg-tertiary)] animate-pulse" />}
                                    </div>
                                ))
                            ) : amigos.length === 0 ? (
                                isOpen && (
                                    <div className="flex flex-col items-center gap-2 py-8 text-center px-2">
                                        <FiUsers className="w-8 h-8 text-[var(--text-tertiary)]" style={{ strokeWidth: 1 }} />
                                        <p className="text-xs text-[var(--text-tertiary)]">Aún no tienes amigos.<br/>Agrégalos desde la sección Amigos.</p>
                                    </div>
                                )
                            ) : amigos.map((amigo, index) => (
                                <button
                                    key={amigo.id}
                                    ref={el => itemRefs.current[index] = el}
                                    data-letter={amigo.nombre ? amigo.nombre.trim().charAt(0).toUpperCase() : ''}
                                    onClick={() => setSelectedContactId(amigo.id)}
                                    onDoubleClick={() => {
                                        setActiveConversation(amigo);
                                        setIsOpen(true);
                                    }}
                                    className={`w-full flex items-center gap-3 hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors duration-200 text-left ${!isOpen ? 'justify-center p-2' : 'p-3'} ${selectedContactId === amigo.id ? 'bg-gray-100 dark:bg-[var(--bg-tertiary)]' : ''}`}
                                >
                                    <div className="relative flex-shrink-0 mx-auto">
                                        {isOpen ? (
                                            amigo.fotoPerfil && amigo.fotoPerfil !== 'https://via.placeholder.com/150' ? (
                                                <img src={amigo.fotoPerfil} alt={amigo.nombre} className="w-10 h-10 rounded-lg object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center justify-center">
                                                    <FiUsers className="w-4 h-4 text-[var(--text-tertiary)]" style={{ strokeWidth: 1 }} />
                                                </div>
                                            )
                                        ) : (
                                            amigo.fotoPerfil && amigo.fotoPerfil !== 'https://via.placeholder.com/150' ? (
                                                <img src={amigo.fotoPerfil} alt={amigo.nombre} className="w-8 h-8 rounded-lg object-cover object-top" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center justify-center">
                                                    <FiUsers className="w-4 h-4 text-[var(--text-tertiary)]" style={{ strokeWidth: 1 }} />
                                                </div>
                                            )
                                        )}
                                        {unreadCounts[amigo.id] > 0 && (
                                            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none shadow-sm pointer-events-none">
                                                {unreadCounts[amigo.id] > 99 ? '99+' : unreadCounts[amigo.id]}
                                            </span>
                                        )}
                                    </div>

                                    {isOpen && (
                                        <div className="flex-1 min-w-0">
                                            <span className="text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] truncate block">
                                                {amigo.nombre}
                                            </span>
                                            {conversations[amigo.id]?.length > 0 && (
                                                <p className="text-xs text-gray-500 dark:text-[var(--text-tertiary)] truncate">
                                                    {conversations[amigo.id].at(-1).text}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </button>
                            ))}
                            </div>
                        </div>

                        {/* Índice A-Z */}
                        {isOpen && !externalModalOpen && (
                            <div className="absolute inset-y-0 right-0 w-8 bg-transparent rounded z-50 pointer-events-auto flex flex-col justify-center">
                                <div className="flex flex-col items-center justify-between h-full max-h-[800px] text-[10px] select-none py-1">
                                    {letters.map((L) => (
                                        <button key={L} onClick={() => { scrollToLetter(L); setSelectedContactId(null); }} className="w-full flex-1 flex flex-col items-center justify-center text-gray-400 hover:text-blue-500 hover:font-bold transition-all">
                                            {L}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeConversation && isOpen && (
                    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                        <ChatPanel
                            amigo={activeConversation}
                            onBack={() => setActiveConversation(null)}
                            setUnreadCounts={setUnreadCounts}
                        />
                    </div>
                )}
            </div>
        </aside>
    );
};

export default BarraMensajes;
