import React from 'react';
import { Bell, Search, UserCircle } from '@phosphor-icons/react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useCarteiraStore } from '../../store/carteiraStore';
import { formatarMoeda } from '../../lib/utils/math';

export function Header() {
  const { user } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const { hideValues, toggleHideValues, patrimonioTotal } = useCarteiraStore();

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 transition-colors duration-300">
      {/* Lado Esquerdo - Título da Página e Patrimônio */}
      <div className="flex items-center space-x-6">
        <div>
          <h1 className="text-xl font-syne font-bold text-gray-900 dark:text-white">
            Carteira
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Acompanhe seus ativos e operações
          </p>
        </div>

        {/* Patrimônio Total */}
        <div className="hidden md:flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
            Patrimônio Total
          </span>
          <span className={`text-lg font-bold font-mono ${
            hideValues ? 'blur-sm select-none' : ''
          } ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
            {hideValues ? '••••••' : formatarMoeda(patrimonioTotal)}
          </span>
          <button
            onClick={toggleHideValues}
            className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title={hideValues ? 'Mostrar valores' : 'Ocultar valores'}
          >
            {hideValues ? (
              <UserCircle size={18} weight="bold" />
            ) : (
              <UserCircle size={18} weight="fill" />
            )}
          </button>
        </div>
      </div>

      {/* Lado Direito - Ações */}
      <div className="flex items-center space-x-4">
        {/* Barra de Pesquisa */}
        <div className="relative hidden md:block">
          <Search 
            size={20} 
            weight="bold" 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
          />
          <input
            type="text"
            placeholder="Buscar ativos..."
            className="pl-10 pr-4 py-2 w-64 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>

        {/* Notificações */}
        <button className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
          <Bell size={20} weight="bold" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Perfil do Utilizador */}
        <div className="flex items-center space-x-3 pl-4 border-l border-gray-200 dark:border-gray-700">
          <div className="text-right hidden lg:block">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {user?.displayName || user?.email?.split('@')[0] || 'Utilizador'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user?.email}
            </p>
          </div>
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
            {user?.displayName?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}
