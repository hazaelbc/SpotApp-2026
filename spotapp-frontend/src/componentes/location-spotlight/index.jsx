import React, { useState, useEffect } from "react";
import { FiArrowUp } from "react-icons/fi";

const REDUCED_MOTION =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const PAD = 10;
const BG = "rgba(0,0,0,0.80)";
const TRANSITION = REDUCED_MOTION ? "none" : "opacity 550ms ease-out";

export default function LocationSpotlight({ onDismiss }) {
  const [visible, setVisible] = useState(false);
  const [rect, setRect] = useState(null);

  useEffect(() => {
    const btn = document.getElementById("location-btn");
    if (btn) setRect(btn.getBoundingClientRect());

    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setVisible(true))
    );
    return () => cancelAnimationFrame(id);
  }, []);

  if (!rect) return null;

  const hTop    = rect.top    - PAD;
  const hLeft   = rect.left   - PAD;
  const hW      = rect.width  + PAD * 2;
  const hH      = rect.height + PAD * 2;
  const hBottom = hTop + hH;

  // El contenedor tiene pointer-events: none → no bloquea el hueco.
  // Cada rect oscuro tiene pointer-events: auto → bloquea el resto del lobby.
  return (
    <div
      className="fixed inset-0 z-[9500]"
      style={{ opacity: visible ? 1 : 0, transition: TRANSITION, pointerEvents: "none" }}
    >
      {/* ── Cuatro rects oscuros ── */}
      {[
        // Arriba
        { top: 0,       left: 0,         right: 0,    height: hTop },
        // Izquierda
        { top: hTop,    left: 0,         width: hLeft, height: hH },
        // Derecha
        { top: hTop,    left: hLeft + hW, right: 0,   height: hH },
        // Abajo
        { top: hBottom, left: 0,         right: 0,    bottom: 0 },
      ].map((s, i) => (
        <div
          key={i}
          onClick={onDismiss}
          style={{
            position: "absolute",
            background: BG,
            cursor: "default",
            pointerEvents: "auto",
            ...s,
          }}
        />
      ))}

      {/* ── Anillo alrededor del botón ── */}
      <div
        style={{
          position: "absolute",
          top: hTop, left: hLeft,
          width: hW, height: hH,
          borderRadius: 10,
          border: "2px solid rgba(255,255,255,0.55)",
          boxShadow: "0 0 0 4px rgba(255,255,255,0.08)",
          pointerEvents: "none",
        }}
      />

      {/* ── Flecha + consejo ── */}
      <div
        style={{
          position: "absolute",
          top: hBottom + 16,
          left: Math.max(16, hLeft),
          pointerEvents: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        {/* Icono de flecha */}
        <FiArrowUp
          size={28}
          color="white"
          strokeWidth={1.5}
          style={{
            marginLeft: Math.max(0, rect.width / 2 - 14),
            animation: REDUCED_MOTION ? "none" : "spotlight-bounce 1.4s ease-in-out infinite",
          }}
        />

        <p
          style={{
            marginTop: 12,
            color: "rgba(255,255,255,0.92)",
            fontSize: "clamp(1.1rem, 3vw, 1.45rem)",
            lineHeight: 1.35,
            fontWeight: 400,
            maxWidth: "min(340px, 80vw)",
          }}
        >
          Selecciona tu ubicación
          <br />
          para ver lugares cerca de ti
        </p>

        <button
          onClick={onDismiss}
          style={{
            marginTop: 16,
            background: "none",
            border: "none",
            padding: "10px 0",
            minHeight: 44,
            color: "rgba(255,255,255,0.45)",
            fontSize: "0.875rem",
            cursor: "pointer",
            textDecoration: "underline",
            textUnderlineOffset: 3,
            transition: "color 200ms",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.85)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
        >
          Después
        </button>
      </div>

      <style>{`
        @keyframes spotlight-bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
