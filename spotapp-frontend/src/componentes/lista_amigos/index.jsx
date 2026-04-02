import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { FiUserPlus, FiUserCheck, FiUsers, FiClock, FiUserX } from "react-icons/fi";
import { useUser } from "../../userProvider";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Haversine distance in km
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Sort by distance bands to avoid exposing exact proximity
// Bands: <15km | 15-50km | 50-200km | >200km | sin ubicación
// Within each band: shuffle
function sortByProximityBands(users, myLat, myLng) {
  const BANDS = [15, 50, 200, Infinity];

  const withDist = users.map((u) => {
    const dist =
      u.lat != null && u.lng != null && myLat != null && myLng != null
        ? haversine(myLat, myLng, u.lat, u.lng)
        : null;
    return { ...u, _dist: dist };
  });

  const groups = [...BANDS.map(() => []), [[]]].flat(0); // placeholder
  const banded = BANDS.map(() => []);
  const noLocation = [];

  for (const u of withDist) {
    if (u._dist === null) {
      noLocation.push(u);
    } else {
      const idx = BANDS.findIndex((b) => u._dist < b);
      banded[idx].push(u);
    }
  }

  // Shuffle within each band (Fisher-Yates)
  const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  return [...banded.flatMap(shuffle), ...shuffle(noLocation)];
}

function SectionLabel({ children }) {
  return (
    <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-widest px-1">
      {children}
    </p>
  );
}

function EmptyState({ text }) {
  return (
    <p className="text-[13px] text-[var(--text-tertiary)] px-1">{text}</p>
  );
}

