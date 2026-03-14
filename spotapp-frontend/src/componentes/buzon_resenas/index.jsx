import React, { useState, useRef, useCallback, useEffect } from 'react';
import Comentario from '../comentarios';
import { useUser } from '../../userProvider';
import Rating from '@mui/material/Rating';
import Tooltip from '@mui/material/Tooltip';
import { FiSend } from 'react-icons/fi';

// Local ID generator to avoid adding a dependency during prototyping
let __idCounter = 0;
function genId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        try { return crypto.randomUUID(); } catch (e) {}
    }
    __idCounter += 1;
    return `local-${Date.now().toString(36)}-${__idCounter}`;
}

function makeMockComment(i) {
    const id = genId();
    return {
        id,
        avatar: `/examples/ensenada${(i % 4) + 1}.svg`,
        nombre: `Usuario ${i + 1}`,
        texto: `Comentario de muestra número ${i + 1}. Esto es texto de prueba para el buzón infinito.`,
        rating: Math.round(((Math.random() * 1.5) + 4.0) * 10) / 10,
        likedBy: [],
        dislikedBy: [],
        mine: i % 7 === 0,
    };
}

export default function BuzonResenas({ placeId }){
    const { user } = useUser() || {};
    const currentUser = user?.id ? `u-${user.id}` : 'u-me';

    const [items, setItems] = useState(() => Array.from({ length: 6 }).map((_, i) => makeMockComment(i)));
    const [loading, setLoading] = useState(false);
    const [text, setText] = useState('');
    const [rating, setRating] = useState(null);
    const [visibleCount, setVisibleCount] = useState(5);
    const sentinel = useRef(null);

    const loadMore = useCallback(async () => {
        if (loading) return;
        setLoading(true);
        // simulate fetch
        await new Promise(r => setTimeout(r, 400));
        setItems(prev => [...prev, ...Array.from({ length: 6 }).map((_, i) => makeMockComment(prev.length + i))]);
        setLoading(false);
    }, [loading]);

    useEffect(() => {
        if (!sentinel.current) return;
        const ob = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) loadMore(); });
        }, { rootMargin: '200px' });
        ob.observe(sentinel.current);
        return () => ob.disconnect();
    }, [loadMore]);

    function handleSend() {
        const singleLine = (text || '').split('\n')[0].trim();
        if (!singleLine) return;
        if (rating === null || Number.isNaN(rating)) {
            alert('Debes asignar una calificación (estrellas) al enviar tu reseña.');
            return;
        }
        const comment = {
            id: genId(),
            avatar: '/fp_default.webp',
            nombre: 'Tú',
            texto: singleLine,
            rating: Number(rating),
            likedBy: [],
            dislikedBy: [],
            mine: true,
        };
        setItems(prev => [comment, ...prev]);
        setText('');
        setRating(null);
    }

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
        const found = items.find(c=>c.id===id);
        const newText = prompt('Editar tu comentario:', found?.texto || '');
        if (newText !== null) setItems(prev => prev.map(c => c.id === id ? { ...c, texto: (newText.split('\n')[0]||'').trim() } : c));
    }
    function handleDelete(id) {
        if (!confirm('¿Borrar este comentario?')) return;
        setItems(prev => prev.filter(c => c.id !== id));
    }

    return (
        <div className="w-full">
            <div className="mb-4">
                <div className="flex items-center gap-3 px-3 py-1 rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] dark:bg-[var(--bg-secondary)]">
                    <input
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder="Escribe tu reseña..."
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
                        <Tooltip title="Enviar reseña">
                            <button
                                onClick={handleSend}
                                disabled={!(rating >= 0.5)}
                                aria-label="Enviar reseña"
                                className={`${rating >= 0.5 ? 'hover:text-blue-500' : 'opacity-40 pointer-events-none'} p-2 rounded-md`}
                            >
                                <FiSend className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-[var(--text-tertiary)] transition-colors duration-200" />
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </div>

                    <div className="space-y-3">
                        {items.slice(0, visibleCount).map(c => (
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
                                onLike={handleLike}
                                onDislike={handleDislike}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
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