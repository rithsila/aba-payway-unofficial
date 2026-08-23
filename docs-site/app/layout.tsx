import './global.css';
import { RootProvider } from 'fumadocs-ui/provider';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'ABA PayWay SDK (Unofficial) — Documentation',
  description: 'Unofficial TypeScript SDK for ABA PayWay payment gateway in Cambodia. KHQR, purchases, and webhooks.',
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen" suppressHydrationWarning>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
