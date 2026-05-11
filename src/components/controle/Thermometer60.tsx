'use client';

import React from 'react';
import type { TransactionSummary } from '../../types/transactions';
import { calcularTermometro60 } from '../../lib/calculations/thermometer';
import { formatarMoeda } from '../../lib/formatters';

interface Thermometer60Props {
  resumo: TransactionSummary;
  className?: string;
}

/**
 * Termômetro dos 60% — Componente visual que mostra se os gastos
 * estão dentro do limite de segurança (60% da receita).
 * 
 * Reproduz exatamente o visual e lógica do legacy atualizarTermometro60():
 *   ≤50% → verde "Dentro do limite"
 *   ≤60% → amarelo "Atenção"
 *   >60% → vermelho "Limite ultrapassado"
 * 
 * @ref legacy/Appliquei_v13.html:7574-7632
 */
export function Thermometer60({ resumo, className = '' }: Thermometer60Props) {
  const result = calcularTermometro60(resumo);

  return (
    <div
      className={`card-container ${className}`}
      style={{
        padding: '18px 22px',
        borderRadius: 'var(--radius, 14px)',
        border: '1px solid var(--cor-borda, #dfe7e0)',
        background: 'var(--cor-branco, #ffffff)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--cor-texto-principal)',
              fontFamily: "'Figtree', sans-serif",
            }}
          >
            Termômetro de Gastos
          </span>
          <span
            className={`badge ${result.badgeClass}`}
            style={{
              fontSize: '10px',
              fontWeight: 700,
              padding: '2px 9px',
              borderRadius: '99px',
            }}
          >
            {result.badgeLabel}
          </span>
        </div>
        <span
          style={{
            fontSize: '13px',
            fontWeight: 700,
            fontFamily: "'DM Mono', monospace",
            color: 'var(--cor-texto-principal)',
          }}
        >
          {result.percentualGasto.toFixed(1)}%
        </span>
      </div>

      {/* Bar */}
      <div
        style={{
          width: '100%',
          height: '10px',
          borderRadius: '99px',
          background: 'var(--cor-superficie, #edf0ed)',
          overflow: 'hidden',
          marginBottom: '10px',
          position: 'relative',
        }}
      >
        {/* 60% marker */}
        <div
          style={{
            position: 'absolute',
            left: '60%',
            top: 0,
            bottom: 0,
            width: '2px',
            background: 'var(--cor-texto-mutado)',
            opacity: 0.35,
            zIndex: 1,
          }}
        />
        <div
          style={{
            height: '100%',
            width: `${result.barWidth}%`,
            background: result.barColor,
            borderRadius: '99px',
            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s',
          }}
        />
      </div>

      {/* Labels */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            color: 'var(--cor-texto-mutado)',
            fontWeight: 500,
          }}
        >
          Gasto:{' '}
          <strong
            style={{
              fontFamily: "'DM Mono', monospace",
              color: 'var(--cor-texto-principal)',
            }}
          >
            {formatarMoeda(result.totalDespesa)}
          </strong>
        </span>
        <span
          style={{
            fontSize: '11px',
            color: 'var(--cor-texto-mutado)',
            fontWeight: 500,
          }}
        >
          Limite 60%:{' '}
          <strong
            style={{
              fontFamily: "'DM Mono', monospace",
              color: 'var(--cor-texto-principal)',
            }}
          >
            {formatarMoeda(result.limite60)}
          </strong>
        </span>
      </div>

      {/* Message */}
      <div
        style={{
          fontSize: '12px',
          fontWeight: 500,
          color: result.mensagemCor,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          lineHeight: 1.4,
        }}
      >
        {result.status === 'ok' && <span>✓</span>}
        {result.status === 'warning' && <span>⚠</span>}
        {result.status === 'danger' && <span>⛔</span>}
        {result.mensagem}
      </div>
    </div>
  );
}

export default Thermometer60;
