import { ReactNode } from "react";
import type { Lang } from "./files";

export type Tok = { c: string; t: string; href?: string };

const KEYWORDS = new Set([
  "const", "let", "var", "export", "default", "type", "interface", "import", "from",
  "function", "return", "as", "new", "readonly", "typeof",
]);
const CONSTANTS = new Set(["true", "false", "null", "undefined"]);
const BUILTIN_TYPES = new Set(["string", "number", "boolean", "any", "void"]);

const CODE_RE =
  /(\/\/.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`[^`]*`)|(<\/?[A-Za-z][\w.]*|\/?>)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)|([{}[\]()])|(\s+)|([^\s\w])/g;

const linkFor = (raw: string): string | undefined => {
  const s = raw.slice(1, -1);
  if (/^https?:\/\//.test(s)) return s;
  if (/^[^\s@]+@[^\s@]+\.[a-z]+$/i.test(s)) return `mailto:${s}`;
  return undefined;
};

function tokenizeCode(line: string, lang: Lang): Tok[] {
  const out: Tok[] = [];
  let m: RegExpExecArray | null;
  CODE_RE.lastIndex = 0;
  while ((m = CODE_RE.exec(line))) {
    const [all, comment, str, tag, num, word, bracket, ws] = m;
    if (comment) out.push({ c: "tk-comment", t: all });
    else if (str) {
      const rest = line.slice(CODE_RE.lastIndex);
      const isKey = lang === "json" && /^\s*:/.test(rest);
      out.push({ c: isKey ? "tk-prop" : "tk-string", t: all, href: isKey ? undefined : linkFor(all) });
    } else if (tag) out.push({ c: tag.endsWith(">") ? "tk-punct" : "tk-tag", t: all });
    else if (num) out.push({ c: "tk-number", t: all });
    else if (word) {
      const rest = line.slice(CODE_RE.lastIndex);
      if (KEYWORDS.has(word)) out.push({ c: word === "return" || word === "import" || word === "export" || word === "from" || word === "default" ? "tk-control" : "tk-keyword", t: all });
      else if (CONSTANTS.has(word)) out.push({ c: "tk-keyword", t: all });
      else if (BUILTIN_TYPES.has(word) && lang !== "json") out.push({ c: "tk-type", t: all });
      else if (/^\s*\(/.test(rest)) out.push({ c: "tk-func", t: all });
      else if (/^\s*[:?]\s*/.test(rest) && lang !== "json") out.push({ c: "tk-prop", t: all });
      else if (/^[A-Z]/.test(word)) out.push({ c: "tk-type", t: all });
      else out.push({ c: "tk-var", t: all });
    } else if (bracket) out.push({ c: "tk-bracket", t: all });
    else if (ws) out.push({ c: "", t: all });
    else out.push({ c: "tk-punct", t: all });
  }
  return out;
}

const INLINE_RE = /(\*\*[^*]+\*\*)|(_[^_]+_)|(`[^`]+`)|(!?\[[^\]]*\]\([^)]*\))/g;

function tokenizeInline(text: string, base = "tk-text"): Tok[] {
  const out: Tok[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  INLINE_RE.lastIndex = 0;
  while ((m = INLINE_RE.exec(text))) {
    if (m.index > last) out.push({ c: base, t: text.slice(last, m.index) });
    const [all, bold, ital, code, link] = m;
    if (bold) out.push({ c: "md-bold", t: all });
    else if (ital) out.push({ c: "md-italic", t: all });
    else if (code) out.push({ c: "md-code", t: all });
    else if (link) {
      const lm = /^(!?)\[([^\]]*)\]\(([^)]*)\)$/.exec(all)!;
      out.push({ c: "md-punct", t: `${lm[1]}[` });
      out.push({ c: "md-linktext", t: lm[2] });
      out.push({ c: "md-punct", t: "](" });
      out.push({ c: "md-url", t: lm[3], href: lm[1] ? undefined : lm[3] });
      out.push({ c: "md-punct", t: ")" });
    }
    last = m.index + all.length;
  }
  if (last < text.length) out.push({ c: base, t: text.slice(last) });
  return out;
}

function tokenizeMarkdown(line: string): Tok[] {
  const h = /^(#{1,6})(\s.*)$/.exec(line);
  if (h) return [{ c: "md-heading", t: h[1] + h[2] }];
  if (/^>\s?/.test(line)) return [{ c: "md-punct", t: "> " }, ...tokenizeInline(line.replace(/^>\s?/, ""), "md-quote")];
  const li = /^(\s*)([-*]|\d+\.)(\s.*)$/.exec(line);
  if (li) return [{ c: "", t: li[1] }, { c: "md-bullet", t: li[2] }, ...tokenizeInline(li[3])];
  return tokenizeInline(line);
}

export function tokenize(text: string, lang: Lang): Tok[][] {
  return text.split("\n").map((l) => (lang === "markdown" ? tokenizeMarkdown(l) : tokenizeCode(l, lang)));
}

export function renderTokens(tokens: Tok[], onLink: (href: string) => void): ReactNode[] {
  return tokens.map((tk, i) =>
    tk.href ? (
      <a
        key={i}
        className={`${tk.c} tk-link`}
        href={tk.href}
        target={tk.href.startsWith("/") ? undefined : "_blank"}
        rel="noreferrer"
        onClick={(e) => {
          if (tk.href!.startsWith("/")) {
            e.preventDefault();
            onLink(tk.href!);
          }
        }}
      >
        {tk.t}
      </a>
    ) : (
      <span key={i} className={tk.c}>
        {tk.t}
      </span>
    )
  );
}
