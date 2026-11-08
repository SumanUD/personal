import { PropsWithChildren, useEffect, useState } from "react";
import About from "./About";
import Career from "./Career";
import Contact from "./Contact";
import Cursor from "./Cursor";
import Landing from "./Landing";
import Navbar from "./Navbar";
import SocialIcons from "./SocialIcons";
import WhatIDo from "./WhatIDo";
import Work from "./Work";
import TechStackNew from "./TechStackNew";
import CallToAction from "./CallToAction";
import WhatsAppButton from "./WhatsAppButton";
import setSplitText from "./utils/splitText";

const MainContainer = ({ children }: PropsWithChildren) => {
  const [isDesktopView, setIsDesktopView] = useState<boolean>(window.innerWidth > 1024);

  useEffect(() => {
    let lastWidth = window.innerWidth;
    const resizeHandler = () => {
      if (window.innerWidth === lastWidth) return; // ignore mobile URL-bar jitter
      lastWidth = window.innerWidth;
      setSplitText();
      setIsDesktopView(window.innerWidth > 1024);
    };
    setSplitText();
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, []);

  return (
    <div className="container-main">
      <Cursor />
      <Navbar />
      <SocialIcons />
      <WhatsAppButton />
      {/* Desktop: the 3D character is fixed full-screen and follows the scroll story */}
      {isDesktopView && children}
      <div className="container-main">
        {/* Mobile / tablet: the character lives inside the hero */}
        <Landing>{!isDesktopView && children}</Landing>
        <About />
        <WhatIDo />
        <Career />
        <Work />
        <TechStackNew />
        <CallToAction />
        <Contact />
      </div>
    </div>
  );
};

export default MainContainer;
