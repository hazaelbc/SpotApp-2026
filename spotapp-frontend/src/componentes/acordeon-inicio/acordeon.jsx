
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../userProvider.jsx";

import Header_Login from "../Header_Login";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const { setUser } = useUser(); 
  const [success, setSuccess] = useState(""); // Estado para el mensaje de éxito
  const navigate = useNavigate();
  const vantaRef = useRef(null);

  // Validar formato de email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Manejar recuperación de contraseña
  const handleForgotPassword = () => {
    setEmailError(""); // Limpiar errores previos
    
    if (!email.trim()) {
      setEmailError("Por favor ingresa tu correo electrónico");
      return;
    }
    
    if (!isValidEmail(email)) {
      setEmailError("Correo electrónico inválido");
      return;
    }
    
    // Si el email es válido, navegar a recuperar contraseña
    navigate("/recuperar-contrasena", { state: { email } });
  };



  const handleLogin = async (e) => {
    e.preventDefault();
    setEmailError(""); // Limpiar errores previos
    setPasswordError("");

    let hasError = false;

    // Validar email
    if (!email.trim()) {
      setEmailError("El correo electrónico es obligatorio");
      hasError = true;
    } else if (!isValidEmail(email)) {
      setEmailError("Correo electrónico inválido");
      hasError = true;
    }

    // Validar contraseña
    if (!password.trim()) {
      setPasswordError("La contraseña es obligatoria");
      hasError = true;
    }

    if (hasError) return;
  
    try {
      const response = await fetch("http://localhost:8080/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log("Inicio de sesión exitoso:", data);
        setUser(data.user);
        localStorage.setItem("authToken", data.token); // Guarda el token en localStorage
        navigate("/lobby"); // Redirige al lobby con los datos del usuario
      } else {
        setEmailError(data.message || "Error al iniciar sesión");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setEmailError("Error al conectar con el servidor");
    }
  };

  return (
      <>
        <Header_Login />
        <div 
          className="relative flex justify-center sm:justify-end items-center min-h-screen pt-16 px-4 sm:pr-8 lg:pr-16 xl:pr-24 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/bg_login.webp')" }}
        >
          {/* Overlay con opacidad y desenfoque */}
          <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm"></div>
          
          {/* Formulario sobre el overlay */}
          <div className="relative z-10 w-full max-w-lg p-8 bg-opacity-90 rounded-lg shadow-lg text-center" style={{ backgroundColor: 'white' }}>
            <h2 className="text-3xl font-semibold text-gray-600 mb-8">Inicia sesión en SpotApp</h2>
            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <div>
                <input
                  type="text"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mx-auto px-4 py-3 border border-gray-300 rounded text-lg"
                />
                {emailError && <p className="text-red-600 text-xs mt-1 text-left">{emailError}</p>}
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full mx-auto px-4 py-3 border border-gray-300 rounded text-lg"
                />
                {passwordError && <p className="text-red-600 text-xs mt-1 text-left">{passwordError}</p>}
              </div>
              <button 
                type="submit"
                className="w-full mx-auto px-4 py-3 bg-green-700 text-white rounded-3xl text-lg cursor-pointer transition-all duration-300 hover:bg-green-800 hover:scale-[1.02] hover:shadow-lg"
              >
                Iniciar Sesión
              </button>  
              <button 
                type="button"
                onClick={handleForgotPassword}
                className="w-full mx-auto px-4 py-3 text-white rounded-3xl text-lg cursor-pointer transition-all duration-300 hover:brightness-90 hover:scale-[1.02] hover:shadow-lg" style={{ backgroundColor: '#4A90E2' }}
              >
                ¿Olvidaste tu contraseña?
              </button>  
              
              {/* División con "o" */}
              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="text-gray-500 font-medium">o</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              {/* inicio de sesion con google  */}
              <button 
                type="button"
                onClick={() => navigate("/recuperar-contrasena")}
                className="w-full mx-auto px-4 py-3 text-gray-600 rounded-3xl text-lg cursor-pointer border border-gray-300 transition-all duration-300 hover:bg-gray-50 hover:border-gray-400 hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-3" style={{ backgroundColor: 'white'}}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Iniciar sesión con Google
              </button>  

              {/* olvidaste contrasena link */}
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/registro");
                }}
                className="text-blue-700 hover:text-blue-900 text-sm underline font-medium"
              >
                ¿Aún no tienes cuenta?
              </a>
            
              {success && <p className="text-white bg-green-900 bg-opacity-80 p-2 rounded text-sm">{success}</p>}

               
            </form>
          </div>
        </div>
    </>
  );
};

// prueba

export default Login;