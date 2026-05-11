import React from 'react';
import { useCarteiraStore } from '../../store/carteiraStore';
import { useThemeStore } from '../../store/themeStore';
import { Sidebar as SidebarIcon, Sun, Moon, Eye, EyeSlash, Wallet, ChartBar, ArrowLeftRight, CreditCard, Clock, TrendUp } from '@phosphor-icons/react';

interface SidebarProps {
  onNavigate: (path: string) => void;
  currentPath: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate, currentPath }) => {
  const sidebarCollapsed = useCarteiraStore((state) => state.sidebarCollapsed);
  const setSidebarCollapsed = useCarteiraStore((state) => state.setSidebarCollapsed);
  const valoresOcultos = useCarteiraStore((state) => state.valoresOcultos);
  const setValoresOcultos = useCarteiraStore((state) => state.setValoresOcultos);
  const { isDark, toggleTheme } = useThemeStore();

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleToggleValoresOcultos = () => {
    setValoresOcultos(!valoresOcultos);
  };

  return (
    <aside 
      className={`sidebar bg-sb-bg border-r border-sb-border flex flex-col overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'w-16' : 'w-60'
      }`}
      id="mainSidebar"
    >
      {/* Logo Area */}
      <div className="logo-area p-4 border-b border-sb-border flex items-center justify-between">
        <a href="/" className="logo-container flex items-center overflow-hidden">
          <img 
            src={sidebarCollapsed ? '/appliquei_favicon.jpg' : '/appliquei_logo_white.jpg'}
            alt="Appliquei"
            className={`transition-all duration-200 ${
              sidebarCollapsed 
                ? 'w-10 h-10 rounded-lg' 
                : 'w-44 h-auto mix-blend-screen opacity-88'
            }`}
            id="logoPrincipal"
          />
          {!sidebarCollapsed && (
            <span className="logo-txt text-sm font-bold text-sb-accent pl-2 font-syne tracking-tight">
              Appliquei
            </span>
          )}
        </a>
        <button
          onClick={handleToggleSidebar}
          className="sidebar-toggle bg-none border-none cursor-pointer text-sb-text p-1.5 rounded-lg flex items-center justify-center transition-all hover:bg-sb-hover hover:text-sb-textActive"
          id="btnToggleSidebar"
          title={sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          <Sidebar 
            size={20} 
            weight="bold"
            className={sidebarCollapsed ? 'ph-sidebar' : 'ph-sidebar-simple'}
            id="iconToggle"
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="nav-area p-2.5 flex-1">
        {/* Primary Group */}
        <div className="nav-group mb-4">
          {!sidebarCollapsed && (
            <span className="nav-group-label text-[9px] font-bold tracking-widest text-sb-groupLabel uppercase block px-2.5 mb-1.5">
              Principal
            </span>
          )}
          
          <button
            onClick={() => onNavigate('/patrimonio')}
            className={`menu-btn w-full flex items-center gap-2.5 p-2.5 text-left text-sm font-medium rounded-lg transition-all ${
              currentPath === '/patrimonio'
                ? 'bg-sb-accentDim text-sb-accent font-semibold border border-sb-accentBorder'
                : 'text-sb-text hover:bg-sb-hover hover:text-sb-textActive'
            }`}
            data-tooltip={!sidebarCollapsed ? '' : 'Patrimônio'}
          >
            <Wallet size={20} className="flex-shrink-0" />
            {!sidebarCollapsed && <span className="menu-btn-label">Patrimônio</span>}
          </button>
          
          <button
            onClick={() => onNavigate('/carteira')}
            className={`menu-btn w-full flex items-center gap-2.5 p-2.5 text-left text-sm font-medium rounded-lg transition-all ${
              currentPath === '/carteira'
                ? 'bg-sb-accentDim text-sb-accent font-semibold border border-sb-accentBorder'
                : 'text-sb-text hover:bg-sb-hover hover:text-sb-textActive'
            }`}
            data-tooltip={!sidebarCollapsed ? '' : 'Carteira'}
          >
            <ChartBar size={20} className="flex-shrink-0" />
            {!sidebarCollapsed && <span className="menu-btn-label">Carteira</span>}
          </button>
        </div>

        {/* Transações Group */}
        <div className="nav-group mb-4">
          {!sidebarCollapsed && (
            <span className="nav-group-label text-[9px] font-bold tracking-widest text-sb-groupLabel uppercase block px-2.5 mb-1.5">
              Transações
            </span>
          )}
          
          <button
            onClick={() => onNavigate('/operacoes')}
            className={`menu-btn w-full flex items-center gap-2.5 p-2.5 text-left text-sm font-medium rounded-lg transition-all ${
              currentPath === '/operacoes'
                ? 'bg-sb-accentDim text-sb-accent font-semibold border border-sb-accentBorder'
                : 'text-sb-text hover:bg-sb-hover hover:text-sb-textActive'
            }`}
            data-tooltip={!sidebarCollapsed ? '' : 'Operações'}
          >
            <ArrowLeftRight size={20} className="flex-shrink-0" />
            {!sidebarCollapsed && <span className="menu-btn-label">Operações</span>}
          </button>
          
          <button
            onClick={() => onNavigate('/cartoes')}
            className={`menu-btn w-full flex items-center gap-2.5 p-2.5 text-left text-sm font-medium rounded-lg transition-all ${
              currentPath === '/cartoes'
                ? 'bg-sb-accentDim text-sb-accent font-semibold border border-sb-accentBorder'
                : 'text-sb-text hover:bg-sb-hover hover:text-sb-textActive'
            }`}
            data-tooltip={!sidebarCollapsed ? '' : 'Cartões'}
          >
            <CreditCard size={20} className="flex-shrink-0" />
            {!sidebarCollapsed && <span className="menu-btn-label">Cartões</span>}
          </button>
        </div>

        {/* Análise Group */}
        <div className="nav-group mb-4">
          {!sidebarCollapsed && (
            <span className="nav-group-label text-[9px] font-bold tracking-widest text-sb-groupLabel uppercase block px-2.5 mb-1.5">
              Análise
            </span>
          )}
          
          <button
            onClick={() => onNavigate('/timeline')}
            className={`menu-btn w-full flex items-center gap-2.5 p-2.5 text-left text-sm font-medium rounded-lg transition-all ${
              currentPath === '/timeline'
                ? 'bg-sb-accentDim text-sb-accent font-semibold border border-sb-accentBorder'
                : 'text-sb-text hover:bg-sb-hover hover:text-sb-textActive'
            }`}
            data-tooltip={!sidebarCollapsed ? '' : 'Timeline'}
          >
            <Clock size={20} className="flex-shrink-0" />
            {!sidebarCollapsed && <span className="menu-btn-label">Timeline</span>}
          </button>
          
          <button
            onClick={() => onNavigate('/proventos')}
            className={`menu-btn w-full flex items-center gap-2.5 p-2.5 text-left text-sm font-medium rounded-lg transition-all ${
              currentPath === '/proventos'
                ? 'bg-sb-accentDim text-sb-accent font-semibold border border-sb-accentBorder'
                : 'text-sb-text hover:bg-sb-hover hover:text-sb-textActive'
            }`}
            data-tooltip={!sidebarCollapsed ? '' : 'Proventos'}
          >
            <TrendUp size={20} className="flex-shrink-0" />
            {!sidebarCollapsed && <span className="menu-btn-label">Proventos</span>}
          </button>
        </div>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer p-4 border-t border-sb-border bg-sb-footerBg">
        <div className="ultimo-salvo text-[11px] text-sb-groupLabel flex items-center gap-2">
          <div className="status-dot-sidebar w-1.5 h-1.5 rounded-full bg-sb-accent flex-shrink-0 shadow-[0_0_6px_rgba(16,185,129,0.6)] animate-pulse" />
          {!sidebarCollapsed && <span>Sincronizado</span>}
        </div>
        
        {/* Theme Toggle & Hide Values */}
        {!sidebarCollapsed && (
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="btn-theme bg-main-superficie border border-main-borda text-main-textoSecundario w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:border-main-borda2 hover:text-primary hover:bg-bg-primaria"
              title="Alternar tema"
            >
              {isDark ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            
            <button
              onClick={handleToggleValoresOcultos}
              className={`btn-eye bg-main-superficie border border-main-borda text-main-textoSecundario w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:border-main-borda2 hover:text-primary hover:bg-bg-primaria ${
                valoresOcultos ? 'ativo text-primary border-borda-primaria bg-bg-primaria' : ''
              }`}
              title={valoresOcultos ? 'Mostrar valores' : 'Ocultar valores'}
            >
              {valoresOcultos ? <EyeSlash size={16} /> : <Eye size={16} />}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

// Icons imports

