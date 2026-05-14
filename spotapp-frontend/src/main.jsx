
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "./components/ui/provider.jsx";
import { ThemeProvider } from "./contexts/themeContext/index.jsx";
import "./index.css";
import App from "./App.jsx";

// Suppress noisy system warnings
const originalWarn = console.warn;
const originalLog = console.log;
console.warn = (...args) => {
  const msg = args[0]?.toString?.() || "";
  if (msg.includes("CoreLocationProvider") || msg.includes("kCLErrorLocationUnknown") || msg.includes("Geolocation error: 2")) {
    return;
  }
  originalWarn(...args);
};
console.log = (...args) => {
  const msg = args[0]?.toString?.() || "";
  if (msg.includes("CoreLocationProvider") || msg.includes("kCLErrorLocationUnknown")) {
    return;
  }
  originalLog(...args);
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <Provider>
        <App />
      </Provider>
    </ThemeProvider>
  </StrictMode>
);