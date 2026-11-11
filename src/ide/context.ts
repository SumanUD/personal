import { createContext, useContext } from "react";

export type SidebarView = "explorer" | "search" | "git" | "extensions";

export type ThemeId = "dark-modern" | "light-modern" | "monokai" | "banik-purple" | "solarized-dark";

export const THEMES: { id: ThemeId; label: string }[] = [
  { id: "dark-modern", label: "Dark Modern" },
  { id: "light-modern", label: "Light Modern" },
  { id: "monokai", label: "Monokai" },
  { id: "solarized-dark", label: "Solarized Dark" },
  { id: "banik-purple", label: "Banik Purple" },
];

export type Toast = { id: number; kind: "info" | "error" | "success"; text: string };

export type Ide = {
  openPath: (path: string) => void;
  setCursor: (ln: number, col: number) => void;
  notify: (text: string, kind?: Toast["kind"]) => void;
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
  showSidebar: (v: SidebarView) => void;
  togglePanel: (open?: boolean) => void;
  openPalette: (prefix?: string) => void;
  runTerminal: (cmd: string) => void;
};

export const IdeContext = createContext<Ide | null>(null);

export const useIde = () => {
  const ctx = useContext(IdeContext);
  if (!ctx) throw new Error("useIde outside IdeContext");
  return ctx;
};
