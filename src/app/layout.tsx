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
