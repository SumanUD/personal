import { useMemo, useState } from "react";
import { VscChevronDown, VscChevronRight, VscClose, VscEllipsis, VscSend } from "react-icons/vsc";
import { config } from "../config";
import { FILES, IdeFile, fileById } from "./files";
import { FileIcon, FolderIcon } from "./FileIcon";
import type { SidebarView } from "./context";

type Props = {
  view: SidebarView;
  activeId: string | null;
  tabs: string[];
  onOpen: (f: IdeFile) => void;
  onCloseTab: (id: string) => void;
};

const Section = ({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`sb-section${open ? " is-open" : ""}`}>
      <button className="sb-section-head" onClick={() => setOpen(!open)} aria-expanded={open}>
        {open ? <VscChevronDown /> : <VscChevronRight />}
        {title}
      </button>
      {open && <div className="sb-section-body">{children}</div>}
    </div>
  );
};

const Explorer = ({ activeId, tabs, onOpen, onCloseTab }: Omit<Props, "view">) => {
  const [projectsOpen, setProjectsOpen] = useState(true);
  const root = FILES.filter((f) => !f.folder && f.id !== "welcome");
  const projectFiles = FILES.filter((f) => f.folder === "projects");

  const item = (f: IdeFile, depth: number) => (
    <button
      key={f.id}
      className={`tree-item${activeId === f.id ? " is-active" : ""}`}
      style={{ paddingLeft: 8 + depth * 16 }}
      onClick={() => onOpen(f)}
    >
      <FileIcon file={f} />
      <span>{f.name}</span>
    </button>
  );

  return (
    <>
      <Section title="Open Editors" defaultOpen={false}>
        {tabs.map((id) => {
          const f = fileById(id)!;
          return (
            <div key={id} className={`tree-item oe-item${activeId === id ? " is-active" : ""}`}>
              <button className="oe-close" onClick={() => onCloseTab(id)} aria-label={`Close ${f.name}`}>
                <VscClose />
              </button>
              <button className="oe-open" onClick={() => onOpen(f)}>
                <FileIcon file={f} />
                <span>{f.name}</span>
                {f.folder && <span className="dim">{f.folder}</span>}
              </button>
            </div>
          );
        })}
        {!tabs.length && <p className="sb-empty">No open editors</p>}
      </Section>
      <Section title="suman-banik">
        <button className="tree-item" style={{ paddingLeft: 8 }} onClick={() => setProjectsOpen(!projectsOpen)}>
          {projectsOpen ? <VscChevronDown className="tw" /> : <VscChevronRight className="tw" />}
          <FolderIcon open={projectsOpen} />
          <span>projects</span>
        </button>
        {projectsOpen && <div className="tree-group">{projectFiles.map((f) => item(f, 1.5))}</div>}
        {root.map((f) => item(f, 1))}
      </Section>
    </>
  );
};

