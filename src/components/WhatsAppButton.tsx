import { FaWhatsapp } from "react-icons/fa6";
import { config } from "../config";
import "./styles/WhatsAppButton.css";

const WhatsAppButton = () => (
  <a
    className="wa-float"
    href={config.whatsapp.link()}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chat with Suman on WhatsApp"
    data-cursor="disable"
  >
    <span className="wa-float-ring" />
    <span className="wa-float-ring wa-float-ring-2" />
    <FaWhatsapp />
    <span className="wa-float-label">Chat with me</span>
  </a>
);

export default WhatsAppButton;
