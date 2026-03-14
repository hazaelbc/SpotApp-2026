import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";

export const BarraBusqueda = ({ onSearch, className = "" }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className={`w-full ${className}`}>
      <div className="relative flex items-center">
        <input
          type="text"
          value={searchTerm}
          onChange={handleChange}
          placeholder="Buscar en la Lobby..."
          aria-label="Buscar en la Lobby"
          className="w-full px-3 py-1.5 pl-5 sm:px-4 sm:py-1.5 sm:pl-4 text-sm sm:text-base bg-white dark:bg-[var(--bg-secondary)] text-gray-700 dark:text-[var(--text-primary)] border border-gray-300 dark:border-[var(--border-color)] rounded-lg placeholder:text-gray-400 dark:placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-[#3D5A6F] focus:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shadow-sm transition duration-100 ease-in"
        />
        
        <button
          type="submit"
          aria-label="Buscar"
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 flex items-center justify-center p-2"
        >
          <FiSearch
            className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-[var(--text-tertiary)] transition-colors duration-200"
            style={{ strokeWidth: 1 }}
          />
        </button>
      </div>
    </form>
  );
};

export default BarraBusqueda;

// right-2 mueve todo a la derecha
// left-4