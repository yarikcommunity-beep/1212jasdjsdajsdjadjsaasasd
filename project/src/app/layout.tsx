import type { Metadata } from 'next';
import '../styles/darkmoon.css';

export const metadata: Metadata = {
  title: 'D@rkmoon',
  description: 'Anonymous monochrome cosmic landing with scroll-driven black-hole animation.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
