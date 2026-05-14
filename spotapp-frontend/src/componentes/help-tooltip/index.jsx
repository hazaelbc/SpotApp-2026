import React, { useState } from 'react';

export default function HelpTooltip({ children, content, position = 'top' }) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[var(--bg-secondary)]',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-[var(--bg-secondary)]',
    left: 'left-full top-1/2 -translate-y-1/2 border-8 border-transparent border-l-[var(--bg-secondary)]',
    right: 'right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-[var(--bg-secondary)]',
  };

  return (
    <div className="relative inline-flex">
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-bold hover:bg-blue-600 transition-colors cursor-help"
        title="Obtener ayuda"
      >
        ?
      </button>

      {isVisible && (
        <div
          className={`absolute z-50 ${positionClasses[position]} min-w-[200px] max-w-xs bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-lg p-3 text-sm text-[var(--text-secondary)] pointer-events-none`}
        >
          {content}
          <div className={`absolute ${arrowClasses[position]}`}></div>
        </div>
      )}
    </div>
  );
}
