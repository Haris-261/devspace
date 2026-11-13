import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { getPortfolio } from '@/lib/api';
import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/rajdhani/500.css';
import '@fontsource/rajdhani/600.css';
import './globals.css';
import './effects.css';
import './motion.css';
import './visual-effects.css';
import WhatsAppButton from '@/components/WhatsAppButton';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

const aquire = localFont({
  src: '../fonts/Aquire-Regular.otf',
  variable: '--font-aquire',
  display: 'swap',
  weight: '400',
});

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

export default async function Layout({ children }: { children: React.ReactNode }) {
  const portfolio = await getPortfolio().catch(() => null);
  const serverWords: string[] = portfolio?.profile?.loaderWords?.length
    ? portfolio.profile.loaderWords
    : ['Plan', 'Design', 'Develop', 'Innovate'];

  // Split fullName into first + rest for bold/accent styling
  const fullName = portfolio?.profile?.fullName || 'Muhammad Haris';
  const nameParts = fullName.trim().split(' ');
  const firstName = nameParts[0] || 'Muhammad';
  const lastName = nameParts.slice(1).join(' ') || 'Haris';

  const loaderSubtitle = portfolio?.profile?.loaderSubtitle || 'PERSONAL PORTFOLIO';

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
        <div id="boot-loader" className="loader" aria-hidden="true" suppressHydrationWarning>
          <div className="preloader-particles">
            {sparks.map((p, i) => (
              <span key={i} className="preloader-particle" style={{ left: p.left, animationDelay: p.delay, animationDuration: p.duration, width: p.size, height: p.size }} />
            ))}
          </div>
          <div className="loader-center">
            <h1><b>{firstName}</b> <span>{lastName}</span></h1>
            <div className="loader-sub"><i /> {loaderSubtitle.trim().toUpperCase()} <i /></div>
            <div className="loader-track"><span className="boot-fill" /></div>
            <div id="loader-steps" className="loader-steps" suppressHydrationWarning>
              {serverWords.map((x, i) => (
                <em style={{ ['--w' as string]: i }} key={`${x}-${i}`} suppressHydrationWarning>
                  {x.trim().toUpperCase().replace(/\.*$/, '')}.
                </em>
              ))}
            </div>
          </div>
        </div>
        {children}
        <Analytics />
        <SpeedInsights />
        <WhatsAppButton number={portfolio?.profile?.whatsappNumber} message={portfolio?.profile?.whatsappMessage} />
      </body>
    </html>
  );
}