const Search = ({ onOpen }: { onOpen: (f: IdeFile) => void }) => {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return FILES.map((f) => ({
      f,
      hits: f.source
        .split("\n")
        .filter((l) => l.toLowerCase().includes(q))
        .slice(0, 6),
    })).filter((r) => r.hits.length || r.f.name.toLowerCase().includes(q));
  }, [query]);

  const mark = (line: string) => {
    const q = query.trim();
    const i = line.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return line;
    const start = Math.max(0, i - 24);
    return (
      <>
        {start > 0 && "…"}
        {line.slice(start, i).trimStart()}
        <mark>{line.slice(i, i + q.length)}</mark>
        {line.slice(i + q.length, i + q.length + 60)}
      </>
    );
  };

  const total = results.reduce((n, r) => n + r.hits.length, 0);

  return (
    <div className="sb-pad">
      <input
        className="sb-input"
        autoFocus
        placeholder="Search (try Shopify, React, AI)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query.trim().length >= 2 && (
        <p className="sb-meta">
          {total} result{total === 1 ? "" : "s"} in {results.length} file{results.length === 1 ? "" : "s"}
        </p>
      )}
      <div className="search-results">
        {results.map(({ f, hits }) => (
          <div key={f.id} className="sr-file">
            <button className="sr-head" onClick={() => onOpen(f)}>
              <FileIcon file={f} />
              <span>{f.name}</span>
              {f.folder && <span className="dim">{f.folder}</span>}
              <span className="badge">{hits.length}</span>
            </button>
            {hits.map((h, i) => (
              <button key={i} className="sr-hit" onClick={() => onOpen(f)}>
                {mark(h.trim())}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const SourceControl = ({ onOpen }: { onOpen: (f: IdeFile) => void }) => {
  const [msg, setMsg] = useState("");
  const send = () => {
    window.open(config.whatsapp.link(msg.trim() || undefined), "_blank", "noopener");
    setMsg("");
  };
  return (
    <div className="sb-pad">
      <textarea
        className="sb-input sb-commit"
        rows={3}
        placeholder="Message Suman (Ctrl+Enter to send via WhatsApp)"
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) send();
        }}
      />
      <button className="btn btn-block" onClick={send}>
        <VscSend /> Send message
      </button>
      <h3 className="sb-subhead">Commits · career history</h3>
      <ol className="git-graph">
        {config.experiences.map((e, i) => (
          <li key={e.position}>
            <button onClick={() => onOpen(fileById("experience")!)}>
              <span className={`gg-dot${i === 0 ? " is-head" : ""}`} />
              <span className="gg-body">
                <strong>{e.position}</strong>
                <span>
                  {e.company} · {e.location}
                </span>
                {i === 0 && <span className="gg-tag">HEAD → main</span>}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
};

const Extensions = ({ onOpen }: { onOpen: (f: IdeFile) => void }) => {
  const [q, setQ] = useState("");
  const groups = [config.skills.develop, config.skills.design];
  const colors = ["#3b82f6", "#22c55e", "#eab308", "#ec4899", "#8b5cf6", "#06b6d4", "#f97316", "#ef4444"];
  return (
    <div className="sb-pad">
      <input className="sb-input" placeholder="Search skills" value={q} onChange={(e) => setQ(e.target.value)} />
      {groups.map((g) => {
        const tools = g.tools.filter((t) => t.toLowerCase().includes(q.toLowerCase()));
        if (!tools.length) return null;
        return (
          <div key={g.title}>
            <h3 className="sb-subhead">
              Installed · {g.title.toLowerCase()} <span className="badge">{tools.length}</span>
            </h3>
            {tools.map((t, i) => (
              <button key={t} className="ext" onClick={() => onOpen(fileById("skills")!)}>
                <span className="ext-icon" style={{ background: colors[(i + g.title.length) % colors.length] }}>
                  {t.replace(/[^A-Za-z0-9]/g, "").slice(0, 2)}
                </span>
                <span className="ext-body">
                  <strong>{t}</strong>
                  <span>{g.description}</span>
                  <span className="ext-pub">{config.developer.fullName}</span>
                </span>
              </button>
            ))}
          </div>
        );
      })}
    </div>
  );
};

const TITLES: Record<SidebarView, string> = {
  explorer: "Explorer",
  search: "Search",
  git: "Source Control",
  extensions: "Extensions",
};

const Sidebar = (props: Props) => {

  return (
    <aside className="sidebar" aria-label={TITLES[props.view]}>
      <div className="sb-title">
        <span>{TITLES[props.view]}</span>
        <VscEllipsis aria-hidden />
      </div>
      <div className="sb-content scroll">
        {props.view === "explorer" && <Explorer {...props} />}
        {props.view === "search" && <Search onOpen={props.onOpen} />}
        {props.view === "git" && <SourceControl onOpen={props.onOpen} />}
        {props.view === "extensions" && <Extensions onOpen={props.onOpen} />}
      </div>
    </aside>
  );
};

export default Sidebar;
