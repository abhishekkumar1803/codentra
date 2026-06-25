import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/shared/providers/auth-provider';
import { QueryProvider } from '@/shared/providers/query-provider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Codentra — Learn. Compete. Grow.',
  description:
    'Participate in DSA contests, competitive programming, system design challenges, and accelerate your developer career. Starting at ₹49/month.',
  openGraph: {
    title: 'Codentra — Learn. Compete. Grow.',
    description:
      'The all-in-one platform for developers to practice, compete, and grow their careers.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Codentra',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Codentra — Learn. Compete. Grow.',
    description:
      'DSA contests, competitive programming, system design, and career services for developers.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
