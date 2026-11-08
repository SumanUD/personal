import { MdArrowOutward, MdCopyright } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa6";
import "./styles/Contact.css";
import { config } from "../config";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FormEvent, useEffect, useState } from "react";
import { SERVICES, submitNetlifyForm } from "../utils/netlifyForm";

gsap.registerPlugin(ScrollTrigger);

type Status = "idle" | "sending" | "sent" | "error";

const Contact = () => {
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    const contactTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".contact-section",
        start: "top 80%",
        end: "bottom center",
        toggleActions: "play none none none",
      },
    });
    contactTimeline
      .fromTo(
        ".contact-section h3",
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      )
      .fromTo(
        ".contact-box, .contact-form",
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: "power3.out" },
        "-=0.4"
      );
    return () => {
      contactTimeline.kill();
    };
  }, []);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    setStatus("sending");
    try {
      await submitNetlifyForm("contact", data);
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  };

  const socials = [
    { label: "Github", href: config.contact.github },
    { label: "Linkedin", href: config.contact.linkedin },
    { label: "Twitter", href: config.contact.twitter },
    { label: "Facebook", href: config.contact.facebook },
    { label: "Instagram", href: config.contact.instagram },
  ].filter((s) => s.href);

  return (
    <div className="contact-section section-container" id="contact">
      <div className="contact-container">
        <h3>
          Let's build <span>something</span> great
        </h3>
        <div className="contact-grid">
          <div className="contact-info">
            <div className="contact-box">
              <h4>Email</h4>
              <p>
                <a href={`mailto:${config.contact.email}`} data-cursor="disable">
                  {config.contact.email}
                </a>
              </p>
              <h4>WhatsApp</h4>
              <p>
                <a
                  href={config.whatsapp.link()}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="disable"
                >
                  {config.whatsapp.display}
                </a>
              </p>
              <h4>Location</h4>
              <p>
                <span>{config.social.location}</span>
                <br />
                <span className="contact-muted">Working with clients worldwide</span>
              </p>
            </div>
            <div className="contact-box">
              <a
                href={config.whatsapp.link()}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="disable"
                className="contact-wa-btn"
              >
                <FaWhatsapp /> Chat on WhatsApp
              </a>
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="disable"
                  className="contact-social"
                >
                  {s.label} <MdArrowOutward />
                </a>
              ))}
            </div>
          </div>

          <form
            className="contact-form"
            name="contact"
            method="POST"
            data-netlify="true"
            netlify-honeypot="bot-field"
            onSubmit={onSubmit}
          >
            <input type="hidden" name="form-name" value="contact" />
            <p className="contact-hidden">
              <label>
                Don't fill this out: <input name="bot-field" />
              </label>
            </p>
            <div className="contact-row">
              <label>
                <span>Name</span>
                <input name="name" required autoComplete="name" placeholder="Your name" />
              </label>
              <label>
                <span>Email</span>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@company.com"
                />
              </label>
            </div>
            <div className="contact-row">
              <label>
                <span>Phone / WhatsApp (optional)</span>
                <input name="phone" type="tel" autoComplete="tel" placeholder="+91 …" />
              </label>
              <label>
                <span>I need help with</span>
                <select name="service" defaultValue={SERVICES[0]}>
                  {SERVICES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              <span>Message</span>
              <textarea
                name="message"
                required
                rows={5}
                placeholder="Tell me about your project, goals and timeline…"
              />
            </label>
            <button type="submit" disabled={status === "sending"} data-cursor="disable">
              {status === "sending" ? "Sending…" : "Send message"} <MdArrowOutward />
            </button>
            <p className={`contact-status contact-status-${status}`} role="status">
              {status === "sent" && "Thanks! Your message is in. I'll reply within 24 hours."}
              {status === "error" && (
                <>
                  Something went wrong. Please email me or{" "}
                  <a href={config.whatsapp.link()} target="_blank" rel="noopener noreferrer">
                    message me on WhatsApp
                  </a>
                  .
                </>
              )}
            </p>
          </form>
        </div>

        <div className="contact-footer">
          <h2>
            Designed and developed by <span>{config.developer.fullName}</span>
          </h2>
          <h5>
            <MdCopyright /> {new Date().getFullYear()}
          </h5>
        </div>
      </div>
    </div>
  );
};

export default Contact;