function UserCard({ person, status, onSend, onCancel, onUnfriend, onViewProfile }) {
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const handle = async (action) => {
    setLoading(true);
    try { await action(); } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl">
      {/* Avatar + Info — clickeable para ver perfil */}
      <button
        onClick={() => onViewProfile && onViewProfile(person)}
        className="flex items-center gap-3 flex-1 min-w-0 text-left"
      >
        <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
          {person.fotoPerfil && person.fotoPerfil !== 'https://via.placeholder.com/150' ? (
            <img src={person.fotoPerfil} alt={person.nombre} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--text-tertiary)]">
              <FiUsers className="w-5 h-5" style={{ strokeWidth: 1 }} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)] truncate">{person.nombre}</p>
          {person.email && (
            <p className="text-[11px] text-[var(--text-tertiary)] truncate">{person.email}</p>
          )}
        </div>
      </button>

      <div className="flex items-center gap-2 flex-shrink-0">
        {status === 'none' && (
          <button
            disabled={loading}
            onClick={() => handle(onSend)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] text-xs font-medium hover:text-[var(--text-primary)] hover:border-[var(--text-tertiary)] transition-colors disabled:opacity-50"
          >
            <FiUserPlus className="w-3.5 h-3.5" style={{ strokeWidth: 1.5 }} />
            Enviar solicitud
          </button>
        )}
        {status === 'pending' && (
          <button
            disabled={loading}
            onClick={() => handle(onCancel)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-secondary)] text-xs font-medium hover:text-[var(--text-primary)] hover:border-[var(--text-tertiary)] transition-colors disabled:opacity-50"
          >
            <FiClock className="w-3.5 h-3.5" style={{ strokeWidth: 1.5 }} />
            Pendiente · Cancelar
          </button>
        )}
        {status === 'friend' && (
          <div className="relative" ref={menuRef}>
            <button
              disabled={loading}
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-tertiary)] text-xs font-medium hover:text-[var(--text-primary)] hover:border-[var(--text-tertiary)] transition-colors disabled:opacity-50"
            >
              <FiUserCheck className="w-3.5 h-3.5" style={{ strokeWidth: 1.5 }} />
              Amigos
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-lg z-50 overflow-hidden">
                <button
                  disabled={loading}
                  onClick={() => { setMenuOpen(false); handle(onUnfriend); }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
                >
                  <FiUserX className="w-3.5 h-3.5 flex-shrink-0" style={{ strokeWidth: 1.5 }} />
                  Eliminar de amigos
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ListaAmigos({ query = "", onViewProfile }) {
  const { user } = useUser();
  const [users, setUsers] = useState([]);
  const [estados, setEstados] = useState({});
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [usersRes, estadosRes] = await Promise.all([
        fetch(`${API_URL}/users/basic`),
        fetch(`${API_URL}/amistad/enviadas/${user.id}`),
      ]);
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(Array.isArray(data) ? data : []);
      }
      if (estadosRes.ok) {
        const data = await estadosRes.json();
        const map = {};
        for (const s of data) {
          if (s.estado === 'PENDIENTE') map[s.toId] = 'pending';
          else if (s.estado === 'ACEPTADA') map[s.toId] = 'friend';
          else map[s.toId] = 'none';
        }
        setEstados(map);
      }
    } catch (e) {
      console.error('[ListaAmigos]', e);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  useEffect(() => {
    const onFocus = () => loadUsers();
    const onAmistadChanged = () => loadUsers();
    window.addEventListener('focus', onFocus);
    window.addEventListener('amistad-changed', onAmistadChanged);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('amistad-changed', onAmistadChanged);
    };
  }, [loadUsers]);

  const sendRequest = async (toId) => {
    const res = await fetch(`${API_URL}/amistad/solicitud`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromId: user.id, toId }),
    });
    if (res.ok) setEstados((prev) => ({ ...prev, [toId]: 'pending' }));
  };

  const cancelRequest = async (toId) => {
    const res = await fetch(`${API_URL}/amistad/solicitud`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromId: user.id, toId }),
    });
    if (res.ok) setEstados((prev) => ({ ...prev, [toId]: 'none' }));
  };

  const unfriendUser = async (otherId) => {
    const res = await fetch(`${API_URL}/amistad/amigos`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userAId: user.id, userBId: otherId }),
    });
    if (res.ok) setEstados((prev) => ({ ...prev, [otherId]: 'none' }));
  };

  const { friends, suggestions } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const others = users
      .filter((u) => u.id !== user?.id)
      .filter((u) => !q || u.nombre?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));

    const friends = others.filter((u) => (estados[u.id] ?? 'none') === 'friend');
    const nonFriends = others.filter((u) => (estados[u.id] ?? 'none') !== 'friend');

    const suggestions = sortByProximityBands(nonFriends, user?.lat ?? null, user?.lng ?? null);

    return { friends, suggestions };
  }, [users, estados, query, user?.id, user?.lat, user?.lng]);

  if (loading) {
    return (
      <div className="flex flex-col gap-5 max-w-2xl mx-auto">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Amigos</h2>
        </div>
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7 max-w-2xl mx-auto">

      {/* Sección: Amigos */}
      <div className="flex flex-col gap-3">
        <SectionLabel>Amigos</SectionLabel>
        {friends.length === 0 ? (
          <EmptyState text="Aún no tienes amigos. Envía solicitudes para conectar con personas." />
        ) : (
          <div className="flex flex-col gap-2">
            {friends.map((person) => (
              <UserCard
                key={person.id}
                person={person}
                status="friend"
                onSend={() => {}}
                onCancel={() => {}}
                onUnfriend={() => unfriendUser(person.id)}
                onViewProfile={onViewProfile}
              />
            ))}
          </div>
        )}
      </div>

      {/* Divisor */}
      <div className="border-t border-[var(--border-color)]" />

      {/* Sección: Personas que quizás conozcas */}
      <div className="flex flex-col gap-3">
        <SectionLabel>Personas que quizás conozcas</SectionLabel>
        {suggestions.length === 0 ? (
          <EmptyState text={query ? "Sin resultados para esa búsqueda." : "No hay más personas registradas."} />
        ) : (
          <div className="flex flex-col gap-2">
            {suggestions.map((person) => (
              <UserCard
                key={person.id}
                person={person}
                status={estados[person.id] ?? 'none'}
                onSend={() => sendRequest(person.id)}
                onCancel={() => cancelRequest(person.id)}
                onUnfriend={() => unfriendUser(person.id)}
                onViewProfile={onViewProfile}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
