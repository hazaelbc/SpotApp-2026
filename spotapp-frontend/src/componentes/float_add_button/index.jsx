import React, { useRef, useState, useEffect } from 'react';

export default function FloatingAddButton({ onClick }) {
  const elRef = useRef(null);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const pointerRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  const [pos, setPos] = useState(() => {
    try {
      const raw = localStorage.getItem('fab_pos');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { left: null, top: null };
  });

  useEffect(() => {
    if (pos.left == null || pos.top == null) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const size = 64;
      const defaultLeft = Math.max(12, w - size - 20);
      const defaultTop = Math.max(12, h - size - 100);
      setPos({ left: defaultLeft, top: defaultTop });
    }
  }, []);

  useEffect(() => {
    try { localStorage.setItem('fab_pos', JSON.stringify(pos)); } catch (e) {}
  }, [pos]);

  const handlePointerDown = (e) => {
    try {
      e.preventDefault();
      const el = elRef.current;
      if (!el) return;
      draggingRef.current = true;
      movedRef.current = false;
      pointerRef.current = e.pointerId;
      const rect = el.getBoundingClientRect();
      offsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      el.setPointerCapture && el.setPointerCapture(e.pointerId);
      const onPointerMove = (ev) => {
        // mark that the pointer moved enough to be considered a drag
        movedRef.current = true;
        if (!draggingRef.current) return;
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        const left = Math.min(Math.max(8, ev.clientX - offsetRef.current.x), window.innerWidth - w - 8);
        const top = Math.min(Math.max(8, ev.clientY - offsetRef.current.y), window.innerHeight - h - 8);
        setPos({ left, top });
      };
      const onPointerUp = (ev) => {
        if (!draggingRef.current) return;
        draggingRef.current = false;
        try { el.releasePointerCapture && el.releasePointerCapture(ev.pointerId); } catch (e) {}
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        // If pointer never moved (tap), treat as click
        try {
          if (!movedRef.current && typeof onClick === 'function') onClick();
        } catch (e) {}
      };
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    } catch (e) {
      console.error('FAB pointerDown error', e);
    }
  };

  if (pos.left == null || pos.top == null) return null;

  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

    const containerStyle = {
    position: 'fixed',
    left: pos.left,
    top: pos.top,
    zIndex: 60,
    width: 56,
    height: 56,
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
      boxShadow: '0 3px 8px rgba(0,0,0,0.16)',
    cursor: 'grab',
    userSelect: 'none',
    border: isDark ? '1px solid var(--border-color)' : 'none',
    background: isDark ? 'var(--bg-secondary)' : 'linear-gradient(180deg,var(--accent-blue),var(--accent-blue-hover))'
  };

  const iconStroke = isDark ? 'var(--text-primary)' : '#ffffff';

  return (
    <div
      ref={elRef}
      role="button"
      aria-label="Agregar"
      onPointerDown={handlePointerDown}
      style={containerStyle}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M12 6v12" stroke={iconStroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 12h12" stroke={iconStroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
