import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// After a new deploy the cached index.html can point at chunk files that no
// longer exist ("Failed to fetch dynamically imported module" -> blank screen).
// Reload once to pick up the fresh manifest instead of showing an empty page.
const RELOAD_FLAG = "chunk-reload-at";
const handleChunkFailure = () => {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_FLAG) || 0);
    if (Date.now() - last < 10000) return; // avoid reload loops
    sessionStorage.setItem(RELOAD_FLAG, String(Date.now()));
  } catch {
    /* private mode */
  }
  window.location.reload();
};

window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  handleChunkFailure();
});

window.addEventListener("unhandledrejection", (event) => {
  const message = String((event.reason as Error)?.message || event.reason || "");
  if (message.includes("Failed to fetch dynamically imported module") || message.includes("error loading dynamically imported module")) {
    handleChunkFailure();
  }
});

createRoot(document.getElementById("root")!).render(<App />);
