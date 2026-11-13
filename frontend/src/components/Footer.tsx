'use client';

import { useEffect, useRef, useState } from 'react';
import type { Profile, Social } from '@/lib/types';
import { UI_ICONS, getSocialIcon } from '@/lib/icons';

interface FooterProps {
  profile: Profile;
  socialLinks: Social[];
  role?: string;
  hiddenSections?: string[];
}

const navLinks = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'profiles', label: 'Profiles' },
  { id: 'contact', label: 'Contact' },
];

export default function Footer({ profile, socialLinks, role, hiddenSections = [] }: FooterProps) {
  const footerRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setRevealed(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer ref={footerRef} className={`site-footer ${revealed ? 'revealed' : ''}`}>
      {/* 1. Top gradient divider */}
      <div className="footer-top-divider" aria-hidden="true" />

      <div className="footer-inner">
        {/* 2. CTA band */}
        <div className="footer-cta-band">
          <div className="footer-cta-text">
            <h3>Have a project in mind?</h3>
            <p>Let&apos;s build something reliable together.</p>
          </div>
          <button
            type="button"
            className="footer-cta-btn"
            onClick={() => scrollTo('contact')}
          >
            LET&apos;S CONNECT
          </button>
        </div>

        {/* 3. Main grid */}
        <div className="footer-main-grid">
          {/* Column 1: Brand */}
          <div className="footer-col footer-col-brand">
            <h4 className="footer-brand-name">{profile.fullName || 'Muhammad Haris'}</h4>
            <p className="footer-brand-role">{role || 'Software Engineer / Full-Stack Developer'}</p>
            <p className="footer-brand-desc">
              Building reliable SaaS platforms, scalable web applications, and intelligent automation workflows.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-col footer-col-links">
            <h5 className="footer-col-title">QUICK LINKS</h5>
            <nav aria-label="Footer">
              <ul className="footer-links-list">
                {navLinks.filter((link) => !hiddenSections.includes(link.id)).map((link) => (
                  <li key={link.id}>
                    <a
                      href={`#${link.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollTo(link.id);
                      }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Column 3: Connect */}
          <div className="footer-col footer-col-connect">
            <h5 className="footer-col-title">CONNECT</h5>
            {profile.contactEmail && (
              <a
                href={`mailto:${profile.contactEmail}`}
                className="footer-email-link"
              >
                {profile.contactEmail}
              </a>
            )}
            <div className="footer-social-row">
              {socialLinks
                .filter((s) => s.enabled)
                .map((s) => {
                  const SocialIcon = getSocialIcon(s.icon || s.url || s.label);
                  return (
                    <a
                      key={s._id}
                      href={s.url}
                      target={s.url.startsWith('http') ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      className="footer-social-btn"
                      aria-label={s.label}
                    >
                      <SocialIcon size={22} color="#c084fc" aria-hidden="true" focusable="false" />
                    </a>
                  );
                })}
            </div>
          </div>
        </div>

        {/* 4. Bottom bar */}
        <div className="footer-bottom-bar">
          <p className="footer-copyright">
            &copy; {new Date().getFullYear()} {profile.fullName || 'Muhammad Haris'}. All rights reserved.
          </p>
          <button
            type="button"
            className="footer-back-to-top"
            onClick={scrollToTop}
            aria-label="Back to top"
          >
            <UI_ICONS.backToTop size={22} color="#c084fc" aria-hidden="true" focusable="false" />
          </button>
        </div>
      </div>
    </footer>
  );
}

