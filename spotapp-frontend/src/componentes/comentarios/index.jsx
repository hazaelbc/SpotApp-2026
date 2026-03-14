import React from 'react';
import { FiThumbsUp, FiThumbsDown } from 'react-icons/fi';

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
  onLike,
  onDislike,
  onEdit,
  onDelete,
}) {
  return (
    <div className="flex gap-3 p-3 bg-[var(--bg-primary)] dark:bg-[var(--bg-secondary)] rounded-lg shadow-sm">
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
            {mine && (
              <>
                <button onClick={() => onEdit && onEdit(id)} className="text-xs text-[var(--text-secondary)] hover:underline">Editar</button>
                <button onClick={() => onDelete && onDelete(id)} className="text-xs text-red-500 hover:underline">Borrar</button>
              </>
            )}
          </div>
        </div>

        <div className="mt-2 text-sm text-[var(--text-primary)]">{texto}</div>

        <div className="mt-3 flex items-center gap-3">
          <button onClick={() => onLike && onLike(id)} className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent-green)]">
            <FiThumbsUp /> <span className="text-xs">{likes}</span>
          </button>
          <button onClick={() => onDislike && onDislike(id)} className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-red-500">
            <FiThumbsDown /> <span className="text-xs">{dislikes}</span>
          </button>
        </div>
      </div>
    </div>
  );
}