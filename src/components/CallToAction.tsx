import { Link } from "react-router-dom";
import { config } from "../config";
import "./styles/CallToAction.css";

const CallToAction = () => {
  return (
    <div className="cta-section">
      <p className="cta-kicker">Have an idea, a store or a product in mind?</p>
      <div className="cta-buttons">
        <Link to="/start" className="cta-btn cta-btn-play" data-cursor="disable">
          Plan Your Project →
        </Link>
        <a
          href={config.whatsapp.link()}
          target="_blank"
          rel="noopener noreferrer"
          className="cta-btn cta-btn-hire"
          data-cursor="disable"
        >
          Hire Me on WhatsApp →
        </a>
      </div>
    </div>
  );
};

export default CallToAction;
