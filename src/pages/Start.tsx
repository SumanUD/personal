import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaShopify, FaWhatsapp } from "react-icons/fa6";
import { TbApps, TbBrain, TbBriefcase, TbCode, TbSparkles } from "react-icons/tb";
import { config } from "../config";
import { submitNetlifyForm } from "../utils/netlifyForm";
import WhatsAppButton from "../components/WhatsAppButton";
import "./Start.css";

type Service = {
  id: string;
  title: string;
  blurb: string;
  icon: JSX.Element;
  features: string[];
};

const SERVICES: Service[] = [
  {
    id: "shopify-store",
    title: "Shopify Store",
    blurb: "New store, custom theme or redesign",
    icon: <FaShopify />,
    features: ["Custom OS 2.0 theme", "Store setup & products", "Speed optimisation", "Conversion (CRO) tweaks", "Migration to Shopify", "Integrations & apps setup"],
  },
  {
    id: "shopify-advanced",
    title: "Shopify App / Plus",
    blurb: "Custom apps, Plus, headless, Functions",
    icon: <TbApps />,
    features: ["Custom / private app", "Public app (App Store)", "Headless Hydrogen store", "Checkout extensions", "Shopify Functions", "ERP / API integration"],
  },
  {
    id: "web-app",
    title: "Web App / SaaS",
    blurb: "Dashboards, portals, full products",
    icon: <TbCode />,
    features: ["User auth & roles", "Admin dashboard", "Payments & billing", "REST / GraphQL API", "Real-time features", "Cloud deployment"],
  },
  {
    id: "ai-ml",
    title: "AI / ML Solution",
    blurb: "LLMs, chatbots, automation, models",
    icon: <TbBrain />,
    features: ["AI chatbot / assistant", "RAG on my documents", "Workflow automation", "Predictive model", "Computer vision", "AI in existing product"],
  },
  {
    id: "hrms",
    title: "HRMS / Business Software",
    blurb: "My HRMS or custom internal tools",
    icon: <TbBriefcase />,
    features: ["Attendance & leave", "Payroll", "Employee records", "Recruitment", "Reports & analytics", "Customisation for my company"],
  },
  {
    id: "other",
    title: "Something Else",
    blurb: "Tell me, I'm happy to help",
    icon: <TbSparkles />,
    features: ["Consulting / audit", "Bug fixes & maintenance", "Performance tuning", "Design to code", "Team augmentation", "Not sure yet"],
  },
];

const BUDGETS = ["< $500", "$500 – $2k", "$2k – $5k", "$5k – $15k", "$15k+", "Not sure yet"];
const TIMELINES = ["ASAP", "2–4 weeks", "1–3 months", "3+ months", "Flexible"];
const STEPS = ["Service", "Features", "Budget", "Details"];

