'use client';

import React from 'react';
import { formatarMoeda } from '../../lib/formatters';

interface YOCBadgeProps {
  ticker: string;
  yoc: number;
  totalProventos: number;
  totalInvestido: number;
  className?: string;
}

/**
 * YOC Badge — Mostra o Yield on Cost de um ativo específico.
 * 
 * REGRA DO LEGADO:
 *   YOC = (Total Dividendos Recebidos / Total Investido no Ativo) * 100
 * 
 * @ref legacy/Appliquei_v13.html:6230-6250
 */
export function YOCBadge({
  ticker,
  yoc,
  totalProventos,
  totalInvestido,
  className = '',
}: YOCBadgeProps) {
  const isHigh = yoc >= 6;
  const isModerate = yoc >= 3;

  const color = isHigh ? 'var(--cor-primaria)' : isModerate ? 'var(--cor-txt-amber, #d97706)' : 'var(--cor-texto-mutado)';
  const bg = isHigh ? 'var(--cor-bg-primaria, #ecfdf5)' : isModerate ? 'rgba(217, 119, 6, 0.1)' : 'var(--cor-superficie)';

  return (
    <div
      className={className}
      style={{
        padding: '12px 16px',
        borderRadius: '12px',
        background: bg,
        border: `1px solid ${color}33`,
        display: 'inline-flex',
        flexDirection: 'column',
        gap: '4px',
        minWidth: '140px',
      }}
    >
      <div
        style={{
          fontSize: '10px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: 'var(--cor-texto-mutado)',
        }}
      >
        YOC — {ticker}
      </div>
      <div
        style={{
          fontSize: '18px',
          fontWeight: 800,
          fontFamily: "'DM Mono', monospace",
          color: color,
          lineHeight: 1,
        }}
      >
        {yoc.toFixed(2)}%
      </div>
      <div
        style={{
          fontSize: '10px',
          color: 'var(--cor-texto-mutado)',
          fontWeight: 500,
          marginTop: '2px',
        }}
      >
        Total: {formatarMoeda(totalProventos)}
      </div>
    </div>
  );
}

export default YOCBadge;
