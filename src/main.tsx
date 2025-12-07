import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import App from "./App.tsx";
import "./index.css";
import { LocaleProvider } from "./contexts/LocaleContext";

createRoot(document.getElementById("root")!).render(
  <LocaleProvider defaultLocale={"ar"}>
    <ThemeProvider attribute="class" defaultTheme="system">
      <App />
    </ThemeProvider>
  </LocaleProvider>
);
