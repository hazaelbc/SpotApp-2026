import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header_Login from "../Header_Login";
import { signInWithGoogle } from "../../config/firebase";

const Registro = ({ onSubmit }) => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [nombreError, setNombreError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [terminosError, setTerminosError] = useState("");
  const navigate = useNavigate();

  // Validar formato de email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNombreError("");
    setEmailError("");
    setPasswordError("");
    setTerminosError("");

    let hasError = false;

    // Validar nombre
    if (!nombre.trim()) {
      setNombreError("El nombre es obligatorio");
      hasError = true;
    }

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
    } else if (password.length < 8) {
      setPasswordError("La contraseña debe tener al menos 8 caracteres");
      hasError = true;
    }

    // Validar términos
    if (!aceptaTerminos) {
      setTerminosError("Debes aceptar los términos y condiciones");
      hasError = true;
    }

    if (hasError) return;

    // Enviar datos al backend
    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre,
          email,
          contrasena: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Registro exitoso
        alert('¡Registro exitoso! Bienvenido ' + data.user.nombre);
        navigate('/'); // Redirigir a inicio de sesión
      } else {
        // Error del servidor
        if (response.status === 400 && data.message && data.message.includes('ya existe')) {
          setEmailError('Este correo ya está registrado. Por favor inicia sesión.');
        } else {
          setEmailError(data.message || 'Error al registrar usuario');
        }
      }
    } catch (error) {
      console.error('Error al registrar:', error);
      setEmailError('Error de conexión con el servidor');
    }
  };

  const handleGoogleSignup = async () => {
    console.log('Iniciando registro con Google...');
    try {
      // Autenticar con Google usando Firebase
      console.log('Llamando a signInWithGoogle...');
      const user = await signInWithGoogle();
      console.log('Usuario de Google obtenido:', user);
      
      // Enviar los datos al backend para crear o autenticar el usuario
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
        alert('¡Registro exitoso con Google! Bienvenido ' + data.user.nombre);
        navigate('/lobby');
      } else {
        // Si el usuario ya existe
        if (data.message && data.message.includes('ya existe')) {
          // Usuario ya registrado, redirigir a login
          alert('Este correo ya está registrado. Redirigiendo a inicio de sesión...');
          navigate('/'); // Redirigir a login
        } else {
          setEmailError(data.message || 'Error al registrar con Google');
        }
      }
    } catch (error) {
      console.error('Error completo al registrarse con Google:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      setEmailError('Error al conectar con Google: ' + error.message);
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
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-600 mb-6 sm:mb-8">Regístrate en SpotApp</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
        <div>
          <input
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full mx-auto px-4 py-3 border border-gray-300 rounded text-base sm:text-lg bg-white text-gray-900 placeholder:text-gray-500"
          />
          {nombreError && <p className="text-red-600 text-xs mt-1 text-left">{nombreError}</p>}
        </div>

        <div>
          <input
            type="text"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mx-auto px-4 py-3 border border-gray-300 rounded text-base sm:text-lg bg-white text-gray-900 placeholder:text-gray-500"
          />
          {emailError && <p className="text-red-600 text-xs mt-1 text-left">{emailError}</p>}
        </div>

        <div>
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mx-auto px-4 py-3 border border-gray-300 rounded text-base sm:text-lg bg-white text-gray-900 placeholder:text-gray-500"
          />
          {passwordError && <p className="text-red-600 text-xs mt-1 text-left">{passwordError}</p>}
        </div>

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="terminos"
            checked={aceptaTerminos}
            onChange={(e) => setAceptaTerminos(e.target.checked)}
            className="mt-1 w-4 h-4 cursor-pointer"
          />
          <label htmlFor="terminos" className="text-sm text-gray-600 text-left cursor-pointer">
            Acepto los{" "}
            <a href="#" className="text-blue-700 hover:text-blue-900 underline">
              términos y condiciones
            </a>
          </label>
        </div>
        {terminosError && <p className="text-red-600 text-xs text-left -mt-3">{terminosError}</p>}

        <button 
          type="submit"
          className="w-full mx-auto px-4 py-3 bg-green-700 text-white rounded-3xl text-base sm:text-lg cursor-pointer transition-all duration-300 hover:bg-green-800 hover:scale-[1.02] hover:shadow-lg"
        >
          Siguiente
        </button>

        {/* División con "o" */}
        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="text-gray-500 font-medium">o</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Inicio de sesión con Google */}
        <button 
          type="button"
          onClick={handleGoogleSignup}
          className="w-full mx-auto px-4 py-3 text-gray-600 rounded-3xl text-base sm:text-lg cursor-pointer border border-gray-300 transition-all duration-300 hover:bg-gray-50 hover:border-gray-400 hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-3"
          style={{ backgroundColor: 'white' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Registrarse con Google
        </button>

        {/* Link a inicio de sesión */}
        <a 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
          className="text-blue-700 hover:text-blue-900 text-sm underline font-medium"
        >
          ¿Ya tienes cuenta? Inicia sesión
        </a>
      </form>
      </div>
    </div>
    </>
  );
};

export default Registro;