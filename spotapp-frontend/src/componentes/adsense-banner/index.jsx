import React, { useEffect } from 'react';

const ADS_ENABLED = import.meta.env.VITE_ENABLE_ADS === 'true';

/**
 * AdSenseBanner
 * colSpan: number of grid columns this banner spans (2 | 3 | 4)
 * slotId:  AdSense data-ad-slot value
 * fullWidth: overrides grid span — renders as w-full block (for top banner)
 * height: override placeholder height (default 340 to match card height)
 */
export default function AdSenseBanner({ colSpan = 2, slotId = '', fullWidth = false, height = 340 }) {
  useEffect(() => {
    if (!ADS_ENABLED) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (_) {}
  }, []);

  const gridSpanStyle = fullWidth
    ? { gridColumn: '1 / -1' }
    : { gridColumn: `span ${colSpan}` };

  const containerStyle = {
    ...gridSpanStyle,
    minHeight: `${height}px`,
  };

  if (!ADS_ENABLED) {
    return (
      <div style={containerStyle}>
        <div
          className="w-full h-full rounded-lg border border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col items-center justify-center gap-2 select-none"
          style={{ minHeight: `${height}px` }}
        >
          {/* Ad icon */}
          <div className="w-9 h-9 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-[var(--text-tertiary)]" aria-hidden="true">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M8 12h4m0 0l-2-2m2 2l-2 2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15 9v6" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-tertiary)]">
            Espacio Patrocinado
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: `${height}px` }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