const Start = () => {
  const [step, setStep] = useState(0);
  const [service, setService] = useState<Service | null>(null);
  const [features, setFeatures] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [details, setDetails] = useState({ name: "", email: "", phone: "", message: "" });

  useEffect(() => {
    document.body.style.overflowY = "auto";
    document.title = `Plan your project | ${config.developer.fullName}`;
    window.scrollTo(0, 0);
  }, []);

  const toggleFeature = (f: string) =>
    setFeatures((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));

  const canNext = [!!service, true, !!budget && !!timeline, true][step];

  const summary = useMemo(
    () =>
      [
        `Service: ${service?.title ?? "-"}`,
        `Features: ${features.length ? features.join(", ") : "-"}`,
        `Budget: ${budget || "-"}`,
        `Timeline: ${timeline || "-"}`,
        details.name && `Name: ${details.name}`,
        details.message && `Details: ${details.message}`,
      ]
        .filter(Boolean)
        .join("\n"),
    [service, features, budget, timeline, details]
  );

  const waLink = config.whatsapp.link(`Hi Suman! I'd like to discuss a project.\n\n${summary}`);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await submitNetlifyForm("project-brief", {
        ...details,
        service: service?.title ?? "",
        features: features.join(", "),
        budget,
        timeline,
        "bot-field": "",
      });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="start-page">
      <div className="start-glow start-glow-1" />
      <div className="start-glow start-glow-2" />

      <header className="start-header">
        <Link to="/" className="start-logo" aria-label="Home">
          {config.developer.initials}
          <span className="navbar-title-dot">.</span>
        </Link>
        <Link to="/" className="start-back">
          ← Back to home
        </Link>
      </header>

      <main className="start-main">
        <div className="start-intro">
          <p className="start-eyebrow">Project planner</p>
          <h1>
            Let's plan your <span>project</span>
          </h1>
          <p className="start-sub">
            Four quick steps and I'll get back to you within 24 hours with ideas, an estimate
            and next steps.
          </p>
        </div>

        {status === "sent" ? (
          <div className="start-card start-success">
            <div className="start-success-icon">✓</div>
            <h2>Brief received!</h2>
            <p>
              Thanks{details.name ? `, ${details.name.split(" ")[0]}` : ""}. I'll review it and
              reply to <b>{details.email}</b> soon. Want a faster answer?
            </p>
            <a className="start-btn start-btn-wa" href={waLink} target="_blank" rel="noopener noreferrer">
              <FaWhatsapp /> Continue on WhatsApp
            </a>
            <Link to="/" className="start-link">
              Back to portfolio
            </Link>
          </div>
        ) : (
          <div className="start-layout">
            <div className="start-card">
              <ol className="start-steps">
                {STEPS.map((s, i) => (
                  <li
                    key={s}
                    className={`${i === step ? "is-active" : ""} ${i < step ? "is-done" : ""}`}
                  >
                    <button type="button" onClick={() => i < step && setStep(i)} disabled={i > step}>
                      <span>{i < step ? "✓" : i + 1}</span>
                      {s}
                    </button>
                  </li>
                ))}
              </ol>
              <div className="start-progress">
                <div style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
              </div>

              <div className="start-panel" key={step}>
                {step === 0 && (
                  <>
                    <h2>What are we building?</h2>
                    <div className="start-services">
                      {SERVICES.map((s) => (
                        <button
                          type="button"
                          key={s.id}
                          className={`start-service ${service?.id === s.id ? "is-selected" : ""}`}
                          onClick={() => {
                            if (service?.id !== s.id) setFeatures([]);
                            setService(s);
                            setStep(1);
                          }}
                        >
                          <span className="start-service-icon">{s.icon}</span>
                          <b>{s.title}</b>
                          <small>{s.blurb}</small>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {step === 1 && service && (
                  <>
                    <h2>What do you need?</h2>
                    <p className="start-hint">Pick everything that applies. You can skip this.</p>
                    <div className="start-chips">
                      {service.features.map((f) => (
                        <button
                          type="button"
                          key={f}
                          className={`start-chip ${features.includes(f) ? "is-selected" : ""}`}
                          onClick={() => toggleFeature(f)}
                        >
                          {features.includes(f) ? "✓ " : "+ "}
                          {f}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <h2>Budget & timeline</h2>
                    <p className="start-hint">A rough range is perfect. It helps me suggest the right approach.</p>
                    <h3>Budget</h3>
                    <div className="start-chips">
                      {BUDGETS.map((b) => (
                        <button
                          type="button"
                          key={b}
                          className={`start-chip ${budget === b ? "is-selected" : ""}`}
                          onClick={() => setBudget(b)}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                    <h3>Timeline</h3>
                    <div className="start-chips">
                      {TIMELINES.map((t) => (
                        <button
                          type="button"
                          key={t}
                          className={`start-chip ${timeline === t ? "is-selected" : ""}`}
                          onClick={() => setTimeline(t)}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {step === 3 && (
                  <form className="start-form" onSubmit={onSubmit} id="brief-form">
                    <h2>Where can I reach you?</h2>
                    <div className="start-row">
                      <label>
                        <span>Name *</span>
                        <input
                          required
                          autoComplete="name"
                          value={details.name}
                          onChange={(e) => setDetails({ ...details, name: e.target.value })}
                        />
                      </label>
                      <label>
                        <span>Email *</span>
                        <input
                          required
                          type="email"
                          autoComplete="email"
                          value={details.email}
                          onChange={(e) => setDetails({ ...details, email: e.target.value })}
                        />
                      </label>
                    </div>
                    <label>
                      <span>Phone / WhatsApp</span>
                      <input
                        type="tel"
                        autoComplete="tel"
                        value={details.phone}
                        onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                      />
                    </label>
                    <label>
                      <span>Anything else? Links, references, goals…</span>
                      <textarea
                        rows={4}
                        value={details.message}
                        onChange={(e) => setDetails({ ...details, message: e.target.value })}
                      />
                    </label>
                    {status === "error" && (
                      <p className="start-error">
                        Couldn't send the form. Please use the WhatsApp button instead.
                      </p>
                    )}
                  </form>
                )}
              </div>

              <div className="start-nav">
                {step > 0 ? (
                  <button type="button" className="start-btn start-btn-ghost" onClick={() => setStep(step - 1)}>
                    ← Back
                  </button>
                ) : (
                  <span />
                )}
                {step < 3 ? (
                  <button
                    type="button"
                    className="start-btn"
                    disabled={!canNext}
                    onClick={() => setStep(step + 1)}
                  >
                    {step === 1 && features.length === 0 ? "Skip →" : "Next →"}
                  </button>
                ) : (
                  <div className="start-submit">
                    <a className="start-btn start-btn-wa" href={waLink} target="_blank" rel="noopener noreferrer">
                      <FaWhatsapp /> Send on WhatsApp
                    </a>
                    <button
                      type="submit"
                      form="brief-form"
                      className="start-btn"
                      disabled={status === "sending"}
                    >
                      {status === "sending" ? "Sending…" : "Send brief →"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <aside className="start-card start-summary">
              <p className="start-eyebrow">Your brief</p>
              <dl>
                <dt>Service</dt>
                <dd>{service?.title ?? <i>Not selected</i>}</dd>
                <dt>Features</dt>
                <dd>
                  {features.length ? (
                    <div className="start-tags">
                      {features.map((f) => (
                        <span key={f}>{f}</span>
                      ))}
                    </div>
                  ) : (
                    <i>-</i>
                  )}
                </dd>
                <dt>Budget</dt>
                <dd>{budget || <i>-</i>}</dd>
                <dt>Timeline</dt>
                <dd>{timeline || <i>-</i>}</dd>
              </dl>
              <div className="start-contact">
                <p>Prefer to talk directly?</p>
                <a href={`mailto:${config.contact.email}`}>{config.contact.email}</a>
                <a href={config.whatsapp.link()} target="_blank" rel="noopener noreferrer">
                  WhatsApp {config.whatsapp.display}
                </a>
              </div>
            </aside>
          </div>
        )}
      </main>
      <WhatsAppButton />
    </div>
  );
};

export default Start;
