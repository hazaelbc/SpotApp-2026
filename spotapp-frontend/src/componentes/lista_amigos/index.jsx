import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { FiUserPlus, FiUserCheck, FiUsers, FiClock, FiUserX } from "react-icons/fi";
import { useUser } from "../../userProvider";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const ZONE_RADIUS_KM = 50;

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

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Levenshtein similarity [0..1] between two strings
function similarity(a, b) {
  a = a.toLowerCase();
  b = b.toLowerCase();
  if (a === b) return 1;
  if (!a.length || !b.length) return 0;
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return 1 - dp[m][n] / Math.max(m, n);
}

// Returns match score for a user against a query [0..1]
// 1 = contains match, 0.5-0.99 = fuzzy, <0.5 = no match
function matchScore(user, q) {
  if (!q) return 0;
  const name = (user.nombre || '').toLowerCase();
  const ql = q.toLowerCase();
  if (name.includes(ql)) return 1;
  // Token-level fuzzy: split query and name into words, match best pair
  const qTokens = ql.split(/\s+/).filter(Boolean);
  const nTokens = name.split(/\s+/).filter(Boolean);
  let totalScore = 0;
  for (const qt of qTokens) {
    const best = Math.max(...nTokens.map(nt => similarity(qt, nt)));
    totalScore += best;
  }
  return totalScore / qTokens.length;
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
          <button disabled={loading} onClick={() => handle(onSend)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] text-xs font-medium hover:text-[var(--text-primary)] hover:border-[var(--text-tertiary)] transition-colors disabled:opacity-50">
            <FiUserPlus className="w-3.5 h-3.5" style={{ strokeWidth: 1.5 }} />
            Enviar solicitud
          </button>
        )}
        {status === 'pending' && (
          <button disabled={loading} onClick={() => handle(onCancel)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-secondary)] text-xs font-medium hover:text-[var(--text-primary)] hover:border-[var(--text-tertiary)] transition-colors disabled:opacity-50">
            <FiClock className="w-3.5 h-3.5" style={{ strokeWidth: 1.5 }} />
            Pendiente · Cancelar
          </button>
        )}
        {status === 'friend' && (
          <div className="relative" ref={menuRef}>
            <button disabled={loading} onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-tertiary)] text-xs font-medium hover:text-[var(--text-primary)] hover:border-[var(--text-tertiary)] transition-colors disabled:opacity-50">
              <FiUserCheck className="w-3.5 h-3.5" style={{ strokeWidth: 1.5 }} />
              Amigos
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-lg z-50 overflow-hidden">
                <button disabled={loading} onClick={() => { setMenuOpen(false); handle(onUnfriend); }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50">
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
      if (usersRes.ok) { const d = await usersRes.json(); setUsers(Array.isArray(d) ? d : []); }
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
    const reload = () => loadUsers();
    window.addEventListener('focus', reload);
    window.addEventListener('amistad-changed', reload);
    return () => { window.removeEventListener('focus', reload); window.removeEventListener('amistad-changed', reload); };
  }, [loadUsers]);

  const sendRequest = async (toId) => {
    const res = await fetch(`${API_URL}/amistad/solicitud`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fromId: user.id, toId }) });
    if (res.ok) setEstados((prev) => ({ ...prev, [toId]: 'pending' }));
  };
  const cancelRequest = async (toId) => {
    const res = await fetch(`${API_URL}/amistad/solicitud`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fromId: user.id, toId }) });
    if (res.ok) setEstados((prev) => ({ ...prev, [toId]: 'none' }));
  };
  const unfriendUser = async (otherId) => {
    const res = await fetch(`${API_URL}/amistad/amigos`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userAId: user.id, userBId: otherId }) });
    if (res.ok) setEstados((prev) => ({ ...prev, [otherId]: 'none' }));
  };

  const myLat = user?.lat ?? null;
  const myLng = user?.lng ?? null;
  const hasLocation = myLat != null && myLng != null;

  const { friends, suggestions, fuzzyHints, isSearching } = useMemo(() => {
    const q = query.trim();
    const others = users.filter((u) => u.id !== user?.id);
    const friends = others.filter((u) => (estados[u.id] ?? 'none') === 'friend');
    const nonFriends = others.filter((u) => (estados[u.id] ?? 'none') !== 'friend');

    if (q) {
      // Búsqueda activa — sin filtro de zona, con fuzzy matching
      const scored = nonFriends.map(u => ({ u, score: matchScore(u, q) }));
      const exact = scored.filter(({ score }) => score >= 0.7).map(({ u }) => u);
      const fuzzy = scored.filter(({ score }) => score >= 0.45 && score < 0.7).map(({ u }) => u);
      return { friends, suggestions: exact, fuzzyHints: fuzzy, isSearching: true };
    }

    // Sin búsqueda — solo usuarios de la misma zona, orden aleatorio
    if (!hasLocation) {
      return { friends, suggestions: [], fuzzyHints: [], isSearching: false };
    }

    const inZone = nonFriends.filter(u => {
      if (u.lat == null || u.lng == null) return false;
      return haversine(myLat, myLng, u.lat, u.lng) <= ZONE_RADIUS_KM;
    });

    return { friends, suggestions: shuffle(inZone), fuzzyHints: [], isSearching: false };
  }, [users, estados, query, user?.id, myLat, myLng, hasLocation]);

  if (loading) {
    return (
      <div className="flex flex-col gap-5 max-w-2xl mx-auto">
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

      {/* Amigos */}
      <div className="flex flex-col gap-3">
        <SectionLabel>Amigos</SectionLabel>
        {friends.length === 0 ? (
          <EmptyState text="Aún no tienes amigos. Busca personas o explora tu zona." />
        ) : (
          <div className="flex flex-col gap-2">
            {friends.map((person) => (
              <UserCard key={person.id} person={person} status="friend"
                onSend={() => {}} onCancel={() => {}} onUnfriend={() => unfriendUser(person.id)} onViewProfile={onViewProfile} />
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-[var(--border-color)]" />

      {/* Sugerencias */}
      <div className="flex flex-col gap-3">
        <SectionLabel>
          {isSearching ? 'Resultados de búsqueda' : 'Personas que quizás conozcas'}
        </SectionLabel>

        {!isSearching && !hasLocation && (
          <div className="flex flex-col gap-1.5 px-1">
            <p className="text-[13px] text-[var(--text-tertiary)]">
              Configura tu ubicación para ver personas de tu zona.
            </p>
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="flex flex-col gap-2">
            {suggestions.map((person) => (
              <UserCard key={person.id} person={person} status={estados[person.id] ?? 'none'}
                onSend={() => sendRequest(person.id)} onCancel={() => cancelRequest(person.id)}
                onUnfriend={() => unfriendUser(person.id)} onViewProfile={onViewProfile} />
            ))}
          </div>
        )}

        {isSearching && suggestions.length === 0 && fuzzyHints.length === 0 && (
          <EmptyState text="Sin resultados. Intenta con otro nombre." />
        )}

        {/* Fuzzy hints — "¿Quisiste decir...?" */}
        {isSearching && suggestions.length === 0 && fuzzyHints.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-[12px] text-[var(--text-tertiary)] px-1">
              No encontramos ese nombre exacto. ¿Quizás quisiste decir...?
            </p>
            <div className="flex flex-col gap-2">
              {fuzzyHints.map((person) => (
                <UserCard key={person.id} person={person} status={estados[person.id] ?? 'none'}
                  onSend={() => sendRequest(person.id)} onCancel={() => cancelRequest(person.id)}
                  onUnfriend={() => unfriendUser(person.id)} onViewProfile={onViewProfile} />
              ))}
            </div>
          </div>
        )}

        {isSearching && suggestions.length > 0 && fuzzyHints.length > 0 && (
          <div className="flex flex-col gap-3 mt-1">
            <p className="text-[12px] text-[var(--text-tertiary)] px-1">Resultados similares</p>
            <div className="flex flex-col gap-2">
              {fuzzyHints.map((person) => (
                <UserCard key={person.id} person={person} status={estados[person.id] ?? 'none'}
                  onSend={() => sendRequest(person.id)} onCancel={() => cancelRequest(person.id)}
                  onUnfriend={() => unfriendUser(person.id)} onViewProfile={onViewProfile} />
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
