import React, { useMemo, useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';

/*
  GaleriaEfimera
  - Uso: <GaleriaEfimera images={[url1,url2,...]} intervalSeconds={3600} crop={false} />
  - Comportamiento:
    * Selecciona y ordena imágenes de forma determinista basada en el tiempo (ephemeral rotation).
    * Escoge una plantilla (layout) diferente según el mismo periodo de tiempo.
    * No hay CSS externo: usa twin.macro + styled-components.
    * Prop `crop` controla si las imágenes llenan el recuadro (`object-fit: cover`) o se ajustan (`contain`).
*/

// Use plain Tailwind classes instead of styled-components/twin to avoid
// requiring additional runtime deps. The markup below applies these
// classes directly on elements.

// simple seeded RNG (mulberry32)
function mulberry32(a) {
  return function() {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle(arr, seed) {
  const a = arr.slice();
  const rand = mulberry32(seed >>> 0);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Instead of fixed templates, generate a deterministic random partition of a
// rectangle into smaller rectangles (guillotine-like partition). This creates
// varied rectangle sizes (no matching sizes when possible) and yields a
// collage made of rectangles/squares of different dimensions.
function generateLayout(seed, maxSlots) {
  const rand = mulberry32(seed >>> 0);
  // base grid resolution (adapt to maxSlots so layouts are less blocky)
  const GRID_W = Math.max(5, Math.min(12, Math.floor(maxSlots * 1.8)));
  const GRID_H = Math.max(4, Math.ceil(maxSlots / 2));

  // start with one big region
  const regions = [{ x: 0, y: 0, w: GRID_W, h: GRID_H }];

  // function to try splitting a region
  function splitRegion(region) {
    const canSplitX = region.w > 1;
    const canSplitY = region.h > 1;
    if (!canSplitX && !canSplitY) return [region];

    // prefer splitting the longer side (but randomized)
    const splitAlongX = canSplitX && (canSplitY ? (rand() > 0.5 ? true : false) : true);

    if (splitAlongX) {
      // choose split point between 1 and w-1
      const split = 1 + Math.floor(rand() * (region.w - 1));
      const a = { x: region.x, y: region.y, w: split, h: region.h };
      const b = { x: region.x + split, y: region.y, w: region.w - split, h: region.h };
      return [a, b];
    }

    // split along Y
    const split = 1 + Math.floor(rand() * (region.h - 1));
    const a = { x: region.x, y: region.y, w: region.w, h: split };
    const b = { x: region.x, y: region.y + split, w: region.w, h: region.h - split };
    return [a, b];
  }

  // iteratively split until we reach desired number of slots or cannot split
  let iter = 0;
  while (regions.length < Math.max(1, Math.min(maxSlots, 12))) {
    // pick the largest region (area) to split
    regions.sort((a, b) => b.w * b.h - a.w * a.h);
    const target = regions.shift();
    const parts = splitRegion(target);
    // if splitRegion didn't split, push it back and break
    if (parts.length === 1) {
      regions.unshift(target);
      break;
    }
    regions.push(parts[0], parts[1]);
    iter++;
    if (iter > 50) break; // safety
  }

  // map regions to slots (1-based grid coordinates)
  const slots = regions.map(r => ({
    colStart: r.x + 1,
    colSpan: r.w,
    rowStart: r.y + 1,
    rowSpan: r.h,
  }));

  // try to minimize duplicate sizes: if duplicates exist, attempt extra splits
  // but never exceed maxSlots when splitting duplicates (prevents empty gaps)
  const sizes = new Map();
  for (let i = 0; i < slots.length; i++) {
    const key = `${slots[i].colSpan}x${slots[i].rowSpan}`;
    sizes.set(key, (sizes.get(key) || 0) + 1);
  }

  // if there are duplicates and we can split further, split duplicates
  for (let i = 0; i < slots.length && Array.from(sizes.values()).some(v => v > 1); i++) {
    // don't split if we're already at maxSlots
    if (slots.length >= Math.max(1, Math.min(maxSlots, 12))) break;

    const s = slots[i];
    const key = `${s.colSpan}x${s.rowSpan}`;
    if (sizes.get(key) <= 1) continue;
    // attempt to split this slot (prefer splitting the longer side) using a
    // non-symmetric random split to avoid creating identical halves
    const randSplit = Math.max(1, Math.floor((mulberry32((i + 1) ^ 0xabcdef)() * (Math.max(s.colSpan, s.rowSpan) - 1)))) ;

    if (s.colSpan > 1 && s.colSpan >= s.rowSpan) {
      const split = Math.min(s.colSpan - 1, Math.max(1, randSplit));
      const a = { colStart: s.colStart, colSpan: split, rowStart: s.rowStart, rowSpan: s.rowSpan };
      const b = { colStart: s.colStart + split, colSpan: s.colSpan - split, rowStart: s.rowStart, rowSpan: s.rowSpan };
      slots.splice(i, 1, a, b);
      sizes.set(key, sizes.get(key) - 1);
      sizes.set(`${a.colSpan}x${a.rowSpan}`, (sizes.get(`${a.colSpan}x${a.rowSpan}`) || 0) + 1);
      sizes.set(`${b.colSpan}x${b.rowSpan}`, (sizes.get(`${b.colSpan}x${b.rowSpan}`) || 0) + 1);
    } else if (s.rowSpan > 1) {
      const split = Math.min(s.rowSpan - 1, Math.max(1, randSplit));
      const a = { colStart: s.colStart, colSpan: s.colSpan, rowStart: s.rowStart, rowSpan: split };
      const b = { colStart: s.colStart, colSpan: s.colSpan, rowStart: s.rowStart + split, rowSpan: s.rowSpan - split };
      slots.splice(i, 1, a, b);
      sizes.set(key, sizes.get(key) - 1);
      sizes.set(`${a.colSpan}x${a.rowSpan}`, (sizes.get(`${a.colSpan}x${a.rowSpan}`) || 0) + 1);
      sizes.set(`${b.colSpan}x${b.rowSpan}`, (sizes.get(`${b.colSpan}x${b.rowSpan}`) || 0) + 1);
    }
  }

  // compute effective cols (max colStart+colSpan-1)
  const effectiveCols = Math.max(...slots.map(s => s.colStart + s.colSpan - 1));
  return { cols: effectiveCols, slots };
}

export default function GaleriaEfimera({ images = [], intervalSeconds = 60 * 60, crop = true, maxSlots = 6 }) {
  // seed determined by time interval so it rotates periodically
  const periodIndex = Math.floor(Date.now() / 1000 / Math.max(1, intervalSeconds));

  const { layout, chosen } = useMemo(() => {
    // generate a deterministic layout per period
    const layoutSeed = periodIndex ^ 0x9e3779b9;
    const generated = generateLayout(layoutSeed, maxSlots);

    // deterministic shuffle of images
    const shuffled = seededShuffle(images, layoutSeed + 0x1234567);

    const slotCount = Math.min(generated.slots.length, maxSlots);
    const chosenImgs = shuffled.slice(0, slotCount);

    // if there are fewer images than slots, fill the rest with deterministic placeholders
    const chosenFull = chosenImgs.slice();
    for (let k = chosenFull.length; k < slotCount; k++) {
      chosenFull.push(`https://picsum.photos/seed/gal-${layoutSeed}-${k}/800/600`);
    }

    return { layout: generated, chosen: chosenFull };
  }, [images, periodIndex, intervalSeconds, maxSlots]);

  // render grid with absolute placement using CSS grid and inline style for spans
  const cols = layout.cols || 3;
  const rowHeight = cols >= 4 ? '90px' : '120px';

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  function prevImage() {
    setLightboxIndex(i => (i - 1 + chosen.length) % chosen.length);
  }
  function nextImage() {
    setLightboxIndex(i => (i + 1) % chosen.length);
  }

  useEffect(() => {
    if (!lightboxOpen) return undefined;
    function onKey(e) {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, chosen.length]);

  // Notify other UI parts (e.g. side indexes) that a gallery modal is open
  useEffect(() => {
    try {
      const ev = new CustomEvent('gallery-lightbox', { detail: { open: !!lightboxOpen } });
      window.dispatchEvent(ev);
    } catch (e) {}
    return () => {
      try { window.dispatchEvent(new CustomEvent('gallery-lightbox', { detail: { open: false } })); } catch (e) {}
    };
  }, [lightboxOpen]);

  return (
    <div className="w-full max-w-full rounded-lg overflow-hidden bg-[var(--bg-primary)]">
      <div className="p-2">
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridAutoRows: rowHeight }}>
          {layout.slots.slice(0, chosen.length).map((slot, i) => (
            <div
              key={i}
              role="button"
              tabIndex={0}
              onClick={() => { setLightboxIndex(i); setLightboxOpen(true); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { setLightboxIndex(i); setLightboxOpen(true); } }}
              className="relative overflow-hidden bg-[var(--bg-tertiary)] hover:shadow-lg rounded-sm cursor-pointer group"
              style={{
                minHeight: '48px',
                gridColumn: `${slot.colStart} / span ${slot.colSpan}`,
                gridRow: `${slot.rowStart} / span ${slot.rowSpan}`,
              }}
            >
              <img
                src={chosen[i]}
                alt={`gallery-${i}`}
                loading="lazy"
                className={`w-full h-full object-center transition-transform duration-300 group-hover:scale-105 ${crop ? 'object-cover' : 'object-contain bg-[var(--bg-primary)]'}`}
              />
            </div>
          ))}
        </div>
        {lightboxOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setLightboxOpen(false)}>
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => setLightboxOpen(false)}
                  aria-label="Cerrar imagen"
                  className="absolute right-3 top-3 z-50 p-2 sm:p-3 bg-white/90 dark:bg-black/60 text-black dark:text-white rounded-full shadow-lg border border-white/20 dark:border-black/40 hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-white/60"
                >
                  <FiX className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  aria-label="Imagen anterior"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-50 p-3 sm:p-4 bg-white/90 dark:bg-black/60 text-black dark:text-white rounded-full shadow-2xl border border-white/10 dark:border-black/40 hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-white/60"
                >
                  <FiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                <img src={chosen[lightboxIndex]} alt={`lightbox-${lightboxIndex}`} className="max-w-[90vw] max-h-[90vh] object-contain rounded" />

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  aria-label="Siguiente imagen"
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-50 p-3 sm:p-4 bg-white/90 dark:bg-black/60 text-black dark:text-white rounded-full shadow-2xl border border-white/10 dark:border-black/40 hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-white/60"
                >
                  <FiChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
          </div>
        )}
      </div>
    </div>
  );
}
