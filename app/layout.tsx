import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Monster Quiz',
  description: 'Real-time interactive conference quiz',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-ink text-mist font-oscar antialiased">{children}</body>
    </html>
  );
}
