import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  VscAccount, VscBell, VscCheck, VscChromeClose, VscChromeMaximize, VscChromeMinimize, VscClose,
  VscError, VscExtensions, VscFiles, VscInfo, VscLayoutPanel, VscLayoutSidebarLeft, VscMail,
  VscMenu, VscOpenPreview, VscRemoteExplorer, VscSearch, VscSettingsGear, VscSourceControl,
  VscWarning, VscChevronRight, VscCode, VscRocket, VscTrash,
} from "react-icons/vsc";
import { FaWhatsapp } from "react-icons/fa6";
import { config } from "../config";
import { FILES, IdeFile, LANG_LABEL, REDIRECTS, fileById, fileByPath } from "./files";
import { FileIcon } from "./FileIcon";
import { Ide, IdeContext, SidebarView, THEMES, ThemeId, Toast } from "./context";
import Sidebar from "./Sidebar";
import Terminal, { TerminalHandle } from "./Terminal";
import CommandPalette, { Command } from "./CommandPalette";
import CodeView from "./views/CodeView";
import Welcome from "./views/Welcome";
import { AboutPreview, ProjectPreview, ProjectsPreview } from "./views/Previews";
import { ContactView, StartView } from "./views/Forms";

const store = {
  get(k: string) {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set(k: string, v: string) {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* ignore */
    }
  },
};

const useMedia = (q: string) => {
  const [m, setM] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setM(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [q]);
  return m;
};

type MenuItem = { label: string; keys?: string; run: () => void } | "sep";

