
import React, { useState, useEffect, useRef } from "react";
// API base URL configurable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
import { useNavigate } from "react-router-dom";
import { useUser } from "../../userProvider.jsx";
import { signInWithGoogle } from "../../config/firebase";
import Header_Login from "../Header_Login";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(""); // Combo error: email OR password
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useUser(); 
  const [success, setSuccess] = useState("");
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

  // Manejar inicio de sesión con Google
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    console.log('Iniciando sesión con Google...');
    try {
      const user = await signInWithGoogle();
      console.log('Usuario de Google obtenido:', user);

      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: user.displayName,
          email: user.email,
          contrasena: user.uid,
          googleId: user.uid,
          provider: 'google',
          fotoPerfil: user.photoURL,
        }),
      });

      const data = await response.json();
      console.log('Respuesta del backend:', data);

      if (response.ok) {
        // Login exitoso (ya sea nuevo registro o usuario existente)
        console.log("Inicio de sesión con Google exitoso:", data);
        console.log("Usuario recibido tiene ID?", data.user?.id, "Completo:", data.user);
        
        if (!data.user?.id) {
          console.error("❌ ERROR: El backend NO retornó un ID válido. Respuesta:", data);
          setEmailError('Error: No se recibió ID del usuario. Contacte soporte.');
          return;
        }
        
        setUser(data.user);
        localStorage.setItem("authToken", "google-token-" + user.uid);
        navigate('/lobby');
      } else {
        setEmailError(data.message || 'Error al iniciar sesión con Google');
      }
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      setEmailError('Error al conectar con Google: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };



  const handleLogin = async (e) => {
    e.preventDefault();
    setEmailError(""); // Clear errors on new attempt
    setPasswordError("");
    setIsLoading(true);

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

    if (hasError) {
      setIsLoading(false);
      return;
    }
  
    try {
      const response = await fetch(`${API_URL}/users/login`, {
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
        // More specific error message without revealing which credential is wrong (security)
        setEmailError(data.message || "El correo o la contraseña no coinciden");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setEmailError("Error al conectar con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <>
        <Header_Login />
        <div 
          className="relative flex justify-center sm:justify-end items-start sm:items-center min-h-screen pt-20 sm:pt-16 pb-4 sm:pb-0 px-4 sm:pr-8 lg:pr-16 xl:pr-24 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/bg_login.webp')" }}
        >
          {/* Overlay con opacidad y desenfoque */}
          <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm"></div>
          
          {/* Formulario sobre el overlay */}
          <div className="relative z-10 w-full max-w-lg max-h-[calc(100dvh-6rem)] overflow-y-auto p-5 sm:p-8 bg-opacity-90 rounded-xl shadow-lg text-center" style={{ backgroundColor: 'white' }}>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-600 mb-6 sm:mb-8">Inicia sesión en SpotApp</h2>
            <form onSubmit={handleLogin} className="flex flex-col gap-4 sm:gap-5">
              <div>
                <input
                  type="text"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mx-auto px-4 py-3 border border-gray-300 rounded text-base sm:text-lg bg-white text-gray-900 placeholder:text-gray-500"
                />
                {emailError && (
                  <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                    <span>{emailError}</span>
                  </div>
                )}
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full mx-auto px-4 py-3 border border-gray-300 rounded text-base sm:text-lg bg-white text-gray-900 placeholder:text-gray-500"
                />
                {passwordError && (
                  <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                    <span>{passwordError}</span>
                  </div>
                )}
              </div>
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full mx-auto px-4 py-3 bg-green-700 text-white rounded-3xl text-base sm:text-lg cursor-pointer transition-all duration-300 hover:bg-green-800 hover:scale-[1.02] hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Procesando...
                  </span>
                ) : (
                  "Iniciar Sesión"
                )}
              </button>  
              <button 
                type="button"
                onClick={handleForgotPassword}
                className="w-full mx-auto px-4 py-3 text-white rounded-3xl text-base sm:text-lg cursor-pointer transition-all duration-300 hover:brightness-90 hover:scale-[1.02] hover:shadow-lg" style={{ backgroundColor: '#4A90E2' }}
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
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full mx-auto px-4 py-3 text-gray-600 rounded-3xl text-base sm:text-lg cursor-pointer border border-gray-300 transition-all duration-300 hover:bg-gray-50 hover:border-gray-400 hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100" style={{ backgroundColor: 'white'}}
              >
                {isLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Procesando...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Iniciar sesión con Google
                  </>
                )}
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