import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuthStore } from '../store/authStore';
import { useCarteiraStore } from '../store/carteiraStore';

export function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuthStore();
  const sidebarCollapsed = useCarteiraStore((state) => state.sidebarCollapsed);

  // Redirect para login se não autenticado
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-syne">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, não renderiza o shell
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Sidebar Fixa */}
      <Sidebar />

      {/* Conteúdo Principal */}
      <div 
        className={`transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'ml-20' : 'ml-72'
        }`}
      >
        {/* Header */}
        <Header />

        {/* Conteúdo da Página */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
