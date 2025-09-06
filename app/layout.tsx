import React from 'react';

import { Toaster } from '@/libs/frontend/components/core/sonner';
import { QueryClientWrapper } from '@/libs/frontend/components/QueryClientWrapper';
import { ThemeProvider } from '@/libs/frontend/components/ThemeProvider';
import { ConfigFormProvider } from '@/libs/frontend/components/UserConfigProvider';

// ...existing code...

import type { Metadata, Viewport } from 'next';

import './globals.css';

// Note: These metadata strings should be localized server-side using Next.js i18n
// For now, we'll keep them as constants but could be moved to a metadata translation system
const APP_NAME = 'Dititpin Calculator';
const APP_DEFAULT_TITLE =
  'Dititpin Calculator - Personal Shopper Cost Calculator';
const APP_TITLE_TEMPLATE = '%s - Dititpin Calculator';
const APP_DESCRIPTION =
  'Professional personal shopper cost calculator with multi-currency support for cross-border shopping services (jasa titip)';

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: 'summary',
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="id">
      <body>
        <ConfigFormProvider>
          <ThemeProvider>
            <QueryClientWrapper>
              {children}
              <Toaster />
            </QueryClientWrapper>
          </ThemeProvider>
        </ConfigFormProvider>
      </body>
    </html>
  );
}