const Workbench = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMedia("(max-width: 768px)");

  const [theme, setThemeState] = useState<ThemeId>(() => {
    const t = store.get("ide-theme") as ThemeId | null;
    return t && THEMES.some((x) => x.id === t) ? t : "dark-modern";
  });
  const [sidebar, setSidebar] = useState<SidebarView | null>(() => (window.innerWidth > 768 ? "explorer" : null));
  const [sidebarW, setSidebarW] = useState(260);
  const [panelOpen, setPanelOpen] = useState(() => window.innerWidth > 768 && window.innerHeight > 640);
  const [panelH, setPanelH] = useState(180);
  const [panelTab, setPanelTab] = useState<"problems" | "output" | "terminal">("terminal");
  const [palette, setPalette] = useState<string | null>(null);
  const [menu, setMenu] = useState<string | null>(null);
  const [tabs, setTabs] = useState<string[]>(() => {
    const f = fileByPath(location.pathname);
    return f && f.id !== "welcome" ? ["welcome", f.id] : ["welcome"];
  });
  const [preview, setPreview] = useState<Record<string, boolean>>({});
  const [cursor, setCursorState] = useState({ ln: 1, col: 1 });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const termRef = useRef<TerminalHandle>(null);

  const current = fileByPath(location.pathname);
  const activeId = tabs.length && current && tabs.includes(current.id) ? current.id : null;
  const active = activeId ? fileById(activeId)! : null;

  /* ── routing ─────────────────────────────────────────── */
  useEffect(() => {
    const redirect = REDIRECTS[location.pathname.replace(/\/+$/, "")];
    if (redirect) return void navigate(redirect, { replace: true });
    const f = fileByPath(location.pathname);
    if (!f) return void navigate("/", { replace: true });
    setTabs((t) => (t.includes(f.id) ? t : [...t, f.id]));
    setCursorState({ ln: 1, col: 1 });
    document.title = f.title;
  }, [location.pathname, navigate]);

  const openPath = useCallback(
    (path: string) => {
      const f = fileByPath(path);
      if (!f) return;
      setTabs((t) => (t.includes(f.id) ? t : [...t, f.id]));
      if (location.pathname !== f.path) navigate(f.path);
      if (isMobile) setSidebar(null);
    },
    [navigate, location.pathname, isMobile]
  );

  const closeTab = (id: string) => {
    const i = tabs.indexOf(id);
    const next = tabs.filter((x) => x !== id);
    setTabs(next);
    if (id === activeId && next.length) navigate(fileById(next[Math.min(i, next.length - 1)])!.path);
  };

  /* ── theme ───────────────────────────────────────────── */
  const setTheme = useCallback((t: ThemeId) => {
    setThemeState(t);
    store.set("ide-theme", t);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.ideTheme = theme;
    const bg = getComputedStyle(document.documentElement).getPropertyValue("--titlebar-bg").trim();
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", bg || "#1f1f1f");
  }, [theme]);

  /* ── panel / sidebar ─────────────────────────────────── */
  const togglePanel = useCallback((open?: boolean) => {
    setPanelOpen((p) => {
      const n = open ?? !p;
      if (n) {
        setPanelTab("terminal");
        setTimeout(() => termRef.current?.focus(), 30);
      }
      return n;
    });
  }, []);

  const showSidebar = useCallback((v: SidebarView) => setSidebar((s) => (s === v ? null : v)), []);

  const notify = useCallback((text: string, kind: Toast["kind"] = "info") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 6000);
  }, []);

  const runTerminal = useCallback((cmd: string) => {
    setPanelOpen(true);
    setPanelTab("terminal");
    setTimeout(() => {
      termRef.current?.run(cmd);
      termRef.current?.focus();
    }, 30);
  }, []);

  const ide: Ide = useMemo(
    () => ({
      openPath,
      setCursor: (ln, col) => setCursorState({ ln, col }),
      notify,
      theme,
      setTheme,
      showSidebar: (v) => setSidebar(v),
      togglePanel,
      openPalette: (p = "") => setPalette(p),
      runTerminal,
    }),
    [openPath, notify, theme, setTheme, togglePanel, runTerminal]
  );

  /* ── commands ────────────────────────────────────────── */
  const commands: Command[] = useMemo(
    () => [
      { id: "terminal", label: "View: Toggle Terminal", keys: "Ctrl+`", run: () => togglePanel() },
      { id: "sidebar", label: "View: Toggle Primary Side Bar", keys: "Ctrl+B", run: () => setSidebar((s) => (s ? null : "explorer")) },
      { id: "explorer", label: "View: Show Explorer", keys: "Ctrl+Shift+E", run: () => setSidebar("explorer") },
      { id: "search", label: "View: Show Search", keys: "Ctrl+Shift+F", run: () => setSidebar("search") },
      { id: "git", label: "View: Show Source Control (Career)", keys: "Ctrl+Shift+G", run: () => setSidebar("git") },
      { id: "ext", label: "View: Show Extensions (Skills)", keys: "Ctrl+Shift+X", run: () => setSidebar("extensions") },
      ...THEMES.map((t) => ({ id: `theme-${t.id}`, label: `Preferences: Color Theme: ${t.label}`, run: () => setTheme(t.id) })),
      { id: "hire", label: "Suman: Start a Project", run: () => openPath("/start") },
      { id: "contact", label: "Suman: Open Contact Form", run: () => openPath("/contact") },
      { id: "wa", label: "Suman: Chat on WhatsApp", run: () => window.open(config.whatsapp.link(), "_blank", "noopener") },
      { id: "mail", label: "Suman: Send Email", run: () => (window.location.href = `mailto:${config.contact.email}`) },
      { id: "help", label: "Help: Show Terminal Commands", run: () => runTerminal("help") },
      { id: "close-all", label: "View: Close All Editors", run: () => setTabs([]) },
    ],
    [togglePanel, setTheme, openPath, runTerminal]
  );

  /* ── keyboard shortcuts ──────────────────────────────── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      const k = e.key.toLowerCase();
      if (e.key === "F1" || (mod && e.shiftKey && k === "p")) {
        e.preventDefault();
        setPalette(">");
      } else if (mod && !e.shiftKey && k === "p") {
        e.preventDefault();
        setPalette("");
      } else if (mod && (e.key === "`" || e.code === "Backquote" || k === "j")) {
        e.preventDefault();
        togglePanel();
      } else if (mod && !e.shiftKey && k === "b") {
        e.preventDefault();
        setSidebar((s) => (s ? null : "explorer"));
      } else if (mod && e.shiftKey && ["e", "f", "g", "x"].includes(k)) {
        e.preventDefault();
        setSidebar(({ e: "explorer", f: "search", g: "git", x: "extensions" } as const)[k as "e"]);
      } else if (e.key === "Escape") {
        setMenu(null);
        if (isMobile) setSidebar(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePanel, isMobile]);

  /* ── resize sashes ───────────────────────────────────── */
  const drag = (axis: "x" | "y") => (e: React.PointerEvent) => {
    e.preventDefault();
    const start = axis === "x" ? e.clientX : e.clientY;
    const init = axis === "x" ? sidebarW : panelH;
    const move = (ev: PointerEvent) => {
      if (axis === "x") setSidebarW(Math.min(520, Math.max(170, init + ev.clientX - start)));
      else setPanelH(Math.min(window.innerHeight - 200, Math.max(100, init - (ev.clientY - start))));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      document.body.classList.remove("is-resizing");
    };
    document.body.classList.add("is-resizing");
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  /* ── menus ───────────────────────────────────────────── */
  const MENUS: Record<string, MenuItem[]> = {
    File: [
      { label: "Go to File…", keys: "Ctrl+P", run: () => setPalette("") },
      { label: "Open Welcome", run: () => openPath("/") },
      "sep",
      { label: "New Project with Suman…", run: () => openPath("/start") },
      { label: "Close All Editors", run: () => setTabs([]) },
    ],
    View: [
      { label: "Command Palette…", keys: "Ctrl+Shift+P", run: () => setPalette(">") },
      "sep",
      { label: "Explorer", keys: "Ctrl+Shift+E", run: () => setSidebar("explorer") },
      { label: "Search", keys: "Ctrl+Shift+F", run: () => setSidebar("search") },
      { label: "Source Control", keys: "Ctrl+Shift+G", run: () => setSidebar("git") },
      { label: "Extensions", keys: "Ctrl+Shift+X", run: () => setSidebar("extensions") },
      "sep",
      { label: "Terminal", keys: "Ctrl+`", run: () => togglePanel(true) },
      { label: "Color Theme…", run: () => setPalette(">Color Theme") },
    ],
    Go: [
      { label: "About", run: () => openPath("/about") },
      { label: "Experience", run: () => openPath("/experience") },
      { label: "Skills", run: () => openPath("/skills") },
      { label: "Projects", run: () => openPath("/projects") },
      { label: "Contact", run: () => openPath("/contact") },
    ],
    Terminal: [
      { label: "New Terminal", keys: "Ctrl+`", run: () => togglePanel(true) },
      { label: "Run 'help'", run: () => runTerminal("help") },
      { label: "Run 'projects'", run: () => runTerminal("projects") },
    ],
    Help: [
      { label: "Show All Commands", keys: "Ctrl+Shift+P", run: () => setPalette(">") },
      { label: "Terminal Commands", run: () => runTerminal("help") },
      "sep",
      { label: "Chat on WhatsApp", run: () => window.open(config.whatsapp.link(), "_blank", "noopener") },
      { label: "About Suman", run: () => openPath("/about") },
    ],
  };

  /* ── editor content ──────────────────────────────────── */
  const isPreview = (f: IdeFile) => (f.previewable ? preview[f.id] ?? !!f.defaultPreview : false);

  const renderEditor = (f: IdeFile) => {
    if (f.previewable && !isPreview(f)) return <CodeView key={f.id} text={f.source} lang={f.lang} />;
    switch (f.view) {
      case "welcome":
        return <Welcome />;
      case "about":
        return <AboutPreview />;
      case "projects":
        return <ProjectsPreview />;
      case "project":
        return <ProjectPreview projectId={f.projectId!} />;
      case "contact":
        return <ContactView />;
      case "start":
        return <StartView />;
      default:
        return <CodeView key={f.id} text={f.source} lang={f.lang} />;
    }
  };

  const activity: { id: SidebarView; icon: JSX.Element; label: string; badge?: number }[] = [
    { id: "explorer", icon: <VscFiles />, label: "Explorer (Ctrl+Shift+E)" },
    { id: "search", icon: <VscSearch />, label: "Search (Ctrl+Shift+F)" },
    { id: "git", icon: <VscSourceControl />, label: "Source Control: career history", badge: config.experiences.length },
    { id: "extensions", icon: <VscExtensions />, label: "Extensions: skills" },
  ];

  return (
    <IdeContext.Provider value={ide}>
      <div className={`workbench${isMobile ? " is-mobile" : ""}`} onClick={() => menu && setMenu(null)}>
        {/* Title bar */}
        <header className="titlebar">
          <div className="tb-left">
            <button className="tb-logo" onClick={() => openPath("/")} aria-label="Welcome">
              SB
            </button>
            {isMobile ? (
              <button className="tb-menu-btn" aria-label="Menu" onClick={(e) => { e.stopPropagation(); setMenu(menu ? null : "View"); }}>
                <VscMenu />
              </button>
            ) : (
              <nav className="tb-menus">
                {Object.keys(MENUS).map((m) => (
                  <button
                    key={m}
                    className={menu === m ? "is-open" : ""}
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenu(menu === m ? null : m);
                    }}
                    onMouseEnter={() => menu && setMenu(m)}
                  >
                    {m}
                  </button>
                ))}
              </nav>
            )}
            {menu && (
              <div className={`menu-dropdown menu-${menu}`} onClick={(e) => e.stopPropagation()}>
                {MENUS[menu].map((it, i) =>
                  it === "sep" ? (
                    <hr key={i} />
                  ) : (
                    <button
                      key={it.label}
                      onClick={() => {
                        setMenu(null);
                        it.run();
                      }}
                    >
                      <span>{it.label}</span>
                      {it.keys && <kbd>{it.keys}</kbd>}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
          <button className="tb-center" onClick={() => setPalette("")}>
            <VscSearch /> <span>suman-banik</span>
          </button>
          <div className="tb-right">
            <button className="tb-icon" aria-label="Toggle sidebar" onClick={() => setSidebar((s) => (s ? null : "explorer"))}>
              <VscLayoutSidebarLeft />
            </button>
            <button className="tb-icon" aria-label="Toggle panel" onClick={() => togglePanel()}>
              <VscLayoutPanel />
            </button>
            <span className="tb-win" aria-hidden>
              <VscChromeMinimize />
              <VscChromeMaximize />
              <VscChromeClose />
            </span>
          </div>
        </header>

        <div className="main">
          {/* Activity bar */}
          <nav className="activitybar" aria-label="Views">
            {activity.map((a) => (
              <button
                key={a.id}
                className={sidebar === a.id ? "is-active" : ""}
                title={a.label}
                aria-label={a.label}
                onClick={() => showSidebar(a.id)}
              >
                {a.icon}
                {a.badge ? <span className="ab-badge">{a.badge}</span> : null}
              </button>
            ))}
            <button title="Contact" aria-label="Contact" className={activeId === "contact" ? "is-current" : ""} onClick={() => openPath("/contact")}>
              <VscMail />
            </button>
            <button title="Start a project" aria-label="Start a project" className={activeId === "start" ? "is-current" : ""} onClick={() => openPath("/start")}>
              <VscRocket />
            </button>
            <div className="ab-spacer" />
            <button title="About Suman" aria-label="About" onClick={() => openPath("/about")}>
              <VscAccount />
            </button>
            <button title="Color theme" aria-label="Color theme" onClick={() => setPalette(">Color Theme")}>
              <VscSettingsGear />
            </button>
          </nav>

          {/* Sidebar */}
          {sidebar && (
            <>
              {isMobile && <div className="sb-backdrop" onClick={() => setSidebar(null)} />}
              <div className="sidebar-wrap" style={isMobile ? undefined : { width: sidebarW }}>
                <Sidebar
                  view={sidebar}
                  activeId={activeId}
                  tabs={tabs}
                  onOpen={(f) => openPath(f.path)}
                  onCloseTab={closeTab}
                />
                {!isMobile && <div className="sash sash-x" onPointerDown={drag("x")} />}
              </div>
            </>
          )}

          {/* Editor + panel */}
          <div className="editor-area">
            <div className="editor-group">
              {tabs.length > 0 && (
                <div className="tabs-row">
                  <div className="tabs scroll-x" role="tablist">
                    {tabs.map((id) => {
                      const f = fileById(id)!;
                      return (
                        <div
                          key={id}
                          role="tab"
                          aria-selected={id === activeId}
                          className={`tab${id === activeId ? " is-active" : ""}`}
                          onClick={() => openPath(f.path)}
                          onMouseDown={(e) => {
                            if (e.button === 1) {
                              e.preventDefault();
                              closeTab(id);
                            }
                          }}
                          ref={(el) => {
                            if (el && id === activeId) el.scrollIntoView({ block: "nearest", inline: "nearest" });
                          }}
                        >
                          <FileIcon file={f} />
                          <span className="tab-name">
                            {f.previewable && isPreview(f) && f.view !== "projects" && f.view !== "project" ? `Preview ${f.name}` : f.name}
                          </span>
                          <button
                            className="tab-close"
                            aria-label={`Close ${f.name}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              closeTab(id);
                            }}
                          >
                            <VscClose />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  {active?.previewable && (
                    <div className="editor-actions">
                      <button
                        title={isPreview(active) ? "Show source" : "Open preview"}
                        aria-label={isPreview(active) ? "Show source" : "Open preview"}
                        onClick={() => setPreview((p) => ({ ...p, [active.id]: !isPreview(active) }))}
                      >
                        {isPreview(active) ? <VscCode /> : <VscOpenPreview />}
                      </button>
                    </div>
                  )}
                </div>
              )}
              {active && active.id !== "welcome" && (
                <div className="breadcrumbs">
                  <span>suman-banik</span>
                  {active.folder && (
                    <>
                      <VscChevronRight />
                      <span>{active.folder}</span>
                    </>
                  )}
                  <VscChevronRight />
                  <FileIcon file={active} />
                  <span>{active.name}</span>
                </div>
              )}
              <div className="editor">
                {active ? (
                  renderEditor(active)
                ) : (
                  <div className="watermark">
                    <div className="wm-logo">SB</div>
                    <dl>
                      <dt>Show All Commands</dt>
                      <dd><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd></dd>
                      <dt>Go to File</dt>
                      <dd><kbd>Ctrl</kbd>+<kbd>P</kbd></dd>
                      <dt>Toggle Terminal</dt>
                      <dd><kbd>Ctrl</kbd>+<kbd>`</kbd></dd>
                      <dt>Open Welcome</dt>
                      <dd><button className="link" onClick={() => openPath("/")}>Welcome</button></dd>
                    </dl>
                  </div>
                )}
              </div>
            </div>

            {/* Panel */}
            <section className="panel" style={{ height: panelH, display: panelOpen ? undefined : "none" }} aria-label="Panel">
              {!isMobile && <div className="sash sash-y" onPointerDown={drag("y")} />}
              <div className="panel-tabs">
                {(["problems", "output", "terminal"] as const).map((t) => (
                  <button key={t} className={panelTab === t ? "is-active" : ""} onClick={() => setPanelTab(t)}>
                    {t}
                    {t === "problems" && <span className="badge">0</span>}
                  </button>
                ))}
                <div className="panel-actions">
                  <button aria-label="Clear terminal" title="Clear" onClick={() => termRef.current?.run("clear")}>
                    <VscTrash />
                  </button>
                  <button aria-label="Close panel" title="Close" onClick={() => setPanelOpen(false)}>
                    <VscClose />
                  </button>
                </div>
              </div>
              <div className="panel-body">
                <div style={{ display: panelTab === "terminal" ? "contents" : "none" }}>
                  <Terminal ref={termRef} />
                </div>
                {panelTab === "problems" && (
                  <div className="panel-msg">
                    No problems have been detected in the workspace. Shipping clean code since 2019.
                  </div>
                )}
                {panelTab === "output" && (
                  <div className="panel-msg mono">
                    [info] Workspace “suman-banik” loaded: {FILES.length} files<br />
                    [info] Status: available for new projects<br />
                    [info] Average reply time: under 24 hours
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Status bar */}
        <footer className="statusbar">
          <div className="st-left">
            <button className="st-remote" title="Open project planner" onClick={() => openPath("/start")}>
              <VscRemoteExplorer /> <span className="hide-sm">Hire me</span>
            </button>
            <button title="Source control" onClick={() => setSidebar("git")}>
              <VscSourceControl /> main
            </button>
            <button className="hide-sm" title="No problems" onClick={() => { togglePanel(true); setPanelTab("problems"); }}>
              <VscError /> 0 <VscWarning /> 0 <VscInfo /> 0
            </button>
          </div>
          <div className="st-right">
            <span className="st-avail">
              <span className="dot" /> Available for work
            </span>
            {active && (active.view === "code" || (active.previewable && !isPreview(active))) ? (
              <span className="hide-sm">
                Ln {cursor.ln}, Col {cursor.col}
              </span>
            ) : null}
            <span className="hide-sm">UTF-8</span>
            {active && <span className="hide-sm">{LANG_LABEL[active.lang]}</span>}
            <a href={config.whatsapp.link()} target="_blank" rel="noreferrer" title="Chat on WhatsApp">
              <FaWhatsapp /> <span className="hide-sm">WhatsApp</span>
            </a>
            <button title="Notifications" aria-label="Notifications" onClick={() => notify("You're all caught up. Want to start a project? Run `hire` in the terminal.")}>
              <VscBell />
            </button>
          </div>
        </footer>

        {palette !== null && (
          <CommandPalette initial={palette} commands={commands} onOpenPath={openPath} onClose={() => setPalette(null)} />
        )}

        <div className="toasts" aria-live="polite">
          {toasts.map((t) => (
            <div key={t.id} className={`toast toast-${t.kind}`}>
              {t.kind === "error" ? <VscError /> : t.kind === "success" ? <VscCheck /> : <VscInfo />}
              <span>{t.text}</span>
              <button aria-label="Dismiss" onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))}>
                <VscClose />
              </button>
            </div>
          ))}
        </div>
      </div>
    </IdeContext.Provider>
  );
};

export default Workbench;
