'use client';

import React from 'react';
import type { SimulatorResult } from '../../types/simulator';
import { formatarMoeda } from '../../lib/formatters';

interface SimulatorHeroCardProps {
  result: SimulatorResult;
  anos: number;
  className?: string;
}

/**
 * Hero Card do Simulador — mostra a diferença entre Investindo vs INSS.
 * 
 * Reproduz o visual do legacy HERO section:
 *   - Diferença absoluta (heroDiff)
 *   - Multiplicador (heroMultiplo)
 *   - Renda passiva mensal (heroRendaMensal)
 *   - Regra de 0.8% ao mês
 * 
 * @ref legacy/Appliquei_v13.html:8472-8480
 */
export function SimulatorHeroCard({
  result,
  anos,
  className = '',
}: SimulatorHeroCardProps) {
  const diff = result.diferencaFinal;
  const multiplo = result.multiplicador;
  const rendaMensal = result.rendaPassivaFinal;
  const sinal = diff >= 0 ? '+' : '';

  return (
    <div
      className={className}
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        borderRadius: 'var(--radius, 14px)',
        padding: '28px 28px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative element */}
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-30px',
          width: '160px',
          height: '160px',
          background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      {/* Header badge */}
      <div
        style={{
          fontSize: '10px',
          fontWeight: 700,
          textTransform: 'uppercase' as const,
          letterSpacing: '1px',
          color: '#94a3b8',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#2563eb',
          }}
        />
        Investindo com consciência
      </div>

      {/* Difference */}
      <div
        style={{
          fontSize: '28px',
          fontWeight: 800,
          fontFamily: "'DM Mono', monospace",
          color: diff >= 0 ? '#4ade80' : '#f87171',
          lineHeight: 1.1,
          marginBottom: '8px',
          letterSpacing: '-1px',
        }}
      >
        {sinal}{formatarMoeda(diff)}
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontSize: '13px',
          color: 'rgba(255,255,255,0.6)',
          lineHeight: 1.5,
          marginBottom: '20px',
          maxWidth: '400px',
        }}
      >
        Investir com consciência trará um patrimônio{' '}
        <strong style={{ color: '#fff' }}>{multiplo.toFixed(1)}x</strong> maior do que depender
        do INSS.
      </div>

      {/* Passive Income */}
      <div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>
          Em <strong style={{ color: '#fff', fontWeight: 700 }}>{Math.round(anos)}</strong>{' '}
          anos você terá uma renda passiva estimada em
        </div>
        <div
          style={{
            fontSize: '26px',
            fontWeight: 700,
            fontFamily: "'DM Mono', monospace",
            color: '#fff',
            letterSpacing: '-0.5px',
            margin: '6px 0 4px',
            lineHeight: 1.1,
          }}
        >
          {formatarMoeda(rendaMensal)}{' '}
          <span style={{ fontSize: '14px', fontWeight: 500, opacity: 0.75 }}>/mês</span>
        </div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
          Regra de 0,8% a.m.
        </div>
      </div>
    </div>
  );
}

export default SimulatorHeroCard;
