import { FormEvent, useMemo, useState } from "react";
import { FaWhatsapp } from "react-icons/fa6";
import { VscMail, VscLocation, VscSend, VscCheck } from "react-icons/vsc";
import { config } from "../../config";
import { SERVICES, submitNetlifyForm } from "../../utils/netlifyForm";
import { useIde } from "../context";

type Status = "idle" | "sending" | "sent" | "error";

const Row = ({ label, desc, children }: { label: [string, string]; desc: string; children: React.ReactNode }) => (
  <div className="set-row">
    <div className="set-label">
      {label[0]}: <strong>{label[1]}</strong>
    </div>
    <div className="set-desc">{desc}</div>
    {children}
  </div>
);

export const ContactView = () => {
  const { notify } = useIde();
  const [status, setStatus] = useState<Status>("idle");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    setStatus("sending");
    try {
      await submitNetlifyForm("contact", data);
      setStatus("sent");
      form.reset();
      notify("Message sent. Suman will get back to you within 24 hours.", "success");
    } catch {
      setStatus("error");
      notify("Couldn't send the message. Try email or WhatsApp instead.", "error");
    }
  };

  return (
    <div className="settings scroll">
      <div className="set-inner">
        <h1 className="set-title">Contact</h1>
        <p className="set-intro">
          Have a Shopify store, web app or AI idea? Fill in the settings below and press <strong>Send</strong>,
          or reach me directly.
        </p>
        <div className="set-direct">
          <a href={`mailto:${config.contact.email}`}>
            <VscMail /> {config.contact.email}
          </a>
          <a href={config.whatsapp.link()} target="_blank" rel="noreferrer">
            <FaWhatsapp /> {config.whatsapp.display}
          </a>
          <span>
            <VscLocation /> {config.social.location}
          </span>
        </div>

        <form className="set-form" onSubmit={onSubmit}>
          <input type="hidden" name="bot-field" />
          <h2 className="set-group">Contact › Details</h2>
          <Row label={["Contact", "Name"]} desc="What should I call you?">
            <input name="name" required autoComplete="name" placeholder="Jane Doe" />
          </Row>
          <Row label={["Contact", "Email"]} desc="Where I'll send my reply.">
            <input name="email" type="email" required autoComplete="email" placeholder="jane@company.com" />
          </Row>
          <Row label={["Contact", "Phone"]} desc="Optional. Include your country code if you prefer WhatsApp.">
            <input name="phone" type="tel" autoComplete="tel" placeholder="+1 555 000 0000" />
          </Row>
          <Row label={["Contact", "Service"]} desc="Pick the closest match.">
            <select name="service" defaultValue={SERVICES[0]}>
              {SERVICES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Row>
          <Row label={["Contact", "Message"]} desc="A few lines about the project, timeline and goals.">
            <textarea name="message" required rows={5} placeholder="I'd like to…" />
          </Row>
          <div className="set-submit">
            <button className="btn" disabled={status === "sending"}>
              {status === "sent" ? <VscCheck /> : <VscSend />}
              {status === "sending" ? "Sending…" : status === "sent" ? "Sent" : "Send message"}
            </button>
            {status === "error" && <span className="set-error">Something went wrong. Please try again.</span>}
          </div>
        </form>
      </div>
    </div>
  );
};

const PLAN_SERVICES: { title: string; blurb: string; features: string[] }[] = [
  { title: "Shopify Store", blurb: "New store, custom theme or redesign", features: ["Custom OS 2.0 theme", "Store setup & products", "Speed optimisation", "Conversion (CRO) tweaks", "Migration to Shopify", "Integrations & apps setup"] },
  { title: "Shopify App / Plus", blurb: "Custom apps, Plus, headless, Functions", features: ["Custom / private app", "Public app (App Store)", "Headless Hydrogen store", "Checkout extensions", "Shopify Functions", "ERP / API integration"] },
  { title: "Web App / SaaS", blurb: "Dashboards, portals, full products", features: ["User auth & roles", "Admin dashboard", "Payments & billing", "REST / GraphQL API", "Real-time features", "Cloud deployment"] },
  { title: "AI / ML Solution", blurb: "LLMs, chatbots, automation, models", features: ["AI chatbot / assistant", "RAG on my documents", "Workflow automation", "Predictive model", "Computer vision", "AI in existing product"] },
  { title: "HRMS / Business Software", blurb: "My HRMS or custom internal tools", features: ["Attendance & leave", "Payroll", "Employee records", "Recruitment", "Reports & analytics", "Customisation for my company"] },
  { title: "Something Else", blurb: "Tell me, I'm happy to help", features: ["Consulting / audit", "Bug fixes & maintenance", "Performance tuning", "Design to code", "Team augmentation", "Not sure yet"] },
];
const BUDGETS = ["< $500", "$500 – $2k", "$2k – $5k", "$5k – $15k", "$15k+", "Not sure yet"];
const TIMELINES = ["ASAP", "2–4 weeks", "1–3 months", "3+ months", "Flexible"];

