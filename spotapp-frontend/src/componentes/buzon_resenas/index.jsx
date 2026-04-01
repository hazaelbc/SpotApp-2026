import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import Comentario from '../comentarios';
import { useUser } from '../../userProvider';
import Rating from '@mui/material/Rating';
import Tooltip from '@mui/material/Tooltip';
import { FiSend } from 'react-icons/fi';

export default function BuzonResenas({ placeId, resenaId, onAverageRatingChange, focusComentarioId, focusAction }){
    const { user } = useUser() || {};
    const currentUser = user?.id ? `u-${user.id}` : 'u-me';

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [text, setText] = useState('');
    const [rating, setRating] = useState(null);
    const focusHandled = useRef(false);
    const [visibleCount, setVisibleCount] = useState(5);
    const sentinel = useRef(null);

    // Helper: build API URL depending on whether we have resenaId or placeId
    function buildFetchUrl() {
        if (resenaId) return `/api/comentarios-resena/resena/${resenaId}`;
        if (placeId) return `/api/comentarios-resena/place/${placeId}`;
        return null;
    }

    // Transform server comment shape to UI comment shape
    function transformServerComment(c) {
        return {
            id: c.id,
            avatar: (c.usuario && c.usuario.fotoPerfil) || '/fp_default.webp',
            nombre: (c.usuario && c.usuario.nombre) || 'Usuario',
            texto: c.comentario || '',
            rating: c.rating ?? null,
            likedBy: c.likedBy || [],
            dislikedBy: c.dislikedBy || [],
            mine: user && (Number(user.id) === Number(c.usuarioId)),
            fecha: c.fecha || c.createdAt || null,
        };
    }

    const loadMore = useCallback(async () => {
        // Backend returns all comments; keep loadMore as simple fetch-more guard
        if (loading) return;
        const url = buildFetchUrl();
        if (!url) return;
        setLoading(true);
        try {
            const res = await fetch(url, { headers: { Accept: 'application/json' } });
            if (res.ok) {
                const data = await res.json();
                // Transform server shape to UI shape
                const transformed = Array.isArray(data) ? data.map(transformServerComment) : [];
                // Ensure we don't duplicate: replace with unique by id
                setItems(prev => {
                    const map = new Map(prev.map(i => [i.id, i]));
                    transformed.forEach(d => map.set(d.id, d));
                    return Array.from(map.values()).sort((a,b) => new Date(b.fecha) - new Date(a.fecha));
                });
            }
        } catch (e) {
            console.warn('Error fetching comments', e);
        }
        setLoading(false);
    }, [loading, placeId, resenaId]);

    const averageRating = useMemo(() => {
        const ratings = items
            .map(c => Number(c?.rating))
            .filter(r => Number.isFinite(r) && r > 0);
        if (!ratings.length) return null;
        const sum = ratings.reduce((acc, value) => acc + value, 0);
        return sum / ratings.length;
    }, [items]);

    useEffect(() => {
        if (typeof onAverageRatingChange === 'function') {
            onAverageRatingChange(averageRating);
        }
    }, [averageRating, onAverageRatingChange]);

    useEffect(() => {
        // fetch initial comments on mount or when ids change
        loadMore();
        // sentinel can still trigger manual reloads if present
        if (!sentinel.current) return;
        const ob = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) loadMore(); });
        }, { rootMargin: '200px' });
        ob.observe(sentinel.current);
        return () => ob.disconnect();
    }, [loadMore]);

    // Cuando se viene del perfil con acción (editar/borrar), disparar una vez que los items carguen
    useEffect(() => {
        if (!focusComentarioId || focusHandled.current || items.length === 0) return;
        const target = items.find(c => c.id === focusComentarioId);
        if (!target) return;
        focusHandled.current = true;
        // Scroll al comentario
        setTimeout(() => {
            const el = document.getElementById(`comentario-${focusComentarioId}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 200);
        // Disparar acción
        if (focusAction === 'edit') handleEdit(focusComentarioId);
        else if (focusAction === 'delete') handleDelete(focusComentarioId);
    }, [items, focusComentarioId, focusAction]);

    // Note: actual send logic implemented later (uses backend).

    function handleLike(id) {
        setItems(prev => prev.map(c => {
            if (c.id !== id) return c;
            const liked = new Set(c.likedBy || []);
            const disliked = new Set(c.dislikedBy || []);
            if (liked.has(currentUser)) {
                // toggle off like
                liked.delete(currentUser);
            } else {
                // move from dislike to like if present
                if (disliked.has(currentUser)) disliked.delete(currentUser);
                liked.add(currentUser);
            }
            return { ...c, likedBy: Array.from(liked), dislikedBy: Array.from(disliked) };
        }));
    }
    function handleDislike(id) {
        setItems(prev => prev.map(c => {
            if (c.id !== id) return c;
            const liked = new Set(c.likedBy || []);
            const disliked = new Set(c.dislikedBy || []);
            if (disliked.has(currentUser)) {
                // toggle off dislike
                disliked.delete(currentUser);
            } else {
                // move from like to dislike if present
                if (liked.has(currentUser)) liked.delete(currentUser);
                disliked.add(currentUser);
            }
            return { ...c, likedBy: Array.from(liked), dislikedBy: Array.from(disliked) };
        }));
    }
    function handleEdit(id) {
        setItems(prev => prev.map(c => c.id === id ? { ...c, editing: true } : c));
    }
    async function handleEditSave(id, newText) {
        const trimmed = (newText.split('\n')[0] || '').trim();
        if (!trimmed) return;
        try {
            const res = await fetch(`/api/comentarios-resena/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comentario: trimmed }),
            });
            if (res.ok) {
                setItems(prev => prev.map(c => c.id === id ? { ...c, texto: trimmed, editing: false } : c));
            }
        } catch (e) {
            console.warn('Error editando comentario', e);
        }
    }
    function handleEditCancel(id) {
        setItems(prev => prev.map(c => c.id === id ? { ...c, editing: false } : c));
    }
    async function handleDelete(id) {
        if (!confirm('¿Borrar este comentario?')) return;
        try {
            const res = await fetch(`/api/comentarios-resena/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Error eliminando comentario');
            setItems(prev => prev.filter(c => c.id !== id));
        } catch (e) {
            console.warn(e);
            alert('No se pudo borrar el comentario. Intenta de nuevo.');
        }
    }
    async function handleSend() {
        const singleLine = (text || '').split('\n')[0].trim();
        if (!singleLine) return;
        if (rating === null || Number.isNaN(rating)) {
            alert('Debes asignar una calificación (estrellas) al enviar tu comentario.');
            return;
        }

        // Ensure we have a logged-in user and a resenaId to attach to
        if (!user || !user.id) {
            alert('Debes iniciar sesión para publicar un comentario.');
            return;
        }
        if (!resenaId) {
            alert('No es posible publicar un comentario aquí: falta el ID de la reseña.');
            return;
        }

        const payload = {
            usuarioId: Number(user.id),
            resenaId: Number(resenaId),
            comentario: singleLine,
            rating: Number(rating),
        };

        try {
            const res = await fetch('/api/comentarios-resena', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error('Error creando comentario');
            const created = await res.json();
            const transformed = {
                ...transformServerComment(created),
                rating: Number(rating),
            };
            setItems(prev => [transformed, ...prev]);
            setText('');
            setRating(null);
        } catch (e) {
            console.warn(e);
            alert('No se pudo enviar el comentario. Intenta de nuevo.');
        }
    }

    return (
        <div className="w-full">
            <div className="mb-4">
                <div className="flex items-center gap-3 px-3 py-1 rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] dark:bg-[var(--bg-secondary)]">
                    <input
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder="Escribe tu comentario..."
                        className="flex-1 bg-transparent text-[var(--text-primary)] placeholder:text-gray-400 dark:placeholder:text-[var(--text-tertiary)] outline-none focus:outline-none px-2 rounded-none"
                        maxLength={220}
                    />

                    <div className="flex-shrink-0 flex items-center h-8">
                        <Rating
                            name="buzon-rating"
                            precision={0.5}
                            
                            
                            
                            
                            
                            value={rating ?? 0}
                            onChange={(e, v) => setRating(v)}
                            max={4}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                '& .MuiRating-icon': { transition: 'transform 140ms ease, color 140ms ease', fontSize: 20, color: 'rgba(255,193,7,0.95)' },
                                '& .MuiRating-iconEmpty': { color: 'var(--text-tertiary)', opacity: 0.9, fontSize: 20 },
                                '&:hover .MuiRating-icon': { transform: 'scale(1.06)' },
                                '& .MuiRating-iconHover': { transform: 'scale(1.08)' }
                            }}
                            size="medium"
                            icon={<span style={{ fontSize: 20 }}>★</span>}
                            emptyIcon={<span style={{ fontSize: 20 }}>☆</span>}
                        />
                    </div>

                    <div className="flex-shrink-0">
                        <Tooltip title="Enviar comentario">
                            <span className="inline-block">
                                <button
                                    onClick={handleSend}
                                    disabled={!(rating >= 0.5)}
                                    aria-label="Enviar comentario"
                                    className={`${rating >= 0.5 ? 'hover:text-blue-500' : 'opacity-40 pointer-events-none'} p-2 rounded-md`}
                                >
                                    <FiSend className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-[var(--text-tertiary)] transition-colors duration-200" />
                                </button>
                            </span>
                        </Tooltip>
                    </div>
                </div>
            </div>

                    <div className="space-y-3">
                        {items.slice(0, visibleCount).map(c => (
                            <div key={c.id} id={`comentario-${c.id}`}>
                                <Comentario
                                    key={c.id}
                                    id={c.id}
                                    avatar={c.avatar}
                                    nombre={c.nombre}
                                    texto={c.texto}
                                    rating={c.rating}
                                    likes={(c.likedBy||[]).length}
                                    dislikes={(c.dislikedBy||[]).length}
                                    liked={(c.likedBy||[]).includes(currentUser)}
                                    disliked={(c.dislikedBy||[]).includes(currentUser)}
                                    mine={c.mine}
                                    editing={c.editing || false}
                                    onLike={handleLike}
                                    onDislike={handleDislike}
                                    onEdit={handleEdit}
                                    onEditSave={handleEditSave}
                                    onEditCancel={handleEditCancel}
                                    onDelete={handleDelete}
                                />
                            </div>
                        ))}

                        <div className="flex justify-center mt-2">
                            {items.length > visibleCount ? (
                                <button onClick={() => setVisibleCount(vc => vc + 5)} className="text-sm text-gray-500 dark:text-[var(--text-tertiary)] hover:underline">Mostrar más</button>
                            ) : (
                                <button
                                    onClick={async () => {
                                        // load more items then show next block
                                        if (!loading) {
                                          await loadMore();
                                          setVisibleCount(vc => vc + 5);
                                        }
                                    }}
                                    className="text-sm text-gray-500 dark:text-[var(--text-tertiary)] hover:underline"
                                >
                                    Mostrar más
                                </button>
                            )}
                        </div>
                    </div>

            <div ref={sentinel} className="h-8 flex items-center justify-center">
                {/* loading sentinel - intentionally empty (no text indicator) */}
            </div>
        </div>
    );
}