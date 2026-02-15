import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const authToken = localStorage.getItem("authToken"); // Verifica si hay un token en localStorage

  if (!authToken) {
    // Si no está autenticado, redirige al inicio de sesión
    return <Navigate to="/" />;
  }

  // Si está autenticado, renderiza el componente hijo
  return children;
};

export default ProtectedRoute;