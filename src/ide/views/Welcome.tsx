import { FaShopify, FaWhatsapp } from "react-icons/fa6";
import { TbBrain, TbCode } from "react-icons/tb";
import { VscFile, VscMail, VscRocket, VscTerminal, VscSearch, VscAccount } from "react-icons/vsc";
import { config } from "../../config";
import { useIde } from "../context";
import { slugify } from "../files";

const Welcome = () => {
  const { openPath, togglePanel, runTerminal, openPalette } = useIde();
  const { developer, stats, projects, skills } = config;

  const walkthroughs = [
    { icon: <FaShopify />, title: "Shopify Expert", text: skills.develop.description, path: "/skills", progress: 100 },
    { icon: <TbCode />, title: "Full-Stack Development", text: "Web apps, SaaS, dashboards & APIs", path: "/experience", progress: 92 },
    { icon: <TbBrain />, title: "AI & ML Engineering", text: "LLM agents, chatbots, RAG & automation", path: "/about", progress: 88 },
  ];

  return (
    <div className="welcome scroll">
      <div className="welcome-inner">
        <header className="welcome-head">
          <h1>{developer.fullName}</h1>
          <p className="welcome-sub">{developer.title}</p>
          <p className="welcome-desc">{developer.description}</p>
          <div className="welcome-stats">
            {stats.map((s) => (
              <div key={s.label}>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </header>

        <div className="welcome-cols">
          <div>
            <section className="welcome-section">
              <h2>Start</h2>
              <ul className="welcome-links">
                <li>
                  <button onClick={() => openPath("/start")}>
                    <VscRocket /> Start a new project…
                  </button>
                </li>
                <li>
                  <button onClick={() => openPath("/contact")}>
                    <VscMail /> Contact me…
                  </button>
                </li>
                <li>
                  <a href={config.whatsapp.link()} target="_blank" rel="noreferrer">
                    <FaWhatsapp /> Chat on WhatsApp…
                  </a>
                </li>
                <li>
                  <button onClick={() => openPath("/about")}>
                    <VscAccount /> Read about me…
                  </button>
                </li>
                <li>
                  <button onClick={() => openPalette("")}>
                    <VscSearch /> Open file… <kbd>Ctrl+P</kbd>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      togglePanel(true);
                      runTerminal("help");
                    }}
                  >
                    <VscTerminal /> Open terminal… <kbd>Ctrl+`</kbd>
                  </button>
                </li>
              </ul>
            </section>

            <section className="welcome-section">
              <h2>Recent</h2>
              <ul className="welcome-recent">
                {projects.slice(0, 6).map((p) => (
                  <li key={p.id}>
                    <button onClick={() => openPath(`/projects/${slugify(p.title)}`)}>{p.title}</button>
                    <span>~/projects/{slugify(p.title)}</span>
                  </li>
                ))}
                <li>
                  <button onClick={() => openPath("/projects")}>More…</button>
                </li>
              </ul>
            </section>
          </div>

          <section className="welcome-section">
            <h2>Walkthroughs</h2>
            <div className="walkthroughs">
              {walkthroughs.map((w) => (
                <button key={w.title} className="walkthrough" onClick={() => openPath(w.path)}>
                  <span className="wt-icon">{w.icon}</span>
                  <span className="wt-body">
                    <strong>{w.title}</strong>
                    <span>{w.text}</span>
                    <span className="wt-bar">
                      <span style={{ width: `${w.progress}%` }} />
                    </span>
                  </span>
                </button>
              ))}
              <button className="walkthrough wt-cta" onClick={() => openPath("/start")}>
                <span className="wt-icon">
                  <VscFile />
                </span>
                <span className="wt-body">
                  <strong>Hire me for your next build</strong>
                  <span>Answer four quick questions, get a reply within 24 hours.</span>
                </span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
