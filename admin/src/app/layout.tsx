import type { Metadata } from 'next';
import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/600.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Portfolio Admin — Muhammad Haris',
  description: 'Administrative control panel for Muhammad Haris portfolio',
  icons: {
    icon: '/icon',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
