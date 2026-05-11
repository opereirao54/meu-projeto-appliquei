'use client';

import React from 'react';
import type { EvolutionPeriod } from '../../types/snapshots';

interface PeriodSelectorProps {
  selected: EvolutionPeriod;
  onChange: (period: EvolutionPeriod) => void;
  className?: string;
}

const PERIODS: { value: EvolutionPeriod; label: string }[] = [
  { value: 1, label: '1M' },
  { value: 3, label: '3M' },
  { value: 6, label: '6M' },
  { value: 12, label: '12M' },
  { value: 0, label: 'Tudo' },
];

/**
 * Seletor de período — pills (1M, 3M, 6M, 12M, Tudo).
 * Reproduz o visual do legacy .period-pill.
 * 
 * @ref legacy/Appliquei_v13.html:5358-5366
 */
export function PeriodSelector({
  selected,
  onChange,
  className = '',
}: PeriodSelectorProps) {
  return (
    <div
      className={`subtab-segmented ${className}`}
      style={{
        display: 'inline-flex',
        gap: '2px',
        padding: '3px',
        background: 'var(--cor-superficie, #edf0ed)',
        borderRadius: '12px',
        border: '1px solid var(--cor-borda, #dfe7e0)',
      }}
    >
      {PERIODS.map((p) => {
        const isActive = p.value === selected;
        return (
          <button
            key={p.value}
            onClick={() => onChange(p.value)}
            style={{
              padding: '6px 14px',
              border: 'none',
              background: isActive ? 'var(--cor-branco, #ffffff)' : 'transparent',
              fontSize: '12px',
              fontWeight: isActive ? 700 : 600,
              cursor: 'pointer',
              color: isActive
                ? 'var(--cor-primaria, #059669)'
                : 'var(--cor-texto-secundario, #3b5440)',
              borderRadius: '10px',
              fontFamily: "'Figtree', sans-serif",
              transition: 'all 0.2s ease',
              boxShadow: isActive
                ? '0 1px 4px rgba(0,0,0,0.08), 0 0 0 1px rgba(5,150,105,0.08)'
                : 'none',
            }}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}

export default PeriodSelector;
