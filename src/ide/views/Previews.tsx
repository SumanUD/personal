import { FaWhatsapp } from "react-icons/fa6";
import { VscArrowLeft, VscArrowRight, VscMail } from "react-icons/vsc";
import { config } from "../../config";
import { useIde } from "../context";
import { slugify } from "../files";

export const AboutPreview = () => {
  const { openPath } = useIde();
  const { about, developer, social, stats, skills, contact, whatsapp } = config;
  return (
    <article className="md-preview scroll">
      <div className="md-inner">
        <h1>{about.title}</h1>
        <blockquote>
          {developer.title} · {social.location}
        </blockquote>
        <p>{about.description}</p>
        <h2>At a glance</h2>
        <div className="md-stats">
          {stats.map((s) => (
            <div key={s.label}>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
        <h2>What I do</h2>
        {[skills.develop, skills.design].map((s) => (
          <section key={s.title}>
            <h3>{s.title}</h3>
            <p>
              <em>{s.description}</em>
            </p>
            <p>{s.details}</p>
            <div className="chips">
              {s.tools.map((t) => (
                <span className="chip" key={t}>
                  {t}
                </span>
              ))}
            </div>
          </section>
        ))}
        <h2>Let's talk</h2>
        <div className="md-actions">
          <a className="btn" href={`mailto:${contact.email}`}>
            <VscMail /> {contact.email}
          </a>
          <a className="btn btn-secondary" href={whatsapp.link()} target="_blank" rel="noreferrer">
            <FaWhatsapp /> {whatsapp.display}
          </a>
          <button className="btn btn-secondary" onClick={() => openPath("/start")}>
            Plan a project
          </button>
        </div>
      </div>
    </article>
  );
};

export const ProjectsPreview = () => {
  const { openPath } = useIde();
  return (
    <article className="md-preview scroll">
      <div className="md-inner md-wide">
        <h1>Projects</h1>
        <p>A selection of things I've designed and built. Click any card to open it.</p>
        <div className="project-grid">
          {config.projects.map((p) => (
            <button key={p.id} className="project-card" onClick={() => openPath(`/projects/${slugify(p.title)}`)}>
              <span className="pc-img">
                <img src={p.image} alt="" loading="lazy" decoding="async" />
              </span>
              <span className="pc-body">
                <span className="pc-cat">{p.category}</span>
                <strong>{p.title}</strong>
                <span className="pc-desc">{p.description}</span>
                <span className="pc-file">projects/{slugify(p.title)}.md</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </article>
  );
};

export const ProjectPreview = ({ projectId }: { projectId: number }) => {
  const { openPath } = useIde();
  const list = config.projects;
  const idx = list.findIndex((p) => p.id === projectId);
  const p = list[idx];
  if (!p) return null;
  const prev = list[(idx - 1 + list.length) % list.length];
  const next = list[(idx + 1) % list.length];
  return (
    <article className="md-preview scroll">
      <div className="md-inner">
        <h1>{p.title}</h1>
        <p>
          <code>{p.category}</code>
        </p>
        <img className="md-img" src={p.image} alt={p.title} decoding="async" />
        <p>{p.description}</p>
        <h2>Tech stack</h2>
        <div className="chips">
          {p.technologies.split(",").map((t) => (
            <span className="chip" key={t}>
              {t.trim()}
            </span>
          ))}
        </div>
        <h2>Want something like this?</h2>
        <div className="md-actions">
          <button className="btn" onClick={() => openPath("/start")}>
            Start a project
          </button>
          <a
            className="btn btn-secondary"
            href={config.whatsapp.link(`Hi Suman, I saw ${p.title} on your portfolio and would like to discuss a similar project.`)}
            target="_blank"
            rel="noreferrer"
          >
            <FaWhatsapp /> Ask on WhatsApp
          </a>
        </div>
        <nav className="md-pager">
          <button onClick={() => openPath(`/projects/${slugify(prev.title)}`)}>
            <VscArrowLeft /> {prev.title}
          </button>
          <button onClick={() => openPath(`/projects/${slugify(next.title)}`)}>
            {next.title} <VscArrowRight />
          </button>
        </nav>
      </div>
    </article>
  );
};
