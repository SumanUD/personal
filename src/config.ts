// ─────────────────────────────────────────────────────────────
//  Site content lives here. Edit this file to update the site.
// ─────────────────────────────────────────────────────────────

const whatsappNumber = "918348961318"; // country code + number, digits only

export const config = {
    site: {
        url: "https://sumanbanik.com",
    },
    developer: {
        name: "Suman",
        fullName: "Suman Banik",
        initials: "SB",
        title: "Shopify Expert, Full-Stack & AI Engineer",
        description:
            "Shopify expert, full-stack developer and AI/ML engineer with 6+ years of experience building high-converting stores, scalable web apps, intelligent automation and business software like HRMS.",
        // Rotating words in the hero (accent line / white line)
        rolesAccent: ["Shopify", "Full-Stack"],
        rolesSecondary: ["Expert", "AI Engineer"],
    },
    social: {
        email: "baniksuman918@gmail.com",
        location: "Dooars, West Bengal, India",
    },
    whatsapp: {
        number: whatsappNumber,
        display: "+91 83489 61318",
        link: (text = "Hi Suman, I found your portfolio and would like to discuss a project.") =>
            `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`,
    },
    about: {
        title: "About Me",
        description:
            "I'm Suman, a B.Tech engineer from the foothills of the Dooars with 6+ years of shipping real products. I build advanced Shopify stores, custom themes and apps, full-stack web platforms, and AI/ML systems that automate real business work. I also design and build my own software products, including a complete HRMS. Whether you need a store that sells, a SaaS that scales or AI that saves hours every week, I take it from idea to launch.",
    },
    stats: [
        { value: "6+", label: "Years experience" },
        { value: "B.Tech", label: "Engineering" },
        { value: "3-in-1", label: "Shopify · Web · AI" },
    ],
    experiences: [
        {
            position: "Founder & Product Engineer",
            company: "HRMS & In-house Software",
            period: "01",
            location: "India",
            description:
                "Designing, building and shipping my own software products, including a full-featured HRMS, used by real businesses to run their day-to-day operations.",
            responsibilities: [],
            technologies: ["SaaS", "React", "Node.js", "PostgreSQL"],
        },
        {
            position: "AI & ML Engineer",
            company: "Client & Product Work",
            period: "02",
            location: "Remote",
            description:
                "Building LLM-powered assistants, chatbots, RAG pipelines, predictive models and automation that plug straight into existing business workflows.",
            responsibilities: [],
            technologies: ["Python", "PyTorch", "TensorFlow", "LLMs"],
        },
        {
            position: "Shopify Expert",
            company: "Stores, Themes & Apps",
            period: "03",
            location: "Remote",
            description:
                "Custom OS 2.0 themes, Liquid, Shopify apps, Plus & headless (Hydrogen) builds, checkout extensions, migrations and speed optimisation for brands worldwide.",
            responsibilities: [],
            technologies: ["Liquid", "Shopify Apps", "Hydrogen", "Plus"],
        },
        {
            position: "Full-Stack Developer",
            company: "Freelance & Agency Projects",
            period: "04",
            location: "Remote",
            description:
                "End-to-end web apps, dashboards and APIs with React, Next.js, Node.js and modern databases, from pixel-perfect UI to cloud deployment.",
            responsibilities: [],
            technologies: ["React", "Next.js", "Node.js", "MongoDB"],
        },
        {
            position: "B.Tech in Engineering",
            company: "Education",
            period: "05",
            location: "India",
            description:
                "Strong engineering foundations in programming, data structures, algorithms and systems design: the base everything else is built on.",
            responsibilities: [],
            technologies: [],
        },
    ],
    projects: [
        {
            id: 1,
            title: "Drishti",
            category: "AI / LLM",
            technologies: "Python, PyTorch, Transformers, FastAPI, React, MongoDB",
            image: "/images/drishti.png",
            description: "Bangladesh's first intelligent advanced AI chatbot powered by a custom Large Language Model. Features natural language understanding, contextual conversations, and multilingual support including Bengali."
        },
        {
            id: 2,
            title: "VoteChain",
            category: "Blockchain",
            technologies: "Solidity, Web3.js, React, Ethereum, IPFS, MetaMask, Node.js",
            image: "/images/votechain.png",
            description: "A decentralized election system built on blockchain technology ensuring transparent, tamper-proof, and verifiable voting. Features smart contracts for vote integrity and real-time result tracking."
        },
        {
            id: 3,
            title: "EIE - Earthquake Impact Estimator",
            category: "IoT / Hardware",
            technologies: "Arduino, C++, IoT Sensors, Python, ML, React",
            image: "/images/eie.png",
            description: "A practical circuit-based IoT system utilizing Arduino to predict earthquakes before they strike. Integrates hardware sensors for real-time seismic detection and impact estimation."
        },
        {
            id: 4,
            title: "GameKroy",
            category: "Full Stack",
            technologies: "React, Node.js, MongoDB, Express, Stripe, TailwindCSS",
            image: "/images/gamekroy.png",
            description: "A full-featured e-commerce platform for gaming products. Includes user authentication, product catalog, shopping cart, secure payments, order tracking, and admin dashboard."
        },
        {
            id: 5,
            title: "RedxChess",
            category: "AI / Game Engine",
            technologies: "Python, C++, Neural Networks, Bitboards, UCI Protocol",
            image: "/images/redxchess.png",
            description: "A high-performance chess engine rated 3640 ELO. Features advanced search algorithms, neural network evaluation, and optimized bitboard representation for lightning-fast move generation."
        },
        {
            id: 6,
            title: "Floodhub",
            category: "AI / ML",
            technologies: "Python, TensorFlow, Pandas, React, FastAPI, GIS",
            image: "/images/floodhub.png",
            description: "A flood prediction model specifically designed for Bangladesh's river systems. Analyzes weather patterns, water levels, and historical data to provide accurate flood forecasts and alerts."
        },
        {
            id: 7,
            title: "Phoenix",
            category: "AI Assistant",
            technologies: "Python, Speech Recognition, PyAutoGUI, OpenAI API, Tkinter",
            image: "/images/phoenix.png",
            description: "A JARVIS-inspired personal AI desktop assistant. Controls system functions, manages tasks, answers queries, automates workflows, and provides voice-activated computing experience."
        },
        {
            id: 8,
            title: "HekTools",
            category: "Security / Android",
            technologies: "Kotlin, Android SDK, Firebase, Python, Encryption",
            image: "/images/hektools.png",
            description: "An advanced Android monitoring and security research tool. Features remote device management, activity logging, and encrypted data transmission for security testing purposes."
        }
    ],
    contact: {
        email: "baniksuman918@gmail.com",
        // Leave a link empty ("") to hide it everywhere on the site.
        github: "",
        linkedin: "",
        twitter: "",
        facebook: "",
        instagram: "",
    },
    skills: {
        develop: {
            title: "SHOPIFY EXPERT",
            description: "Stores that load fast and sell more",
            details:
                "Custom OS 2.0 themes, Shopify apps, Shopify Plus, headless Hydrogen storefronts, checkout extensions, Functions, migrations and conversion-focused speed optimisation.",
            tools: ["Liquid", "OS 2.0 Themes", "Shopify Apps", "Remix", "Hydrogen", "Shopify Plus", "Functions", "Checkout UI", "Storefront API", "Migrations"],
        },
        design: {
            title: "FULL-STACK & AI",
            description: "Web apps, SaaS & intelligent automation",
            details:
                "Scalable web platforms and business software (like my own HRMS), plus AI/ML: LLM agents, chatbots, RAG, computer vision and predictive models built into real products.",
            tools: ["React", "Next.js", "Node.js", "TypeScript", "Python", "PyTorch", "TensorFlow", "LLMs & RAG", "PostgreSQL", "Docker"],
        },
    },
};
