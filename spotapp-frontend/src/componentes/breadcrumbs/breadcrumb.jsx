import { LuInfo, LuMap } from "react-icons/lu"
import "./breadcrumb.css";
import { useState } from "react";

const Breadcrumblecookie = ({ onNavigate }) => {
  const [activeItem, setActiveItem] = useState("info");

  const handleNavigate = (screen) => {
    setActiveItem(screen);
    onNavigate(screen);
  };
  
  return (
    <nav className="flex items-center gap-4 p-4 border-b border-gray-200">
      <button
        onClick={() => handleNavigate("info")}
        className={`flex items-center gap-2 transition ${
          activeItem === "info"
            ? "text-blue-600 font-semibold"
            : "text-gray-700 hover:text-blue-600"
        }`}
      >
        <LuInfo />
        Información
      </button>
      <span className="text-gray-400">/</span>
      <button
        onClick={() => handleNavigate("mapa")}
        className={`flex items-center gap-2 transition ${
          activeItem === "mapa"
            ? "text-blue-600 font-semibold"
            : "text-gray-700 hover:text-blue-600"
        }`}
      >
        <LuMap />
        Mapa
      </button>
    </nav>
  );
};

export default Breadcrumblecookie;