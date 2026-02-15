import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./registro.css";


const Registro = () => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  
  const [imagen, setImagen] = useState(null); // Estado para la imagen
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const vantaRef = useRef(null);



  const handleRegistro = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("email", email);
    formData.append("contrasena", contrasena);
    if (imagen) {
      formData.append("imagen", imagen); // Agrega la imagen al formulario
    }

    try {
      const response = await fetch("http://localhost:8080/users", {
        method: "POST",
        body: formData, // Enviar como FormData
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Registro exitoso:", data);
        navigate("/"); // Redirige al inicio de sesión después del registro
      } else {
        setError(data.error || "Error al registrarse");
      }
    } catch (error) {
      console.error("Error al registrarse:", error);
      setError("Error al conectar con el servidor");
    }
  };

  const handleImagenChange = (e) => {
    setImagen(e.target.files[0]); // Guarda la imagen seleccionada
  };

  return (
    <div ref={vantaRef} className="login-container">
      <div className="login-box">
        <img
            src={"/Logo.png"} // Usa la imagen del usuario o la predeterminada
            alt="Foto de perfil"
            className="logo-app-registro"
          />
        <form onSubmit={handleRegistro}>
            <div className="avatar-container">
                <label htmlFor="imagen" className="label-redondo">
                    {imagen ? (
                        <img src={URL.createObjectURL(imagen)} alt="Vista previa" />
                    ) : (
                        "Subir"
                    )}
                </label>
                <input
                id="imagen"
                type="file"
                accept="image/*"
                onChange={handleImagenChange} // Maneja el cambio de imagen
                className="input-redondo"
                />
            </div>
          <label htmlFor="nombre" className="label">Nombre</label>
          <input
            id="nombre"
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <label htmlFor="email" className="label">Correo electrónico</label>
          <input
            id="email"
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="contrasena" className="label">Contraseña</label>
          <input
            id="contrasena"
            type="password"
            placeholder="Contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
          />
          <label className="flex items-center gap-2">
            <input type="checkbox" required className="w-4 h-4" />
            <span className="label">Acepto los términos y condiciones</span>
          </label>
          
          {error && <p className="text-red-500">{error}</p>}
          <button type="submit" className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition">
            Registrarse
          </button>
        </form>
      </div>
    </div>
  );
};

export default Registro;