import React, { useState, useEffect, useCallback } from "react";

const REDUCED_MOTION =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function LocationSpotlight({ onDismiss }) {
  const [visible, setVisible] = useState(false);
  const [rect, setRect] = useState(null);

  useEffect(() => {
    const btn = document.getElementById("location-btn");
    if (btn) setRect(btn.getBoundingClientRect());

    // Double rAF → garantiza que la transición CSS corra después del primer paint
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setVisible(true))
    );
    return () => cancelAnimationFrame(id);
  }, []);

  const handleClickLocation = useCallback(() => {
    onDismiss();
    // Le da tiempo al overlay de empezar a salir antes de abrir el modal
    setTimeout(
      () => document.getElementById("location-btn")?.click(),
      REDUCED_MOTION ? 0 : 300
    );
  }, [onDismiss]);

  return (
    <div
      className="fixed inset-0 z-[9500]"
      style={{
        backgroundColor: "rgba(0,0,0,0.82)",
        opacity: visible ? 1 : 0,
        transition: REDUCED_MOTION ? "none" : "opacity 550ms ease-out",
        pointerEvents: visible ? "auto" : "none",
      }}
      onClick={(e) => {
        // click fuera del contenido → dismiss
        if (e.target === e.currentTarget) onDismiss();
      }}
    >
      {rect && (
        <>
          {/* Flecha + consejo, posicionado justo bajo el botón */}
          <div
            style={{
              position: "absolute",
              top: rect.bottom + 20,
              left: Math.max(16, rect.left - 4),
              pointerEvents: "auto",
            }}
            className="flex flex-col items-start"
          >
            {/* Flecha SVG apuntando arriba */}
            <svg
              width="26"
              height="42"
              viewBox="0 0 26 42"
              fill="none"
              aria-hidden="true"
              style={{ marginLeft: rect.width / 2 - 13 }}
            >
              <line
                x1="13" y1="42" x2="13" y2="10"
                stroke="white" strokeWidth="1.5"
              />
              <polyline
                points="4,20 13,4 22,20"
                fill="none"
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>

            {/* Texto consejo */}
            <p
              style={{
                color: "#FF6B6B",
                fontSize: "clamp(1.2rem, 3.5vw, 1.55rem)",
                lineHeight: 1.35,
                fontWeight: 400,
                maxWidth: "min(380px, 85vw)",
                marginTop: 12,
              }}
            >
              Selecciona tu ubicación<br />
              para ver lugares cerca de ti
            </p>

            {/* Botón Después */}
            <button
              onClick={onDismiss}
              className="cursor-pointer transition-colors duration-200"
              style={{
                marginTop: 20,
                color: "rgba(255,255,255,0.5)",
                fontSize: "0.875rem",
                background: "none",
                border: "none",
                padding: "10px 0",
                textDecoration: "underline",
                textUnderlineOffset: 3,
                minHeight: 44,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.85)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
            >
              Después
            </button>
          </div>
        </>
      )}
    </div>
  );
}
