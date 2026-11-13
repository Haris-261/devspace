import React from 'react';
import {
  Atom,
  Binary,
  Bot,
  Box,
  Boxes,
  Braces,
  Brain,
  Brush,
  Bug,
  Cable,
  Chrome,
  Cloud,
  Code,
  Code2,
  Coffee,
  Cog,
  Command,
  Component,
  Container,
  Cpu,
  CreditCard,
  Database,
  FileCode,
  Figma,
  Flame,
  GitBranch,
  GitMerge,
  Github,
  Globe,
  HardDrive,
  Image,
  KeyRound,
  Laptop,
  Layers,
  Layout,
  LayoutDashboard,
  Lock,
  Mail,
  Monitor,
  Network,
  Package,
  Palette,
  PenTool,
  Puzzle,
  Rocket,
  Search,
  Send,
  Server,
  Settings,
  Share2,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Table,
  Terminal,
  TestTube,
  Triangle,
  Webhook,
  Workflow,
  Wrench,
  Zap,
  AppWindow,
  BrainCircuit,
  CircuitBoard,
  CloudCog,
  CodeXml,
  Codepen,
  Codesandbox,
  DatabaseZap,
  FileJson,
  FileJson2,
  Fingerprint,
  Gitlab,
  GitCommitHorizontal,
  GitFork,
  GitPullRequest,
  Link,
  Microchip,
  MemoryStick,
  Radio,
  Regex,
  ServerCog,
  SquareTerminal,
  Wifi,
  Webcam,
  Layers2,
} from 'lucide-react';

import type { LucideProps } from 'lucide-react';

/**
 * HOW TO ADD A NEW SKILL ICON:
 * 1. Add an entry to SKILL_MAP below with the normalized name as the key (lowercase, no spaces, no dots, no dashes).
 * 2. Assign any Lucide icon component or custom SVG icon component.
 * Example:
 *   kubernetes: Box,
 *   graphql: Network,
 */

export type IconComponent = React.ComponentType<LucideProps>;

/**
 * Icons an admin can pick via the skill's "Icon key" field (case-insensitive,
 * e.g. "Database", "cloud", "git-branch"). Keep in sync with the suggestion
 * list in admin/src/components/Manager.tsx (SKILL_ICON_NAMES).
 */
const ICON_KEY_MAP: Record<string, IconComponent> = {
  appwindow: AppWindow,
  braincircuit: BrainCircuit,
  circuitboard: CircuitBoard,
  cloudcog: CloudCog,
  codexml: CodeXml,
  codepen: Codepen,
  codesandbox: Codesandbox,
  databasezap: DatabaseZap,
  filejson: FileJson,
  filejson2: FileJson2,
  fingerprint: Fingerprint,
  gitlab: Gitlab,
  gitcommithorizontal: GitCommitHorizontal,
  gitfork: GitFork,
  gitpullrequest: GitPullRequest,
  link: Link,
  microchip: Microchip,
  memorystick: MemoryStick,
  radio: Radio,
  regex: Regex,
  servercog: ServerCog,
  squareterminal: SquareTerminal,
  wifi: Wifi,
  webcam: Webcam,
  layers2: Layers2,
  atom: Atom,
  binary: Binary,
  bot: Bot,
  box: Box,
  boxes: Boxes,
  braces: Braces,
  brain: Brain,
  brush: Brush,
  bug: Bug,
  cable: Cable,
  chrome: Chrome,
  cloud: Cloud,
  code: Code,
  code2: Code2,
  coffee: Coffee,
  cog: Cog,
  command: Command,
  component: Component,
  container: Container,
  cpu: Cpu,
  creditcard: CreditCard,
  database: Database,
  filecode: FileCode,
  figma: Figma,
  flame: Flame,
  gitbranch: GitBranch,
  gitmerge: GitMerge,
  github: Github,
  globe: Globe,
  harddrive: HardDrive,
  image: Image,
  keyround: KeyRound,
  laptop: Laptop,
  layers: Layers,
  layout: Layout,
  layoutdashboard: LayoutDashboard,
  lock: Lock,
  mail: Mail,
  monitor: Monitor,
  network: Network,
  package: Package,
  palette: Palette,
  pentool: PenTool,
  puzzle: Puzzle,
  rocket: Rocket,
  search: Search,
  send: Send,
  server: Server,
  settings: Settings,
  share2: Share2,
  shield: Shield,
  shieldcheck: ShieldCheck,
  smartphone: Smartphone,
  sparkles: Sparkles,
  table: Table,
  terminal: Terminal,
  testtube: TestTube,
  triangle: Triangle,
  webhook: Webhook,
  workflow: Workflow,
  wrench: Wrench,
  zap: Zap,
};

