import React, { useState, useEffect, useRef } from "react";

const ModalNombre = ({ isOpen, onClose, onSubmit, defaultName = "" }) => {
  const [nombre, setNombre] = useState(defaultName);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  // Focus automático cuando se abre el modal
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Cerrar con tecla ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Validar nombre
    if (!nombre.trim()) {
      setError("Por favor ingresa tu nombre");
      return;
    }

    if (nombre.trim().length < 2) {
      setError("El nombre debe tener al menos 2 caracteres");
      return;
    }

    // Enviar nombre y cerrar modal
    onSubmit(nombre.trim());
  };

  const handleCancel = () => {
    setNombre(defaultName);
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="modal-title"
          className="text-2xl font-semibold text-gray-800 mb-4"
        >
          ¿Cómo te gustaría llamarte?
        </h2>
        <p className="text-gray-600 text-sm mb-6">
          Puedes usar el nombre sugerido o elegir uno diferente
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <input
              ref={inputRef}
              type="text"
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                setError("");
              }}
              placeholder="Tu nombre"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {error && (
              <p className="text-red-600 text-xs mt-2">{error}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-green-700 text-white rounded-lg font-medium hover:bg-green-800 transition-colors"
            >
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalNombre;
