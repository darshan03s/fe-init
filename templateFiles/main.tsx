import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "@/App";
import "@/index.css";
import { DarkModeProvider } from "@/features/dark-mode/DarkModeProvider";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <DarkModeProvider>
      <App />
    </DarkModeProvider>
  </BrowserRouter>
);
