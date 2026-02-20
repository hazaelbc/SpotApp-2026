import React from 'react';
import { useTheme } from '../../contexts/themeContext';

const themeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center h-8 w-14 rounded-lg bg-gray-300 dark:bg-gray-600 transition-colors duration-300 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-[#3D5A6F] shadow-inner border border-gray-300 dark:border-[var(--border-color)]"
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      style={{
        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
      }}
    >
      {/* Switch deslizante */}
      <span
        className={`inline-block h-6 w-6 transform rounded-lg bg-white shadow-lg transition-transform duration-300 ease-in-out ${
          isDark ? 'translate-x-7' : 'translate-x-1'
        }`}
        style={{
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Icono dentro del switch */}
        <span className="flex items-center justify-center h-full w-full">
          {isDark ? (
            // Luna
            <svg
              className="w-4 h-4 text-gray-700"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          ) : (
            // Sol
            <svg
              className="w-4 h-4 text-yellow-500"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </span>
      </span>
    </button>
  );
};

export default themeToggle;
