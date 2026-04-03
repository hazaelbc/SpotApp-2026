import React, { useState, useEffect } from "react";

const REDUCED_MOTION =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const PAD = 10; // padding alrededor del botón
const BG = "rgba(0,0,0,0.80)";
const TRANSITION = REDUCED_MOTION ? "none" : "opacity 550ms ease-out";

export default function LocationSpotlight({ onDismiss }) {
  const [visible, setVisible] = useState(false);
  const [rect, setRect] = useState(null);

  useEffect(() => {
    const btn = document.getElementById("location-btn");
    if (btn) setRect(btn.getBoundingClientRect());

    // doble rAF → garantiza transición después del primer paint
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setVisible(true))
    );
    return () => cancelAnimationFrame(id);
  }, []);

  if (!rect) return null;

  const hTop = rect.top - PAD;
  const hLeft = rect.left - PAD;
  const hW = rect.width + PAD * 2;
  const hH = rect.height + PAD * 2;
  const hBottom = hTop + hH;

  const common = {
    position: "absolute",
    background: BG,
    cursor: "default",
  };

  return (
    <div
      className="fixed inset-0 z-[9500]"
      style={{ opacity: visible ? 1 : 0, transition: TRANSITION, pointerEvents: "auto" }}
    >
      {/*
        Cuatro rectángulos oscuros que rodean el hueco del botón.
        El botón queda expuesto → se ve con su color real (claro u oscuro)
        y es el único elemento interactivo del lobby que queda accesible.
      */}

      {/* Arriba */}
      <div
        style={{ ...common, top: 0, left: 0, right: 0, height: hTop }}
        onClick={onDismiss}
      />
      {/* Izquierda */}
      <div
        style={{ ...common, top: hTop, left: 0, width: hLeft, height: hH }}
        onClick={onDismiss}
      />
      {/* Derecha */}
      <div
        style={{ ...common, top: hTop, left: hLeft + hW, right: 0, height: hH }}
        onClick={onDismiss}
      />
      {/* Abajo */}
      <div
        style={{ ...common, top: hBottom, left: 0, right: 0, bottom: 0 }}
        onClick={onDismiss}
      />

      {/* Anillo de resaltado alrededor del botón */}
      <div
        style={{
          position: "absolute",
          top: hTop,
          left: hLeft,
          width: hW,
          height: hH,
          borderRadius: 10,
          border: "2px solid rgba(255,255,255,0.55)",
          boxShadow: "0 0 0 4px rgba(255,255,255,0.08)",
          pointerEvents: "none",
        }}
      />

      {/* Flecha + consejo (encima del rect inferior) */}
      <div
        style={{
          position: "absolute",
          top: hBottom + 18,
          left: Math.max(16, hLeft),
          pointerEvents: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 0,
        }}
      >
        {/* Flecha SVG → apunta al botón */}
        <svg
          width="24"
          height="40"
          viewBox="0 0 24 40"
          fill="none"
          aria-hidden="true"
          style={{ marginLeft: Math.max(0, rect.width / 2 - 12) }}
        >
          <line x1="12" y1="40" x2="12" y2="8" stroke="white" strokeWidth="1.5" />
          <polyline
            points="4,18 12,4 20,18"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>

        {/* Texto */}
        <p
          style={{
            marginTop: 14,
            color: "rgba(255,255,255,0.92)",
            fontSize: "clamp(1.15rem, 3.2vw, 1.5rem)",
            lineHeight: 1.35,
            fontWeight: 400,
            maxWidth: "min(360px, 82vw)",
          }}
        >
          Selecciona tu ubicación
          <br />
          para ver lugares cerca de ti
        </p>

        {/* Después */}
        <button
          onClick={onDismiss}
          style={{
            marginTop: 18,
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
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
        >
          Después
        </button>
      </div>
    </div>
  );
}
