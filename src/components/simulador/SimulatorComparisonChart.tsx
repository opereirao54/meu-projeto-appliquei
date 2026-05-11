'use client';

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts';
import type { SimulatorResult } from '../../types/simulator';
import { formatarMoeda, formatarMoedaCompacta } from '../../lib/formatters';
import { gerarLabelsGrafico } from '../../lib/calculations/simulator';

interface SimulatorComparisonChartProps {
  result: SimulatorResult;
  className?: string;
  height?: number;
}

/**
 * Custom tooltip para o gráfico comparativo Investindo vs INSS.
 * @ref legacy/Appliquei_v13.html:8489-8491
 */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      style={{
        background: 'var(--cor-texto-principal, #101e13)',
        padding: '12px 16px',
        borderRadius: '10px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        border: '1px solid rgba(255,255,255,0.08)',
        fontFamily: "'Figtree', sans-serif",
        minWidth: '180px',
      }}
    >
      <div
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color: 'rgba(255,255,255,0.5)',
          marginBottom: '8px',
        }}
      >
        {label}
      </div>

      {payload.map((entry: any, index: number) => (
        <div
          key={index}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '3px 0',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: entry.color,
                flexShrink: 0,
              }}
            />
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
              {entry.name}
            </span>
          </span>
          <strong
            style={{
              color: '#fff',
              fontFamily: "'DM Mono', monospace",
              fontSize: '12px',
            }}
          >
            {formatarMoeda(entry.value)}
          </strong>
        </div>
      ))}
    </div>
  );
}

/**
 * Gráfico Comparativo: Investindo vs INSS.
 * 
 * Migra o Chart.js line chart do legacy para Recharts LineChart:
 *   - Patrimônio: linha sólida azul #2563eb com fill
 *   - INSS: linha tracejada cinza #94a3b8
 * 
 * @ref legacy/Appliquei_v13.html:8483-8491
 */
export function SimulatorComparisonChart({
  result,
  className = '',
  height = 320,
}: SimulatorComparisonChartProps) {
  const { labels, dataPatrimonio, dataINSS } = useMemo(
    () => gerarLabelsGrafico(result.tabela),
    [result.tabela]
  );

  const chartData = useMemo(() => {
    return labels.map((label, i) => ({
      name: label,
      patrimonio: dataPatrimonio[i] || 0,
      inss: dataINSS[i] || 0,
    }));
  }, [labels, dataPatrimonio, dataINSS]);

  if (chartData.length === 0) {
    return (
      <div
        className={className}
        style={{
          height: `${height}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--cor-texto-mutado)',
          fontSize: '13px',
        }}
      >
        Preencha os parâmetros para visualizar a simulação.
      </div>
    );
  }

  return (
    <div className={className} style={{ width: '100%', height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="gradPatrimonio" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#2563eb" stopOpacity={0.01} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--cor-borda, #dfe7e0)"
            opacity={0.5}
            vertical={false}
          />

          <XAxis
            dataKey="name"
            tick={{
              fontSize: 11,
              fontFamily: "'Figtree', sans-serif",
              fill: 'var(--cor-texto-secundario)',
            }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tick={{
              fontSize: 11,
              fontFamily: "'DM Mono', monospace",
              fill: 'var(--cor-texto-mutado)',
            }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => {
              if (v >= 1e6) return `R$ ${(v / 1e6).toFixed(1)}M`;
              if (v >= 1e3) return `R$ ${(v / 1e3).toFixed(0)}k`;
              return formatarMoeda(v);
            }}
            width={70}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Patrimônio line (ref: legacy 8487) */}
          <Line
            type="monotone"
            dataKey="patrimonio"
            name="Patrimônio"
            stroke="#2563eb"
            strokeWidth={2.5}
            dot={{ r: 2, fill: '#2563eb' }}
            activeDot={{ r: 5, stroke: '#2563eb', strokeWidth: 2, fill: '#fff' }}
            fill="url(#gradPatrimonio)"
          />

          {/* INSS line (ref: legacy 8488) */}
          <Line
            type="monotone"
            dataKey="inss"
            name="INSS"
            stroke="#94a3b8"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={{ r: 1, fill: '#94a3b8' }}
            activeDot={{ r: 4, stroke: '#94a3b8', strokeWidth: 2, fill: '#fff' }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          marginTop: '10px',
        }}
      >
        <LegendItem color="#2563eb" label="Investindo" />
        <LegendItem color="#94a3b8" label="INSS" dashed />
      </div>
    </div>
  );
}

function LegendItem({
  color,
  label,
  dashed = false,
}: {
  color: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div
        style={{
          width: '16px',
          height: '2px',
          background: color,
          borderRadius: '1px',
          ...(dashed ? { borderTop: `2px dashed ${color}`, background: 'transparent' } : {}),
        }}
      />
      <span
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--cor-texto-secundario)',
          fontFamily: "'Figtree', sans-serif",
        }}
      >
        {label}
      </span>
    </div>
  );
}

export default SimulatorComparisonChart;
