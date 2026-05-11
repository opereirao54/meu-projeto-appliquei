import React from 'react';
import './globals.css';
import { Figtree, DM_Mono } from 'next/font/google';

const figtree = Figtree({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-figtree',
});

const dmMono = DM_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-mono',
});

export const metadata = {
  title: 'Appliquei — Inteligência Financeira',
  description: 'Sistema modular de gestão financeira e investimentos.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${figtree.variable} ${dmMono.variable}`}>
      <body style={{ 
        margin: 0, 
        background: 'var(--cor-bg-primaria, #f4f7f4)', 
        color: 'var(--cor-texto-principal, #101e13)',
        fontFamily: 'var(--font-figtree), sans-serif',
        display: 'flex',
        minHeight: '100vh'
      }}>
        {/* Sidebar Navigation */}
        <nav style={{
          width: '240px',
          background: '#0f172a',
          color: '#fff',
          padding: '32px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh'
        }}>
          {/* Logo */}
          <div style={{ padding: '0 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', background: '#10b981', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>A</div>
            <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px' }}>Appliquei</span>
          </div>

          {/* Menu */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <NavItem href="/dashboard" icon="📊" label="Dashboard" />
            <NavItem href="/controle" icon="💰" label="Controle" />
            <NavItem href="/dividendos" icon="📈" label="Dividendos" />
            <NavItem href="/simulador" icon="♾️" label="Simulador" />
            <NavItem href="/sonhos" icon="🌈" label="Sonhos" />
          </div>

          <div style={{ marginTop: 'auto', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', fontSize: '12px' }}>
            <div style={{ opacity: 0.5, marginBottom: '4px' }}>Versão</div>
            <div style={{ fontWeight: 600 }}>v14.0 Modular</div>
          </div>
        </nav>

        {/* Main Content */}
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </body>
    </html>
  );
}

function NavItem({ href, icon, label }: any) {
  return (
    <a 
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        borderRadius: '10px',
        color: 'rgba(255,255,255,0.7)',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: 600,
        transition: 'all 0.2s'
      }}
      className="nav-item-hover"
    >
      <span style={{ fontSize: '18px' }}>{icon}</span>
      {label}
    </a>
  );
}
