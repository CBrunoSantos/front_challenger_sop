"use client";
import "./globals.css";
import '@mantine/core/styles.css';
import Providers from '@/app/provider';

export default function RootLayout({ children}: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
