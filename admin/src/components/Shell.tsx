'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BriefcaseBusiness,
  FolderKanban,
  Gauge,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  MessageSquareQuote,
  Settings,
  Share2,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';
import { api } from '@/lib/api';

const links = [
  ['/dashboard', 'Dashboard', Gauge],
  ['/projects', 'Projects', FolderKanban],
  ['/experience', 'Experience', BriefcaseBusiness],
  ['/skills', 'Skills', Sparkles],
  ['/testimonials', 'Testimonials', MessageSquareQuote],
  ['/profile', 'Profile', UserRound],
  ['/social-links', 'Social Links', Share2],
  ['/messages', 'Messages', Mail],
  ['/whatsapp', 'WhatsApp', MessageCircle],
  ['/settings', 'Settings', Settings],
] as const;

export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api('/auth/me')
      .then(() => setReady(true))
      .catch(() => router.replace('/login'));
  }, [router]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setOpen(false);
      };
      window.addEventListener('keydown', onKey);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', onKey);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [open]);

  async function logout() {
    await api('/auth/logout', { method: 'POST' }).catch(() => {});
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
    }
    router.replace('/login');
  }

  if (!ready) return <div className="loading">AUTHENTICATING…</div>;

  return (
    <div className="admin">
      <div
        className={`aside-backdrop${open ? ' open' : ''}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <aside className={open ? 'open' : ''} aria-label="Admin Navigation">
        <div className="aside-head">
          <span className="logo">MH</span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close navigation menu"
            className="aside-close"
          >
            <X size={20} />
          </button>
        </div>
        <p className="aside-label">PORTFOLIO ADMIN</p>
        <nav>
          {links.map(([href, label, Icon]) => (
            <Link
              className={path === href ? 'active' : ''}
              key={href}
              href={href}
              onClick={() => setOpen(false)}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <button className="logout" onClick={logout}>
          <LogOut size={18} />
          Logout
        </button>
      </aside>
      <div className="workspace">
        <header>
          <button
            className="mobile-menu"
            onClick={() => setOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={open}
          >
            <Menu size={22} />
          </button>
          <div>
            <span>CONTROL CENTER</span>
            <strong>Muhammad Haris</strong>
          </div>
          <i />
        </header>
        {children}
      </div>
    </div>
  );
}

