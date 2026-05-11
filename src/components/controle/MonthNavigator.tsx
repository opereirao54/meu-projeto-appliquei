'use client';

import React from 'react';
import { MESES_CURTOS } from '../../lib/formatters';

interface MonthNavigatorProps {
  mes: number;
  ano: number;
  onNavigate: (direcao: -1 | 1) => void;
  onGoToToday: () => void;
  className?: string;
}

/**
 * Navegador de Mês — ◀ Julho 2025 ▶ + botão Hoje.
 * 
 * @ref legacy/Appliquei_v13.html — mudarMesVisao(), atualizarTelaControle()
 */
export function MonthNavigator({
  mes,
  ano,
  onNavigate,
  onGoToToday,
  className = '',
}: MonthNavigatorProps) {
  const mesNome = MESES_CURTOS[mes];
  const hoje = new Date();
  const isHoje = mes === hoje.getMonth() && ano === hoje.getFullYear();

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <button
        onClick={() => onNavigate(-1)}
        style={{
          background: 'none',
          border: '1px solid var(--cor-borda, #dfe7e0)',
          borderRadius: '8px',
          padding: '6px 10px',
          cursor: 'pointer',
          color: 'var(--cor-texto-secundario)',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          transition: 'all 0.15s',
        }}
        title="Mês anterior"
        aria-label="Mês anterior"
      >
        ◀
      </button>

      <span
        style={{
          fontSize: '16px',
          fontWeight: 700,
          color: 'var(--cor-texto-principal)',
          fontFamily: "'Figtree', sans-serif",
          minWidth: '130px',
          textAlign: 'center',
        }}
      >
        {mesNome} {ano}
      </span>

      <button
        onClick={() => onNavigate(1)}
        style={{
          background: 'none',
          border: '1px solid var(--cor-borda, #dfe7e0)',
          borderRadius: '8px',
          padding: '6px 10px',
          cursor: 'pointer',
          color: 'var(--cor-texto-secundario)',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          transition: 'all 0.15s',
        }}
        title="Próximo mês"
        aria-label="Próximo mês"
      >
        ▶
      </button>

      {!isHoje && (
        <button
          onClick={onGoToToday}
          style={{
            background: 'var(--cor-bg-primaria, #ecfdf5)',
            border: '1px solid var(--cor-borda-primaria, #a7f3d0)',
            borderRadius: '8px',
            padding: '5px 12px',
            cursor: 'pointer',
            color: 'var(--cor-primaria, #059669)',
            fontSize: '12px',
            fontWeight: 600,
            fontFamily: "'Figtree', sans-serif",
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.15s',
          }}
          title="Ir para o mês atual"
          aria-label="Ir para o mês atual"
        >
          📅 Hoje
        </button>
      )}
    </div>
  );
}

export default MonthNavigator;
