import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AcordeonInicio from "./componentes/acordeon-inicio/acordeon.jsx";
import Registro from "./componentes/acordeon-inicio/registro.jsx";
import Lobby from "./pantallas/lobby/index.jsx";
import ProtectedRoute from "./protected_route.jsx";
import RedirectIfAuthenticated from "./redirect_if_authenticated.jsx";
import SobreNosotros from "./pantallas/sobre_nosotros";
import { UserProvider } from "./userProvider.jsx";

const App = () => {
  return (
    <UserProvider>
      <Router>
        <main className="main-content">
          <div className="site-container">
            <Routes>
          {/* Redirige al lobby si el usuario ya está autenticado */}
          <Route
            path="/"
            element={
              <RedirectIfAuthenticated>
                <AcordeonInicio />
              </RedirectIfAuthenticated>
            }
          />
          <Route
            path="/registro"
            element={
              <RedirectIfAuthenticated>
                <Registro />
              </RedirectIfAuthenticated>
            }
          />
          {/* Protege el acceso al lobby */}
          <Route
            path="/lobby"
            element={
              <ProtectedRoute>
                <Lobby />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sobre-nosotros"
            element={
              <RedirectIfAuthenticated>
                <SobreNosotros />
              </RedirectIfAuthenticated>
            }
          />
            </Routes>
          </div>
        </main>
      </Router>
    </UserProvider>
  );
};

//pruebam
export default App;