// Explicit normalized key -> icon mapping
const SKILL_MAP: Record<string, IconComponent> = {
  // Frontend
  html: FileCode,
  html5: FileCode,
  css: Layout,
  css3: Layout,
  javascript: Binary,
  js: Binary,
  typescript: Binary,
  ts: Binary,
  react: Atom,
  reactjs: Atom,
  next: Triangle,
  nextjs: Triangle,
  tailwind: Layout,
  tailwindcss: Layout,
  redux: Layers,
  responsivewebdesign: Smartphone,
  responsivedesign: Smartphone,

  // Backend & APIs
  node: Server,
  nodejs: Server,
  express: Server,
  expressjs: Server,
  nest: Server,
  nestjs: Server,
  python: Terminal,
  restapi: Webhook,
  restapis: Webhook,
  apiintegration: Network,
  apis: Network,
  api: Network,
  graphql: Network,
  postman: Send,

  // Databases & ORMs
  mongodb: Database,
  mongoose: Database,
  sql: Database,
  sqlfundamentals: Database,
  mysql: Database,
  postgresql: Database,
  postgres: Database,

  // Auth & Security
  authentication: ShieldCheck,
  authorization: ShieldCheck,
  authenticationandauthorization: ShieldCheck,
  jwt: KeyRound,
  auth: ShieldCheck,

  // AI & Automation
  ai: Sparkles,
  aiautomation: Workflow,
  aichatbot: Bot,
  aichatbotintegration: Bot,
  gemini: Sparkles,
  geminiapi: Sparkles,
  geminiapiintegration: Sparkles,
  openai: Sparkles,
  webscraping: Search,
  scraping: Search,
  automation: Workflow,

  // Tools & Platforms
  git: GitBranch,
  github: Github,
  vercel: Triangle,
  cloudinary: Cloud,
  stripe: CreditCard,
  stripeintegration: CreditCard,
  docker: Box,
  firebase: Flame,
};

/**
 * Normalizes a skill name for fuzzy matching:
 * lowercase, trims, removes spaces, dots, dashes, underscores, and trailing "js".
 */
export function normalizeSkillName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[\s.\-_/]+/g, '')
    .replace(/(?:js)+$/, '');
}

/**
 * Resolves an icon for any dynamic skill:
 * 0. The admin's "Icon key" if it matches ICON_KEY_MAP.
 * 1. Direct match in SKILL_MAP with normalized name.
 * 2. Keyword heuristics (api, auth, ai, scrap, design, database).
 * 3. Fallback to Code2.
 */
export function resolveSkillIcon(skill: { name: string; icon?: string }): {
  Icon: IconComponent;
  isFallback: boolean;
} {
  // 0. Admin-chosen icon key wins when it names a known icon
  const iconKey = (skill.icon || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (iconKey && ICON_KEY_MAP[iconKey]) {
    return { Icon: ICON_KEY_MAP[iconKey], isFallback: false };
  }

  const raw = skill.name || '';
  const normalized = normalizeSkillName(raw);

  // 1. Direct map check
  if (SKILL_MAP[normalized]) {
    return { Icon: SKILL_MAP[normalized], isFallback: false };
  }

  // Also check without stripping 'js' (e.g. nextjs, expressjs)
  const strippedWithoutJs = raw.toLowerCase().trim().replace(/[\s.\-_/]+/g, '');
  if (SKILL_MAP[strippedWithoutJs]) {
    return { Icon: SKILL_MAP[strippedWithoutJs], isFallback: false };
  }

  // 2. Keyword heuristics (check scraping first so "scraping" doesn't hit "api")
  const lower = raw.toLowerCase();
  if (lower.includes('scrap') || lower.includes('crawl')) {
    return { Icon: Search, isFallback: false };
  }
  if (/\bapi\b|apis|endpoint|rest/i.test(raw)) {
    return { Icon: Webhook, isFallback: false };
  }
  if (lower.includes('auth') || lower.includes('jwt') || lower.includes('security')) {
    return { Icon: ShieldCheck, isFallback: false };
  }
  if (
    lower.includes('ai') ||
    lower.includes('gpt') ||
    lower.includes('gemini') ||
    lower.includes('chatbot') ||
    lower.includes('bot') ||
    lower.includes('automation')
  ) {
    return { Icon: lower.includes('bot') || lower.includes('chat') ? Bot : Sparkles, isFallback: false };
  }
  if (lower.includes('design') || lower.includes('responsive') || lower.includes('ui')) {
    return { Icon: Smartphone, isFallback: false };
  }
  if (lower.includes('database') || lower.includes('sql') || lower.includes('data')) {
    return { Icon: Database, isFallback: false };
  }

  // 3. Generic fallback
  return { Icon: Code2, isFallback: true };
}
