/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        figtree: ['Figtree', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        // Sidebar dark tokens (sempre escura)
        sb: {
          bg: '#0b1410',
          bg2: '#111c17',
          border: '#1c2e24',
          text: '#8aab94',
          textActive: '#f0faf4',
          accent: '#10b981',
          accentDim: 'rgba(16,185,129,0.10)',
          accentBorder: 'rgba(16,185,129,0.22)',
          hover: 'rgba(255,255,255,0.04)',
          groupLabel: '#3d6050',
          footerBg: '#0d1813',
        },
        // Main área - Light mode
        main: {
          fundo: '#f2f5f2',
          branco: '#ffffff',
          superficie: '#edf0ed',
          textoPrincipal: '#101e13',
          textoSecundario: '#3b5440',
          textoMutado: '#7a9480',
          borda: '#dfe7e0',
          borda2: '#c4d2c7',
        },
        primary: {
          DEFAULT: '#059669',
          hover: '#047857',
          light: '#34d399',
          lighter: '#6ee7b7',
        },
        info: {
          DEFAULT: '#2563eb',
          light: '#60a5fa',
        },
        patrimonio: {
          DEFAULT: '#7c3aed',
          light: '#a78bfa',
        },
        erro: {
          DEFAULT: '#dc2626',
          light: '#f87171',
        },
        cartao: {
          DEFAULT: '#d97706',
          light: '#fbbf24',
        },
        // Background variants
        bg: {
          primaria: '#ecfdf5',
          info: '#eff6ff',
          erro: '#fef2f2',
          amber: '#fffbeb',
        },
        borda: {
          primaria: '#6ee7b7',
          info: '#bfdbfe',
          erro: '#fecaca',
          amber: '#fde68a',
        },
        txt: {
          primaria: '#065f46',
          info: '#1e40af',
          erro: '#991b1b',
          amber: '#92400e',
        },
      },
      borderRadius: {
        DEFAULT: '14px',
        sm: '9px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.05)',
        hover: '0 2px 6px rgba(0,0,0,0.06), 0 14px 32px rgba(0,0,0,0.08)',
        suave: '0 1px 3px rgba(0,0,0,0.04)',
        media: '0 4px 16px rgba(0,0,0,0.06)',
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
    },
  },
  plugins: [],
}
