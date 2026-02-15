import { LuHouse, LuUserRound } from "react-icons/lu";
import "./bread-cumb.css";

const Breadcumb_perfil = ({ onGoToCategories }) => {
  return (
    <nav className="flex items-center gap-4 p-4 border-b border-gray-200">
      <button
        onClick={(e) => {
          e.preventDefault();
          onGoToCategories();
        }}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition"
      >
        <LuHouse />
        Inicio
      </button>
      <span className="text-gray-400">/</span>
      <span className="flex items-center gap-2 text-gray-700">
        <LuUserRound />
        Perfil
      </span>
    </nav>
  );
};

export default Breadcumb_perfil;