/**
 * Central Icon Registry for Portfolio UI Components
 *
 * HOW TO ADD A NEW ICON MAPPING:
 * 1. To map a new navigation item:
 *    - Import the desired icon from 'react-icons/lu' or 'react-icons/pi'.
 *    - Add a key-value pair to `NAV_ICONS` with the lowercase label.
 *
 * 2. To map a new social / external platform:
 *    - Import the brand icon from 'react-icons/fa6' (or Phosphor if applicable).
 *    - Add the platform identifier to `SOCIAL_ICONS` (e.g. reddit: FaRedditAlien).
 *    - Add keyword/URL matching logic in `getSocialIcon` if needed.
 */

import type React from 'react';

import {
  LuLayers,
  LuMenu,
  LuX,
} from 'react-icons/lu';

import {
  PiArrowUpBold,
  PiArrowUpRightBold,
  PiBriefcaseDuotone,
  PiEnvelopeSimpleDuotone,
  PiFolderOpenDuotone,
  PiGlobeDuotone,
  PiHouseDuotone,
  PiLinkDuotone,
  PiQuotesFill,
  PiShareNetworkDuotone,
  PiStar,
  PiStarFill,
  PiUserDuotone,
} from 'react-icons/pi';

import {
  FaBehance,
  FaDiscord,
  FaDribbble,
  FaFacebookF,
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaMedium,
  FaStackOverflow,
  FaTelegram,
  FaUpwork,
  FaWhatsapp,
  FaXTwitter,
  FaYoutube,
} from 'react-icons/fa6';

export type IconComponent = React.ComponentType<{ size?: number; color?: string; className?: string; [key: string]: any }>;

export const NAV_ICONS: Record<string, IconComponent> = {
  home: PiHouseDuotone,
  about: PiUserDuotone,
  experience: PiBriefcaseDuotone,
  projects: PiFolderOpenDuotone,
  skills: LuLayers,
  profiles: PiShareNetworkDuotone,
  contact: PiEnvelopeSimpleDuotone,
};

export const UI_ICONS = {
  menu: LuMenu,
  close: LuX,
  menuClosed: LuMenu,
  menuOpen: LuX,
  backToTop: PiArrowUpBold,
  externalLink: PiArrowUpRightBold,
  fallback: PiLinkDuotone,
  globe: PiGlobeDuotone,
} as const;

export const SOCIAL_ICONS: Record<string, IconComponent> = {
  github: FaGithub,
  linkedin: FaLinkedinIn,
  twitter: FaXTwitter,
  x: FaXTwitter,
  'x.com': FaXTwitter,
  instagram: FaInstagram,
  facebook: FaFacebookF,
  youtube: FaYoutube,
  whatsapp: FaWhatsapp,
  telegram: FaTelegram,
  discord: FaDiscord,
  behance: FaBehance,
  dribbble: FaDribbble,
  medium: FaMedium,
  stackoverflow: FaStackOverflow,
  upwork: FaUpwork,
  fiverr: PiGlobeDuotone, // FaFiverr not in react-icons/fa6, falls back to PiGlobeDuotone
  email: PiEnvelopeSimpleDuotone,
  mail: PiEnvelopeSimpleDuotone,
};

export function getNavIcon(label: string): IconComponent {
  const key = label.toLowerCase().trim();
  return NAV_ICONS[key] || UI_ICONS.fallback;
}

export function getSocialIcon(nameOrUrl?: string): IconComponent {
  if (!nameOrUrl) return UI_ICONS.globe;
  const input = nameOrUrl.toLowerCase().trim();

  if (input.includes('github')) return FaGithub;
  if (input.includes('linkedin')) return FaLinkedinIn;
  if (input.includes('twitter') || input.includes('x.com') || input === 'x') return FaXTwitter;
  if (input.includes('instagram')) return FaInstagram;
  if (input.includes('facebook')) return FaFacebookF;
  if (input.includes('youtube') || input.includes('youtu.be')) return FaYoutube;
  if (input.includes('whatsapp') || input.includes('wa.me')) return FaWhatsapp;
  if (input.includes('telegram') || input.includes('t.me')) return FaTelegram;
  if (input.includes('discord') || input.includes('discord.gg')) return FaDiscord;
  if (input.includes('behance')) return FaBehance;
  if (input.includes('dribbble')) return FaDribbble;
  if (input.includes('medium')) return FaMedium;
  if (input.includes('stackoverflow')) return FaStackOverflow;
  if (input.includes('upwork')) return FaUpwork;
  if (input.includes('mailto:') || input.includes('email') || input === 'mail') return PiEnvelopeSimpleDuotone;
  if (input.includes('fiverr')) return PiGlobeDuotone;

  return SOCIAL_ICONS[input] || UI_ICONS.globe;
}

export { PiQuotesFill, PiStar, PiStarFill };

