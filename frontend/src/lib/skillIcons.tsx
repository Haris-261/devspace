import React from 'react';
import {
  Atom,
  Binary,
  Bot,
  Box,
  Cloud,
  Code2,
  CreditCard,
  Database,
  FileCode,
  Flame,
  GitBranch,
  Github,
  Globe,
  KeyRound,
  Layers,
  Layout,
  Network,
  Send,
  Server,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Terminal,
  Triangle,
  Webhook,
  Workflow,
  Search,
  Cpu,
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
 * 1. Direct match in SKILL_MAP with normalized name.
 * 2. Keyword heuristics (api, auth, ai, scrap, design, database).
 * 3. Fallback to Code2.
 */
export function resolveSkillIcon(skill: { name: string; icon?: string }): {
  Icon: IconComponent;
  isFallback: boolean;
} {
  // If icon property is specified and valid, it could be extended here
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
