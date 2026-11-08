import {
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
  FaXTwitter,
} from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import { TbArrowUpRight } from "react-icons/tb";
import "./styles/SocialIcons.css";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import HoverLinks from "./HoverLinks";
import { config } from "../config";

const SocialIcons = () => {
  useEffect(() => {
    const social = document.getElementById("social") as HTMLElement;
    const cleanups: (() => void)[] = [];

    social.querySelectorAll("span").forEach((item) => {
      const elem = item as HTMLElement;
      const link = elem.querySelector("a") as HTMLElement;

      let mouseX = 25;
      let mouseY = 25;
      let currentX = 0;
      let currentY = 0;
      let frame = 0;

      const updatePosition = () => {
        currentX += (mouseX - currentX) * 0.1;
        currentY += (mouseY - currentY) * 0.1;
        link.style.setProperty("--siLeft", `${currentX}px`);
        link.style.setProperty("--siTop", `${currentY}px`);
        frame = requestAnimationFrame(updatePosition);
      };

      const onMouseMove = (e: MouseEvent) => {
        const rect = elem.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (x < 40 && x > 10 && y < 40 && y > 5) {
          mouseX = x;
          mouseY = y;
        } else {
          mouseX = rect.width / 2;
          mouseY = rect.height / 2;
        }
      };

      document.addEventListener("mousemove", onMouseMove);
      updatePosition();
      cleanups.push(() => {
        cancelAnimationFrame(frame);
        document.removeEventListener("mousemove", onMouseMove);
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  const links = [
    { href: config.whatsapp.link(), icon: <FaWhatsapp />, label: "WhatsApp" },
    { href: `mailto:${config.contact.email}`, icon: <MdOutlineEmail />, label: "Email" },
    { href: config.contact.github, icon: <FaGithub />, label: "GitHub" },
    { href: config.contact.linkedin, icon: <FaLinkedinIn />, label: "LinkedIn" },
    { href: config.contact.twitter, icon: <FaXTwitter />, label: "X" },
    { href: config.contact.instagram, icon: <FaInstagram />, label: "Instagram" },
  ].filter((l) => l.href);

  return (
    <div className="icons-section">
      <div className="social-icons" data-cursor="icons" id="social">
        {links.map((l) => (
          <span key={l.label}>
            <a href={l.href} target="_blank" rel="noopener noreferrer" aria-label={l.label}>
              {l.icon}
            </a>
          </span>
        ))}
      </div>
      <Link className="resume-button" to="/start">
        <HoverLinks text="HIRE ME" />
        <span>
          <TbArrowUpRight />
        </span>
      </Link>
    </div>
  );
};

export default SocialIcons;
