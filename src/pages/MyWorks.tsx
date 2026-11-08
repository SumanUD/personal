import { useEffect } from "react";
import { Link } from "react-router-dom";
import WhatsAppButton from "../components/WhatsAppButton";
import { config } from "../config";
import "./MyWorks.css";

const MyWorks = () => {
  useEffect(() => {
    document.body.style.overflowY = "auto";
    document.title = `Work | ${config.developer.fullName}`;
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="myworks-page">
      <div className="myworks-header">
        <Link to="/" className="back-button" data-cursor="disable">
          ← Back to Home
        </Link>
        <h1>
          All <span>Works</span>
        </h1>
        <p>A collection of all my projects and creations</p>
      </div>

      <div className="myworks-grid">
        {config.projects.map((project, index) => (
          <div className="myworks-card" key={project.id} data-cursor="disable">
            <div className="myworks-card-number">0{index + 1}</div>
            <div className="myworks-card-image">
              <img src={project.image} alt={project.title} />
            </div>
            <div className="myworks-card-info">
              <h3>{project.title}</h3>
              <p className="myworks-card-category">{project.category}</p>
              <p className="myworks-card-description">{project.description}</p>
              <p className="myworks-card-tech">{project.technologies}</p>
            </div>
          </div>
        ))}
      </div>
      <WhatsAppButton />
    </div>
  );
};

export default MyWorks;
