import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/rajdhani/500.css';
import '@fontsource/rajdhani/600.css';
import './globals.css';
import './effects.css';
import './motion.css';
import './visual-effects.css';

const aquire = localFont({
  src: '../fonts/Aquire-Regular.otf',
  variable: '--font-aquire',
  display: 'swap',
  weight: '400',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://muhammad-haris.vercel.app'),
  title: 'Muhammad Haris — Software Engineer & Full-Stack Developer',
  description: 'Portfolio of Muhammad Haris, a Software Engineer, MERN Stack Developer, and Backend Engineer specializing in scalable web applications, REST APIs, and modern frontend architecture.',
  keywords: [
    'Muhammad Haris',
    'Software Engineer',
    'MERN Stack Developer',
    'Backend Engineer',
    'Full Stack Developer',
    'Next.js Developer',
    'NestJS Developer',
    'Node.js Developer',
    'Portfolio',
    'Web Developer',
  ],
  authors: [{ name: 'Muhammad Haris', url: 'https://github.com/Haris-261' }],
  creator: 'Muhammad Haris',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'google-site-verification-code',
  },
  openGraph: {
    title: 'Muhammad Haris — Software Engineer & Full-Stack Developer',
    description: 'Portfolio of Muhammad Haris, a Software Engineer, MERN Stack Developer, and Backend Engineer building dependable full-stack products.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Muhammad Haris Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Muhammad Haris — Software Engineer',
    description: 'Portfolio of Muhammad Haris, a Software Engineer, MERN Stack Developer, and Backend Engineer.',
  },
};

export const viewport: Viewport = {
  themeColor: '#0d0b14',
};

function bootUnit(i: number, salt: number) {
  const n = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const sparks = Array.from({ length: 70 }, (_, i) => ({
    left: `${(bootUnit(i, 1) * 100).toFixed(3)}%`,
    delay: `${(bootUnit(i, 2) * 1.2).toFixed(3)}s`,
    duration: `${(2.2 + bootUnit(i, 3) * 1.8).toFixed(3)}s`,
    size: `${(2 + bootUnit(i, 4) * 4).toFixed(2)}px`,
  }));

  return (
    <html lang="en" className={aquire.variable}>
      <head />
      <body>
        <script dangerouslySetInnerHTML={{ __html: 'window.__bootStart=Date.now()' }} />
        <div id="boot-loader" className="loader" aria-hidden="true">
          <div className="preloader-particles">
            {sparks.map((p, i) => (
              <span key={i} className="preloader-particle" style={{ left: p.left, animationDelay: p.delay, animationDuration: p.duration, width: p.size, height: p.size }} />
            ))}
          </div>
          <div className="loader-center">
            <h1><b>Muhammad</b> <span>Haris</span></h1>
            <div className="loader-sub"><i /> PERSONAL PORTFOLIO <i /></div>
            <div className="loader-track"><span className="boot-fill" /></div>
            <div id="loader-steps" className="loader-steps">
              {['IDEATE.', 'DESIGN.', 'DEVELOP.', 'INNOVATE.'].map((x, i) => <em style={{ ['--w' as string]: i }} key={x}>{x}</em>)}
            </div>
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
