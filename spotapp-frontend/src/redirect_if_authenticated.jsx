import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const RedirectIfAuthenticated = ({ children }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const authToken = localStorage.getItem("authToken");

  useEffect(() => {
    const validateToken = async () => {
      if (!authToken) {
        setIsValidating(false);
        return;
      }

      try {
        // Verifica que el token sea válido haciendo una petición al backend
        const response = await fetch("http://localhost:8080/users/validate", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${authToken}`,
          },
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          // Token inválido, lo eliminamos
          localStorage.removeItem("authToken");
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error token:", error);
        // En caso de error, eliminamos el token por seguridad
        localStorage.removeItem("authToken");
        setIsAuthenticated(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [authToken]);

  if (process.env.NODE_ENV === 'development') {
  console.log("[RedirectIfAuthenticated] Validando token...");
}

  if (isAuthenticated) {
    return <Navigate to="/lobby" replace />;
  }

  return children;
};

export default RedirectIfAuthenticated;