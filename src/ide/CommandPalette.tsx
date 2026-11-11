import { useEffect, useMemo, useRef, useState } from "react";
import { FILES } from "./files";
import { FileIcon } from "./FileIcon";

export type Command = { id: string; label: string; keys?: string; run: () => void };

type Props = {
  initial: string;
  commands: Command[];
  onOpenPath: (path: string) => void;
  onClose: () => void;
};

const fuzzy = (text: string, q: string) => {
  const t = text.toLowerCase();
  let i = 0;
  for (const ch of q.toLowerCase()) {
    i = t.indexOf(ch, i);
    if (i < 0) return false;
    i++;
  }
  return true;
};

const CommandPalette = ({ initial, commands, onOpenPath, onClose }: Props) => {
  const [value, setValue] = useState(initial);
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const isCmd = value.startsWith(">");
  const q = (isCmd ? value.slice(1) : value).trim();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const items = useMemo(() => {
    if (isCmd) {
      return commands
        .filter((c) => !q || fuzzy(c.label, q))
        .map((c) => ({ key: c.id, label: c.label, detail: c.keys, icon: null as React.ReactNode, run: c.run }));
    }
    return FILES.filter((f) => !q || fuzzy(`${f.folder ?? ""}/${f.name}`, q)).map((f) => ({
      key: f.id,
      label: f.name,
      detail: f.folder ? `suman-banik/${f.folder}` : "suman-banik",
      icon: <FileIcon file={f} /> as React.ReactNode,
      run: () => onOpenPath(f.path),
    }));
  }, [isCmd, q, commands, onOpenPath]);

  useEffect(() => setSel(0), [value]);
  useEffect(() => {
    listRef.current?.children[sel]?.scrollIntoView({ block: "nearest" });
  }, [sel]);

  const choose = (i: number) => {
    const it = items[i];
    if (!it) return;
    onClose();
    it.run();
  };

  return (
    <div className="palette-backdrop" onMouseDown={onClose}>
      <div className="palette" role="dialog" aria-label="Command palette" onMouseDown={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="palette-input"
          value={value}
          placeholder={isCmd ? "Type a command" : "Search files by name (type > for commands)"}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setSel((s) => Math.min(s + 1, items.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setSel((s) => Math.max(s - 1, 0));
            } else if (e.key === "Enter") choose(sel);
            else if (e.key === "Escape") onClose();
          }}
          spellCheck={false}
        />
        <ul className="palette-list" ref={listRef} role="listbox">
          {items.map((it, i) => (
            <li
              key={it.key}
              role="option"
              aria-selected={i === sel}
              className={i === sel ? "is-sel" : ""}
              onMouseMove={() => setSel(i)}
              onClick={() => choose(i)}
            >
              {it.icon}
              <span className="pl-label">{it.label}</span>
              {it.detail && <span className="pl-detail">{it.detail}</span>}
            </li>
          ))}
          {!items.length && <li className="pl-empty">No matching results</li>}
        </ul>
      </div>
    </div>
  );
};

export default CommandPalette;
