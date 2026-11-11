import { forwardRef, KeyboardEvent, ReactNode, useEffect, useImperativeHandle, useRef, useState } from "react";
import { config } from "../config";
import { FILES } from "./files";
import { THEMES, ThemeId, useIde } from "./context";

type Line = { id: number; node: ReactNode };
export type TerminalHandle = { run: (cmd: string) => void; focus: () => void };

const PROMPT = (
  <span className="t-prompt">
    <span className="t-user">suman@portfolio</span>:<span className="t-path">~</span>$
  </span>
);

const COMMANDS: [string, string][] = [
  ["help", "List available commands"],
  ["about", "Who I am"],
  ["skills", "What I work with"],
  ["experience", "Career history"],
  ["projects", "List projects"],
  ["open <file>", "Open a file, e.g. open about.md"],
  ["ls", "List workspace files"],
  ["contact", "Ways to reach me"],
  ["whatsapp", "Chat with me on WhatsApp"],
  ["email", "Write me an email"],
  ["hire", "Plan a project with me"],
  ["theme <name>", "Change color theme"],
  ["clear", "Clear the terminal"],
];

let uid = 0;

const Terminal = forwardRef<TerminalHandle>((_, ref) => {
  const ide = useIde();
  const [lines, setLines] = useState<Line[]>(() => [
    {
      id: uid++,
      node: (
        <span className="t-dim">
          Welcome to {config.developer.fullName}'s portfolio. Type <b className="t-cmd">help</b> to get started, or
          click files in the explorer.
        </span>
      ),
    },
  ]);
  const [input, setInput] = useState("");
  const [hist, setHist] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [lines]);

  const print = (...nodes: ReactNode[]) =>
    setLines((l) => [...l, ...nodes.map((node) => ({ id: uid++, node }))]);

  const exec = (raw: string) => {
    const cmd = raw.trim();
    const echo = (
      <>
        {PROMPT} <span>{cmd}</span>
      </>
    );
    if (!cmd) return print(echo);
    const [name, ...args] = cmd.split(/\s+/);
    const arg = args.join(" ");
    const out: ReactNode[] = [];
    const { developer, about, skills, experiences, projects, contact, whatsapp } = config;

    switch (name.toLowerCase()) {
      case "help":
        out.push(
          <div className="t-table">
            {COMMANDS.map(([c, d]) => (
              <div key={c}>
                <span className="t-cmd">{c}</span>
                <span className="t-dim">{d}</span>
              </div>
            ))}
          </div>
        );
        break;
      case "about":
      case "whoami":
        out.push(
          <span>
            <b className="t-accent">{developer.fullName}</b> · {developer.title}
          </span>,
          <span className="t-dim">{about.description}</span>
        );
        break;
      case "skills":
        out.push(
          <span>
            <span className="t-accent">shopify</span> {skills.develop.tools.join(" · ")}
          </span>,
          <span>
            <span className="t-accent">full-stack/ai</span> {skills.design.tools.join(" · ")}
          </span>
        );
        break;
      case "experience":
      case "git":
        experiences.forEach((e, i) =>
          out.push(
            <span>
              <span className="t-warn">* {String(i + 1).padStart(2, "0")}</span> <b>{e.position}</b>{" "}
              <span className="t-dim">({e.company})</span>
            </span>
          )
        );
        break;
      case "projects":
        projects.forEach((p) =>
          out.push(
            <span>
              <span className="t-accent">{p.title.padEnd(12)}</span> <span className="t-dim">{p.category}</span>
            </span>
          )
        );
        out.push(<span className="t-dim">Open one with: open {projects[0].title.toLowerCase()}</span>);
        break;
      case "ls":
        out.push(
          <span className="t-ls">
            <span className="t-path">projects/</span>
            {FILES.filter((f) => !f.folder && f.id !== "welcome").map((f) => (
              <span key={f.id}>{f.name}</span>
            ))}
          </span>
        );
        break;
      case "cd":
        out.push(<span className="t-dim">You're already home. Try `ls` or `open projects`.</span>);
        break;
      case "open":
      case "cat":
      case "code": {
        const q = arg.toLowerCase().replace(/^\.?\//, "");
        const f = FILES.find(
          (f) => f.name.toLowerCase() === q || f.name.toLowerCase().replace(/\.\w+$/, "") === q || f.path.slice(1) === q || (f.folder && `${f.folder}/${f.name}`.toLowerCase() === q)
        );
        if (!q) out.push(<span className="t-err">usage: open &lt;file&gt;</span>);
        else if (f) {
          ide.openPath(f.path);
          out.push(<span className="t-dim">Opened {f.name}</span>);
        } else out.push(<span className="t-err">open: {arg}: No such file. Try `ls`.</span>);
        break;
      }
      case "contact":
        out.push(
          <span>
            email    <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </span>,
          <span>
            whatsapp <a href={whatsapp.link()} target="_blank" rel="noreferrer">{whatsapp.display}</a>
          </span>,
          <span className="t-dim">or `open contact` for the form</span>
        );
        break;
      case "whatsapp":
        window.open(whatsapp.link(), "_blank", "noopener");
        out.push(<span className="t-dim">Opening WhatsApp…</span>);
        break;
      case "email":
      case "mail":
        window.location.href = `mailto:${contact.email}`;
        out.push(<span className="t-dim">Opening your mail app…</span>);
        break;
      case "hire":
      case "start":
        ide.openPath("/start");
        out.push(<span className="t-ok">Great choice. Opened start-project.tsx</span>);
        break;
      case "sudo":
        if (/hire/.test(arg)) {
          ide.openPath("/start");
          out.push(<span className="t-ok">Permission granted. Opening start-project.tsx…</span>);
        } else out.push(<span className="t-err">suman is not in the sudoers file. This incident will be reported.</span>);
        break;
      case "theme": {
        const t = THEMES.find((t) => t.id === arg.toLowerCase().replace(/\s+/g, "-") || t.label.toLowerCase() === arg.toLowerCase());
        if (t) {
          ide.setTheme(t.id as ThemeId);
          out.push(<span className="t-dim">Theme set to {t.label}</span>);
        } else out.push(<span className="t-dim">Themes: {THEMES.map((t) => t.id).join(", ")}</span>);
        break;
      }
      case "date":
        out.push(<span>{new Date().toString()}</span>);
        break;
      case "echo":
        out.push(<span>{arg}</span>);
        break;
      case "pwd":
        out.push(<span>/home/suman/portfolio</span>);
        break;
      case "exit":
        ide.togglePanel(false);
        break;
      case "rm":
        out.push(<span className="t-err">Nice try.</span>);
        break;
      default:
        out.push(<span className="t-err">{name}: command not found. Type `help` for a list.</span>);
    }
    print(echo, ...out);
  };

  const run = (cmd: string) => {
    if (cmd.trim().toLowerCase() === "clear") {
      setLines([]);
    } else exec(cmd);
    if (cmd.trim()) setHist((h) => [cmd, ...h].slice(0, 50));
    setHIdx(-1);
  };

  useImperativeHandle(ref, () => ({
    run,
    focus: () => inputRef.current?.focus({ preventScroll: true }),
  }));

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      run(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const i = Math.min(hIdx + 1, hist.length - 1);
      if (hist[i] !== undefined) {
        setHIdx(i);
        setInput(hist[i]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const i = hIdx - 1;
      setHIdx(Math.max(i, -1));
      setInput(i >= 0 ? hist[i] : "");
    } else if (e.key === "Tab") {
      e.preventDefault();
      const [c, ...rest] = input.split(" ");
      if (!rest.length) {
        const m = COMMANDS.map(([n]) => n.split(" ")[0]).filter((n) => n.startsWith(c));
        if (m.length === 1) setInput(m[0] + " ");
        else if (m.length > 1) print(<span className="t-dim">{m.join("  ")}</span>);
      } else {
        const a = rest.join(" ").toLowerCase();
        const m = FILES.map((f) => f.name).filter((n) => n.toLowerCase().startsWith(a));
        if (m.length === 1) setInput(`${c} ${m[0]}`);
        else if (m.length > 1) print(<span className="t-dim">{m.join("  ")}</span>);
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <div className="terminal scroll" onClick={() => window.getSelection()?.isCollapsed && inputRef.current?.focus()}>
      {lines.map((l) => (
        <div key={l.id} className="t-line">
          {l.node}
        </div>
      ))}
      <div className="t-line t-input-line">
        {PROMPT}
        <input
          ref={inputRef}
          className="t-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          aria-label="Terminal input"
        />
      </div>
      <div ref={endRef} />
    </div>
  );
});

export default Terminal;
