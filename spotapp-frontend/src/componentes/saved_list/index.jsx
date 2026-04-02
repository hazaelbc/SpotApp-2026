import React, { useEffect, useState } from 'react';
import TarjetaUbicacionIndividual from '../tarjetas_ubicacion';
import { getFavorites, getSaved } from '../../utils/bookmarks';
import { useUser } from '../../userProvider';

export default function SavedList({ mode = 'favorites', onSelect }){
  const { user } = useUser() || {};
  const [items, setItems] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!user?.id) {
        if (!cancelled) setItems([]);
        return;
      }
      try{
        const list = mode === 'saved'
          ? await getSaved(user.id)
          : await getFavorites(user.id);
        if (!cancelled) setItems(list || []);
      }catch(e){
        if (!cancelled) setItems([]);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [mode, user?.id]);

  return (
    <div className="p-3 lg:p-6">
      <h2 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">
        {mode === 'saved' ? 'Guardados' : 'Favoritos'}
      </h2>
      {items.length === 0 ? (
        <div className="text-sm text-[var(--text-tertiary)]">No hay elementos en esta lista.</div>
      ) : (
        <div className="grid gap-3 lg:gap-5 justify-center" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 260px))' }}>
          {items.map(it => (
            <div key={it.id} className="w-full" onClick={() => onSelect && onSelect(it)}>
              <TarjetaUbicacionIndividual
                id={it.id}
                userId={1}
                nombre={it.nombre}
                categoria={it.categoria}
                descripcion={it.descripcion}
                imagen={it.imagen}
                calificacion={it.calificacion}
                vistas={it.vistas}
                onClick={() => onSelect && onSelect(it)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
