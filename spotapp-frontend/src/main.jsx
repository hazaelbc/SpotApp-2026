// import { StrictMode } from "react";
// import { createRoot } from "react-dom/client";
// import { Provider } from "./components/ui/provider.jsx";
// import "./index.css";
// import App from "./App.jsx";
// import AcordeonInicio from "./componentes/acordeon-inicio/acordeon.jsx";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// createRoot(document.getElementById("root")).render(
//   <StrictMode>
//     <Provider>
//       <AcordeonInicio />
//     </Provider>
//   </StrictMode>
// );

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "./components/ui/provider.jsx";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider>
      <App />
    </Provider>
  </StrictMode>
);