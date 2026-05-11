'use client';

import React from 'react';
import type { FinancialHealthScore } from '../../types/dreams';
import { formatarMoeda } from '../../lib/formatters';

interface FinancialHealthPanelProps {
  score: FinancialHealthScore;
  receitaMedia?: number;
  despesaMedia?: number;
  sobraMedia?: number;
  taxaPoupanca?: number;
  recomendadoSonhos?: number;
  mesesComDados?: number;
  planoSugerido?: string[];
  className?: string;
}

const NIVEL_CORES: Record<string, string> = {
  critico: '#ef4444',
  atencao: '#f59e0b',
  bom: '#0ea5e9',
  excelente: '#10b981',
};

/**
 * Painel de Saúde Financeira — análise contextual para sonhos.
 * 
 * Reproduz o visual do legacy renderPainelSaudeSonhos():
 *   - Badge de nível (crítico/frágil/estável/forte)
 *   - Grid com KPIs médios (receita, despesa, sobra, taxa poupança)
 *   - Plano sugerido com passos personalizados
 * 
 * @ref legacy/Appliquei_v13.html:8867-8938
 */
export function FinancialHealthPanel({
  score,
  receitaMedia = 0,
  despesaMedia = 0,
  sobraMedia = 0,
  taxaPoupanca = 0,
  recomendadoSonhos = 0,
  mesesComDados = 0,
  planoSugerido = [],
  className = '',
}: FinancialHealthPanelProps) {
  const cor = NIVEL_CORES[score.nivel] || '#64748b';
  const corBg = `${cor}14`;

  // Gauge SVG semicircular
  const gaugeAngle = Math.min(score.score, 100) * 1.8; // 0-180 degrees
  const r = 60;
  const cx = 75;
  const cy = 70;
  const startAngle = Math.PI;
  const endAngle = startAngle - (gaugeAngle * Math.PI) / 180;
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);
  const largeArc = gaugeAngle > 180 ? 1 : 0;

  return (
    <div
      className={className}
      style={{
        background: 'var(--cor-branco, #ffffff)',
        border: `1px solid var(--cor-borda, #dfe7e0)`,
        borderLeft: `4px solid ${cor}`,
        borderRadius: 'var(--radius, 14px)',
        padding: '20px 22px',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '14px',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: '20px' }}>❤️</span>
        <h3
          style={{
            fontSize: '14px',
            fontWeight: 700,
            color: 'var(--cor-texto-principal)',
            margin: 0,
          }}
        >
          Análise da sua saúde financeira
        </h3>
        <span
          style={{
            fontSize: '10px',
            fontWeight: 700,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.6px',
            padding: '3px 8px',
            borderRadius: '999px',
            background: corBg,
            color: cor,
          }}
        >
          {score.nivel}
        </span>
      </div>

      {/* Score + Message */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '20px',
          marginBottom: '16px',
          flexWrap: 'wrap',
        }}
      >
        {/* Gauge */}
        <div style={{ flexShrink: 0 }}>
          <svg width="150" height="85" viewBox="0 0 150 85">
            {/* Background arc */}
            <path
              d={`M ${cx + r * Math.cos(Math.PI)} ${cy + r * Math.sin(Math.PI)} A ${r} ${r} 0 0 1 ${cx + r * Math.cos(0)} ${cy + r * Math.sin(0)}`}
              fill="none"
              stroke="var(--cor-superficie, #edf0ed)"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Score arc */}
            {gaugeAngle > 0 && (
              <path
                d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
                fill="none"
                stroke={cor}
                strokeWidth="10"
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            )}
            {/* Score text */}
            <text
              x={cx}
              y={cy - 5}
              textAnchor="middle"
              style={{
                fontSize: '24px',
                fontWeight: 800,
                fontFamily: "'DM Mono', monospace",
                fill: cor,
              }}
            >
              {score.score}
            </text>
            <text
              x={cx}
              y={cy + 12}
              textAnchor="middle"
              style={{
                fontSize: '10px',
                fontWeight: 500,
                fill: 'var(--cor-texto-mutado)',
              }}
            >
              de 100
            </text>
          </svg>
        </div>

        {/* Message */}
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--cor-texto-principal)',
              marginBottom: '4px',
            }}
          >
            {score.mensagem}
          </div>
          <div
            style={{
              fontSize: '11px',
              color: 'var(--cor-texto-mutado)',
              marginTop: '6px',
            }}
          >
            Baseado em {mesesComDados} {mesesComDados === 1 ? 'mês' : 'meses'} de dados do
            Controle de Caixa.
          </div>
        </div>
      </div>

      {/* KPIs grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '10px',
          marginBottom: '16px',
        }}
      >
        <MiniKPI label="Receita média" value={formatarMoeda(receitaMedia)} color="#10b981" />
        <MiniKPI label="Despesa média" value={formatarMoeda(despesaMedia)} color="#ef4444" />
        <MiniKPI
          label="Sobra média"
          value={formatarMoeda(sobraMedia)}
          color={sobraMedia >= 0 ? 'var(--cor-primaria)' : '#ef4444'}
        />
        <MiniKPI label="Taxa de poupança" value={`${taxaPoupanca.toFixed(1)}%`} color={cor} />
        <MiniKPI
          label="Recomendado p/ sonhos"
          value={formatarMoeda(recomendadoSonhos)}
          color={cor}
          highlight
          highlightBg={corBg}
        />
      </div>

      {/* Plano sugerido */}
      {planoSugerido.length > 0 && (
        <div
          style={{
            padding: '14px',
            borderRadius: '10px',
            background: corBg,
            border: `1px solid ${cor}33`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
            }}
          >
            <span style={{ fontSize: '16px' }}>💡</span>
            <strong
              style={{
                fontSize: '12.5px',
                color: 'var(--cor-texto-principal)',
              }}
            >
              Plano sugerido para você
            </strong>
          </div>
          <ul
            style={{
              margin: '0 0 0 18px',
              padding: 0,
              color: 'var(--cor-texto-mutado)',
              fontSize: '12.5px',
              lineHeight: 1.65,
            }}
          >
            {planoSugerido.map((passo, i) => (
              <li
                key={i}
                style={{ marginBottom: '4px' }}
                dangerouslySetInnerHTML={{ __html: passo }}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function MiniKPI({
  label,
  value,
  color,
  highlight = false,
  highlightBg,
}: {
  label: string;
  value: string;
  color: string;
  highlight?: boolean;
  highlightBg?: string;
}) {
  return (
    <div
      style={{
        padding: '10px 12px',
        border: '1px solid var(--cor-borda)',
        borderRadius: '9px',
        background: highlight ? highlightBg : 'var(--cor-superficie, #edf0ed)',
      }}
    >
      <div
        style={{
          fontSize: '10.5px',
          fontWeight: 700,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.6px',
          color: 'var(--cor-texto-mutado)',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: '15px',
          fontWeight: 700,
          fontFamily: "'DM Mono', monospace",
          color,
          marginTop: '2px',
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default FinancialHealthPanel;
