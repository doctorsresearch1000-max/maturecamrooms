import './globals.css';
import type { Metadata } from 'node_modules/next';

export const metadata: Metadata = {
  title: 'MatureCamRooms - Live Mature & MILF Cams',
  description: 'Discover top-rated live mature and milf webcam models.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-950 text-white min-h-screen antialiased selection:bg-rose-500 selection:text-white">
        {children}
      </body>
    </html>
  );
};
