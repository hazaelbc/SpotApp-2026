import { useState } from "react";

const Calificacion = ({ valorInicial, onCalificar }) => {
  const [calificacion, setCalificacion] = useState(valorInicial);

  const handleChange = (event) => {
    const nuevaCalificacion = parseInt(event.target.value);
    console.log("Valor recibido en handleChange:", nuevaCalificacion);
    setCalificacion(nuevaCalificacion);
    if (onCalificar) {
      onCalificar(nuevaCalificacion);
    }
  };

  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((estrella) => (
        <label key={estrella}>
          <input
            type="radio"
            name="calificacion"
            value={estrella}
            checked={calificacion === estrella}
            onChange={handleChange}
            className="sr-only"
          />
          <span className={`text-2xl cursor-pointer ${calificacion >= estrella ? 'text-yellow-400' : 'text-gray-300'}`}>
            ★
          </span>
        </label>
      ))}
    </div>
  );
};

export default Calificacion;