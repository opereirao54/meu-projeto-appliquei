'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { SimulatorResult } from '../../types/simulator';
import { formatarMoeda } from '../../lib/formatters';

interface SimulatorPieChartsProps {
  result: SimulatorResult;
  className?: string;
}

/**
 * Dois doughnuts lado a lado: Patrimônio vs INSS.
 * 
 * Reproduz os Chart.js doughnuts do legacy:
 *   - Patrimônio: Investido (#2563eb) + Juros (#047857)
 *   - INSS: Contribuído (#64748b) + Correção (#94a3b8)
 * 
 * @ref legacy/Appliquei_v13.html:8440-8470
 */
export function SimulatorPieCharts({
  result,
  className = '',
}: SimulatorPieChartsProps) {
  const { aportes, rendimentos } = result.composicao;
  const contribINSS = aportes; // Same capital + aportes
  const correcaoINSS = Math.max(0, result.patrimonioFinalINSS - contribINSS);

  const patrimonioTotal = aportes + rendimentos;
  const percInvestido = patrimonioTotal > 0 ? ((aportes / patrimonioTotal) * 100).toFixed(0) : '0';
  const percJuros = patrimonioTotal > 0 ? ((rendimentos / patrimonioTotal) * 100).toFixed(0) : '0';
  const percContrib = result.patrimonioFinalINSS > 0 ? ((contribINSS / result.patrimonioFinalINSS) * 100).toFixed(0) : '0';
  const percCorrecao = result.patrimonioFinalINSS > 0 ? ((correcaoINSS / result.patrimonioFinalINSS) * 100).toFixed(0) : '0';

  // Rentabilidade
  const rentabInvest = aportes > 0 ? ((rendimentos / aportes) * 100).toFixed(1) : '0';
  const rentabINSS = contribINSS > 0 ? ((((result.patrimonioFinalINSS / contribINSS) - 1) * 100)).toFixed(1) : '0';

  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
      }}
    >
      {/* Patrimônio Donut */}
      <DonutCard
        title="Investindo"
        total={patrimonioTotal}
        segments={[
          { name: 'Valor Investido', value: aportes, color: '#2563eb', percent: percInvestido },
          { name: 'Juros', value: rendimentos, color: '#047857', percent: percJuros },
        ]}
        kpis={[
          { label: 'Montante', value: formatarMoeda(patrimonioTotal), color: 'var(--cor-texto-principal)' },
          { label: 'Investido', value: formatarMoeda(aportes), color: '#2563eb' },
          { label: 'Juros Gerados', value: formatarMoeda(rendimentos), color: '#047857' },
          { label: 'Rentabilidade', value: `+${rentabInvest}%`, color: 'var(--cor-primaria)' },
        ]}
        borderColor="#2563eb"
      />

      {/* INSS Donut */}
      <DonutCard
        title="INSS"
        total={result.patrimonioFinalINSS}
        segments={[
          { name: 'Total Contribuído', value: contribINSS, color: '#64748b', percent: percContrib },
          { name: 'Correção', value: correcaoINSS, color: '#94a3b8', percent: percCorrecao },
        ]}
        kpis={[
          { label: 'Montante', value: formatarMoeda(result.patrimonioFinalINSS), color: 'var(--cor-texto-principal)' },
          { label: 'Contribuído', value: formatarMoeda(contribINSS), color: '#64748b' },
          { label: 'Correção', value: formatarMoeda(correcaoINSS), color: '#94a3b8' },
          { label: 'Rentab. Real', value: `${parseFloat(rentabINSS) >= 0 ? '+' : ''}${rentabINSS}%`, color: '#94a3b8' },
        ]}
        borderColor="#94a3b8"
      />
    </div>
  );
}

function DonutCard({
  title,
  total,
  segments,
  kpis,
  borderColor,
}: {
  title: string;
  total: number;
  segments: Array<{ name: string; value: number; color: string; percent: string }>;
  kpis: Array<{ label: string; value: string; color: string }>;
  borderColor: string;
}) {
  return (
    <div
      style={{
        background: 'var(--cor-branco, #ffffff)',
        border: '1px solid var(--cor-borda, #dfe7e0)',
        borderTop: `3px solid ${borderColor}`,
        borderRadius: 'var(--radius, 14px)',
        padding: '20px',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <h4
        style={{
          fontSize: '13px',
          fontWeight: 700,
          color: 'var(--cor-texto-principal)',
          margin: '0 0 16px',
          textTransform: 'uppercase' as const,
          letterSpacing: '0.5px',
        }}
      >
        {title}
      </h4>

      {/* Chart + legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <div style={{ width: '120px', height: '120px', position: 'relative', flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={segments}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                paddingAngle={2}
                stroke="var(--cor-branco)"
                strokeWidth={2}
              >
                {segments.map((s, i) => (
                  <Cell key={i} fill={s.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div>
          {segments.map((s) => (
            <div
              key={s.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '6px',
                fontSize: '11px',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: s.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ color: 'var(--cor-texto-mutado)' }}>
                {s.name}:{' '}
                <strong
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    color: 'var(--cor-texto-principal)',
                  }}
                >
                  {formatarMoeda(s.value)} ({s.percent}%)
                </strong>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
        }}
      >
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            style={{
              padding: '8px 10px',
              background: 'var(--cor-superficie, #edf0ed)',
              borderRadius: '8px',
              border: '1px solid var(--cor-borda)',
            }}
          >
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.4px',
                color: 'var(--cor-texto-mutado)',
              }}
            >
              {kpi.label}
            </div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 700,
                fontFamily: "'DM Mono', monospace",
                color: kpi.color,
                marginTop: '2px',
              }}
            >
              {kpi.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SimulatorPieCharts;
