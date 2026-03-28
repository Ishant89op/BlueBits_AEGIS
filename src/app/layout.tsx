import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'AEGIS - Cyber Infrastructure Defense Console',
  description: 'Project AEGIS: Cybersecurity defense console for detecting Shadow Controllers, sleeper nodes, and compromised infrastructure.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
})
{
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <div className="scanline-overlay" />
          <Sidebar />
          <Navbar />
          <main className="ml-20 pt-16 min-h-screen p-6">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
