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
  title: 'Muhammad Haris — Software Engineer',
  description: 'Portfolio of Muhammad Haris, a MERN Stack Developer and Backend Engineer building dependable full-stack products.',
  openGraph: { title: 'Muhammad Haris — Software Engineer', description: 'MERN Stack Developer, Backend Engineer, and builder of scalable software.', type: 'website' },
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
