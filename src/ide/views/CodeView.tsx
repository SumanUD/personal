import { useMemo, useState } from "react";
import type { Lang } from "../files";
import { renderTokens, tokenize } from "../highlight";
import { useIde } from "../context";

const CodeView = ({ text, lang }: { text: string; lang: Lang }) => {
  const { setCursor, openPath } = useIde();
  const lines = useMemo(() => tokenize(text, lang), [text, lang]);
  const [active, setActive] = useState(0);

  return (
    <div className="code-wrap">
      <div className="code" role="document">
        {lines.map((toks, i) => (
          <div
            key={i}
            className={`code-line${i === active ? " is-active" : ""}`}
            onClick={() => {
              setActive(i);
              const sel = window.getSelection();
              setCursor(i + 1, (sel?.focusOffset ?? 0) + 1);
            }}
          >
            <span className="ln" aria-hidden>
              {i + 1}
            </span>
            <span className="lc">{toks.length ? renderTokens(toks, openPath) : "​"}</span>
          </div>
        ))}
        <div className="code-tail" />
      </div>
      <div className="minimap" aria-hidden>
        {lines.map((toks, i) => (
          <div key={i} className="mm-line">
            {toks.map((t, j) => (
              <span key={j} className={t.c}>
                {t.t}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CodeView;
