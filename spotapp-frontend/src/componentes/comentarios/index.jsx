import React, { useState, useRef, useEffect } from 'react';
import { FiThumbsUp, FiThumbsDown, FiArrowRight } from 'react-icons/fi';

const PASTEL_COLORS = [
  '#FDE68A', // Yellow (Default)
  '#BFDBFE', // Blue
  '#BBF7D0', // Green
  '#FECACA', // Red
  '#E9D5FF', // Purple
  '#FED7AA', // Orange
];

// Simple comment item used by BuzonResenas
export default function Comentario({
  id,
  avatar,
  nombre,
  texto,
  rating,
  likes = 0,
  dislikes = 0,
  mine = false,
  editing = false,
  onLike,
  onDislike,
  onEdit,
  onEditSave,
  onEditCancel,
  onDelete,
  onNavigate,
}) {
  const [stripColor, setStripColor] = useState(PASTEL_COLORS[0]);
  const [showPalette, setShowPalette] = useState(false);
  const [editText, setEditText] = useState(texto);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (editing) {
      setEditText(texto);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [editing]);

  return (
    <div className="relative flex bg-[var(--bg-primary)] dark:bg-[var(--bg-secondary)] rounded-lg shadow-sm group">
      {/* Strip de color para comentarios propios */}
      {mine && (
        <div 
          className="w-2.5 rounded-l-lg cursor-pointer hover:brightness-95 transition-all flex-shrink-0"
          style={{ backgroundColor: stripColor }}
          onClick={(e) => {
            e.stopPropagation();
            setShowPalette(!showPalette);
          }}
          title="Cambiar color de etiqueta"
        />
      )}

      {/* Selector de color (hexagonal styled palette) */}
      {showPalette && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowPalette(false)} />
          <div 
            className="absolute left-3 top-2 z-50 bg-white dark:bg-[#1e1e1e] p-2 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in duration-200"
            style={{ width: 'fit-content' }}
          >
            {/* Hexagonal Arrangement */}
            <div className="flex flex-col items-center -space-y-1">
               {/* Row 1 */}
               <div className="flex gap-0.5">
                 {PASTEL_COLORS.slice(0, 2).map(c => (
                   <button
                    key={c}
                    onClick={(e) => { e.stopPropagation(); setStripColor(c); setShowPalette(false); }}
                    className="w-6 h-6 hover:scale-110 transition-transform focus:outline-none shadow-sm"
                    style={{ backgroundColor: c, clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                   />
                 ))}
               </div>
               
               {/* Row 2 (Middle) */}
               <div className="flex gap-5"> 
                 {[PASTEL_COLORS[5], PASTEL_COLORS[2]].map(c => (
                   <button
                    key={c}
                    onClick={(e) => { e.stopPropagation(); setStripColor(c); setShowPalette(false); }}
                    className="w-6 h-6 hover:scale-110 transition-transform focus:outline-none shadow-sm"
                    style={{ backgroundColor: c, clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                   />
                 ))}
               </div>

               {/* Row 3 */}
                <div className="flex gap-0.5">
                 {PASTEL_COLORS.slice(3, 5).reverse().map(c => (
                   <button
                    key={c}
                    onClick={(e) => { e.stopPropagation(); setStripColor(c); setShowPalette(false); }}
                    className="w-6 h-6 hover:scale-110 transition-transform focus:outline-none shadow-sm"
                    style={{ backgroundColor: c, clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                   />
                 ))}
               </div>
            </div>
          </div>
        </>
      )}

      {/* Contenido principal */}
      <div className={`flex-1 flex gap-3 p-3 ${mine ? 'pl-2' : ''}`}>
        <img src={avatar} alt={nombre} className="w-12 h-12 rounded-md object-cover flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium text-[var(--text-primary)]">{nombre}</div>
              {typeof rating === 'number' && (
                <div className="text-xs text-[var(--text-secondary)] bg-[var(--bg-tertiary)] px-2 py-0.5 rounded">{rating.toFixed(1)} ★</div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {onNavigate && (
                <button 
                  onClick={() => onNavigate(id)} 
                  className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--accent-blue)] hover:bg-[var(--bg-tertiary)] rounded-full transition-colors"
                  title="Ir al lugar"
                >
                  <FiArrowRight className="w-4 h-4" />
                </button>
              )}
              {mine && (
                <>
                  <button onClick={() => onEdit && onEdit(id)} className="text-xs text-[var(--text-secondary)] hover:underline">Editar</button>
                  <button onClick={() => onDelete && onDelete(id)} className="text-xs text-red-500 hover:underline">Borrar</button>
                </>
              )}
            </div>
          </div>

          {editing ? (
            <div className="mt-2 flex flex-col gap-2">
              <textarea
                ref={textareaRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={2}
                className="w-full text-sm bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-[var(--text-primary)] resize-none focus:outline-none focus:border-[var(--text-tertiary)]"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => onEditCancel && onEditCancel(id)}
                  className="px-3 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => onEditSave && onEditSave(id, editText)}
                  className="px-3 py-1.5 rounded-lg text-xs bg-[var(--text-primary)] text-[var(--bg-primary)] font-medium hover:opacity-80 transition-opacity"
                >
                  Guardar
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-2 text-sm text-[var(--text-primary)]">{texto}</div>
          )}

          {!editing && (
            <div className="mt-3 flex items-center gap-3">
              <button onClick={() => onLike && onLike(id)} className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent-green)]">
                <FiThumbsUp /> <span className="text-xs">{likes}</span>
              </button>
              <button onClick={() => onDislike && onDislike(id)} className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-red-500">
                <FiThumbsDown /> <span className="text-xs">{dislikes}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}