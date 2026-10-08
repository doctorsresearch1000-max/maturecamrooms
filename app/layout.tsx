import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MatureCamRooms - Live Mature & MILF Cams',
  description: 'Discover top-rated live adult performers in high definition.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white antialiased">{children}</body>
    </html>
  );
}
