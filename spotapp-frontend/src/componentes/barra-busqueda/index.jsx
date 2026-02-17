import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";

export const BarraBusqueda = ({ onSearch }) => {
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
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto px-2 sm:px-4">
      <div className="relative flex items-center">
        <input
          type="text"
          value={searchTerm}
          onChange={handleChange}
          placeholder="Buscar en la Lobby..."
          className="w-full px-3 py-2 pl-5 mt-4 sm:px-4 sm:py-3 sm:pl-7 sm:mt-6 text-sm sm:text-base text-gray-700 bg-white border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent shadow-sm transition duration-200"
        />
        
        <button
          type="submit"
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 flex items-center justify-center mt-2 sm:mt-3"
        >
          <FiSearch className="text-gray-400 text-2xl sm:text-3xl" />
        </button>
      </div>
    </form>
  );
};

export default BarraBusqueda;

// right-2 mueve todo a la derecha
// left-4