export const StartView = () => {
  const { notify } = useIde();
  const [service, setService] = useState(PLAN_SERVICES[0].title);
  const [features, setFeatures] = useState<string[]>([]);
  const [budget, setBudget] = useState(BUDGETS[5]);
  const [timeline, setTimeline] = useState(TIMELINES[4]);
  const [details, setDetails] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");

  const svc = PLAN_SERVICES.find((s) => s.title === service)!;

  const summary = useMemo(
    () =>
      [
        `Service: ${service}`,
        `Features: ${features.length ? features.join(", ") : "-"}`,
        `Budget: ${budget}`,
        `Timeline: ${timeline}`,
        details.name && `Name: ${details.name}`,
        details.message && `Details: ${details.message}`,
      ]
        .filter(Boolean)
        .join("\n"),
    [service, features, budget, timeline, details]
  );

  const toggle = (f: string) => setFeatures((p) => (p.includes(f) ? p.filter((x) => x !== f) : [...p, f]));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await submitNetlifyForm("project-brief", {
        ...details,
        service,
        features: features.join(", "),
        budget,
        timeline,
        "bot-field": "",
      });
      setStatus("sent");
      notify("Project brief sent. Expect ideas, an estimate and next steps within 24 hours.", "success");
    } catch {
      setStatus("error");
      notify("Couldn't send the brief. Try the WhatsApp button instead.", "error");
    }
  };

  const set = (k: keyof typeof details) => (e: { target: { value: string } }) =>
    setDetails((d) => ({ ...d, [k]: e.target.value }));

  return (
    <div className="settings scroll">
      <div className="set-inner">
        <h1 className="set-title">Plan your project</h1>
        <p className="set-intro">
          Configure your project like a settings file. I'll reply within 24 hours with ideas, an estimate and next
          steps.
        </p>

        <form className="set-form" onSubmit={onSubmit}>
          <h2 className="set-group">Project › Service</h2>
          <div className="set-row">
            <div className="set-label">
              Project: <strong>Service</strong>
            </div>
            <div className="set-desc">What do you need built?</div>
            <div className="svc-grid">
              {PLAN_SERVICES.map((s) => (
                <label key={s.title} className={`svc${service === s.title ? " is-on" : ""}`}>
                  <input
                    type="radio"
                    name="svc"
                    checked={service === s.title}
                    onChange={() => {
                      setService(s.title);
                      setFeatures([]);
                    }}
                  />
                  <strong>{s.title}</strong>
                  <span>{s.blurb}</span>
                </label>
              ))}
            </div>
          </div>

          <h2 className="set-group">Project › Features</h2>
          <div className="set-row">
            <div className="set-label">
              Project: <strong>Features</strong>
            </div>
            <div className="set-desc">Select everything that applies.</div>
            <div className="checks">
              {svc.features.map((f) => (
                <label key={f} className="check">
                  <input type="checkbox" checked={features.includes(f)} onChange={() => toggle(f)} />
                  {f}
                </label>
              ))}
            </div>
          </div>

          <h2 className="set-group">Project › Scope</h2>
          <Row label={["Project", "Budget"]} desc="A rough range is fine.">
            <select value={budget} onChange={(e) => setBudget(e.target.value)}>
              {BUDGETS.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </Row>
          <Row label={["Project", "Timeline"]} desc="When would you like to launch?">
            <select value={timeline} onChange={(e) => setTimeline(e.target.value)}>
              {TIMELINES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Row>

          <h2 className="set-group">Project › Details</h2>
          <Row label={["Project", "Name"]} desc="Your name.">
            <input required value={details.name} onChange={set("name")} autoComplete="name" />
          </Row>
          <Row label={["Project", "Email"]} desc="Where I'll send the estimate.">
            <input required type="email" value={details.email} onChange={set("email")} autoComplete="email" />
          </Row>
          <Row label={["Project", "Phone"]} desc="Optional.">
            <input type="tel" value={details.phone} onChange={set("phone")} autoComplete="tel" />
          </Row>
          <Row label={["Project", "Notes"]} desc="Links, references, anything that helps.">
            <textarea rows={4} value={details.message} onChange={set("message")} />
          </Row>

          <div className="set-submit">
            <button className="btn" disabled={status === "sending" || status === "sent"}>
              {status === "sent" ? <VscCheck /> : <VscSend />}
              {status === "sending" ? "Sending…" : status === "sent" ? "Brief sent" : "Send brief"}
            </button>
            <a
              className="btn btn-secondary"
              href={config.whatsapp.link(`Hi Suman! I'd like to discuss a project.\n\n${summary}`)}
              target="_blank"
              rel="noreferrer"
            >
              <FaWhatsapp /> Send via WhatsApp
            </a>
            {status === "error" && <span className="set-error">Something went wrong. Please try again.</span>}
          </div>
        </form>
      </div>
    </div>
  );
};
