import { config } from "../config";

export type Lang = "markdown" | "typescript" | "json" | "tsx" | "welcome";
export type View = "welcome" | "code" | "about" | "projects" | "project" | "contact" | "start";

export type IdeFile = {
  id: string;
  name: string;
  path: string; // route
  folder?: string;
  lang: Lang;
  view: View;
  /** Raw text shown in the source/code view (also used for search). */
  source: string;
  /** Markdown files can toggle between source and preview. */
  previewable?: boolean;
  defaultPreview?: boolean;
  projectId?: number;
  title: string; // document title
};

const { developer, about, stats, experiences, projects, skills, contact, social, whatsapp } = config;

export const slugify = (title: string) => title.split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9]/g, "");

const q = (s: string) => JSON.stringify(s);

/* ── about.md ───────────────────────────────────────────── */
const aboutMd = `# ${about.title}

> ${developer.title} · ${social.location}

${about.description}

## At a glance

${stats.map((s) => `- **${s.value}** ${s.label}`).join("\n")}

## What I do

### ${skills.develop.title}
_${skills.develop.description}_

${skills.develop.details}

### ${skills.design.title}
_${skills.design.description}_

${skills.design.details}

## Let's talk

- Email: [${contact.email}](mailto:${contact.email})
- WhatsApp: [${whatsapp.display}](${whatsapp.link()})
- Plan a project: [start-project.tsx](/start)
- Or type \`contact\` in the terminal below.
`;

/* ── experience.ts ─────────────────────────────────────── */
const experienceTs = `// Career log: what I build and where.
// Tip: open the Source Control view to see this as a commit history.

type Role = {
  position: string;
  company: string;
  location: string;
  summary: string;
  stack: string[];
};

export const experience: Role[] = [
${experiences
  .map(
    (e) => `  {
    position: ${q(e.position)},
    company: ${q(e.company)},
    location: ${q(e.location)},
    summary: ${q(e.description)},
    stack: [${e.technologies.map(q).join(", ")}],
  },`
  )
  .join("\n")}
];

export const yearsOfExperience = ${parseInt(stats[0].value, 10) || 6};
`;

/* ── skills.json ───────────────────────────────────────── */
const skillsJson = JSON.stringify(
  {
    name: developer.fullName,
    role: developer.title,
    location: social.location,
    availableForWork: true,
    expertise: {
      shopify: {
        tagline: skills.develop.description,
        summary: skills.develop.details,
        tools: skills.develop.tools,
      },
      fullStackAndAI: {
        tagline: skills.design.description,
        summary: skills.design.details,
        tools: skills.design.tools,
      },
    },
  },
  null,
  2
);

/* ── projects ──────────────────────────────────────────── */
const projectMd = (p: (typeof projects)[number]) => `# ${p.title}

\`${p.category}\`

![${p.title}](${p.image})

${p.description}

## Tech stack

${p.technologies
  .split(",")
  .map((t) => `- ${t.trim()}`)
  .join("\n")}
`;

const projectsReadme = `# Projects

A selection of things I've designed and built.

${projects.map((p) => `- [${p.title}](/projects/${slugify(p.title)}): ${p.category}`).join("\n")}
`;

/* ── contact.tsx / start-project.tsx (rendered as forms) ── */
const contactTsx = `export default function Contact() {
  return <Form to="${contact.email}" whatsapp="${whatsapp.display}" />;
}
// Name, email, phone, service, message
// ${social.location}`;

const startTsx = `export default function StartProject() {
  // Service, features, budget, timeline, details
  return <ProjectPlanner reply="within 24 hours" />;
}`;

const siteTitle = `${developer.fullName} | ${developer.title}`;

export const FILES: IdeFile[] = [
  {
    id: "welcome",
    name: "Welcome",
    path: "/",
    lang: "welcome",
    view: "welcome",
    source: `${developer.fullName} ${developer.title} ${developer.description}`,
    title: siteTitle,
  },
  {
    id: "about",
    name: "about.md",
    path: "/about",
    lang: "markdown",
    view: "about",
    source: aboutMd,
    previewable: true,
    defaultPreview: false,
    title: `About · ${siteTitle}`,
  },
  {
    id: "experience",
    name: "experience.ts",
    path: "/experience",
    lang: "typescript",
    view: "code",
    source: experienceTs,
    title: `Experience · ${siteTitle}`,
  },
  {
    id: "skills",
    name: "skills.json",
    path: "/skills",
    lang: "json",
    view: "code",
    source: skillsJson,
    title: `Skills · ${siteTitle}`,
  },
  {
    id: "projects",
    name: "README.md",
    path: "/projects",
    folder: "projects",
    lang: "markdown",
    view: "projects",
    source: projectsReadme,
    previewable: true,
    defaultPreview: true,
    title: `Projects · ${siteTitle}`,
  },
  ...projects.map<IdeFile>((p) => ({
    id: `project-${slugify(p.title)}`,
    name: `${slugify(p.title)}.md`,
    path: `/projects/${slugify(p.title)}`,
    folder: "projects",
    lang: "markdown",
    view: "project",
    source: projectMd(p),
    previewable: true,
    defaultPreview: true,
    projectId: p.id,
    title: `${p.title} · ${siteTitle}`,
  })),
  {
    id: "contact",
    name: "contact.tsx",
    path: "/contact",
    lang: "tsx",
    view: "contact",
    source: contactTsx,
    title: `Contact · ${siteTitle}`,
  },
  {
    id: "start",
    name: "start-project.tsx",
    path: "/start",
    lang: "tsx",
    view: "start",
    source: startTsx,
    title: `Plan your project · ${siteTitle}`,
  },
];

export const fileById = (id: string) => FILES.find((f) => f.id === id);
export const fileByPath = (path: string) => {
  const clean = path.replace(/\/+$/, "") || "/";
  return FILES.find((f) => f.path === clean);
};

export const LANG_LABEL: Record<Lang, string> = {
  markdown: "Markdown",
  typescript: "TypeScript",
  json: "JSON",
  tsx: "TypeScript JSX",
  welcome: "Welcome",
};

/** Old routes from the previous site. */
export const REDIRECTS: Record<string, string> = {
  "/myworks": "/projects",
  "/play": "/start",
  "/work": "/projects",
};
