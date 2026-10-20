import './globals.css';
import React from 'react';
import { AuthProvider } from '../lib/context/AuthContext';

export const metadata = {
  title: 'TZVA EL - Worship Ministry Management Platform',
  description: 'Production Multi-Choir Worship Ministry Management System for Church Leaders, Choir Admins, and Team Members.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/church-logo.png' },
      { url: '/favicon.ico' }
    ],
    shortcut: '/church-logo.png',
    apple: '/church-logo.png'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/church-logo.png" type="image/png" />
        <link rel="shortcut icon" href="/church-logo.png" />
        <link rel="apple-touch-icon" href="/church-logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-indigo-500 selection:text-white">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
