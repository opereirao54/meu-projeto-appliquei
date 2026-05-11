'use client';

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { DividendMonthlyAggregated } from '../../types/dividends';
import { formatarMoeda, MESES_ABREV } from '../../lib/formatters';

interface DividendBarChartProps {
  data: DividendMonthlyAggregated[];
  /** Número de meses para exibir (default: 12) */
  meses?: number;
  className?: string;
  height?: number;
}

/**
 * Custom tooltip dos dividendos.
 */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;

  const value = payload[0]?.value || 0;
  return (
    <div
      style={{
        background: 'var(--cor-texto-principal, #101e13)',
        padding: '10px 14px',
        borderRadius: '10px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        border: '1px solid rgba(255,255,255,0.08)',
        fontFamily: "'Figtree', sans-serif",
      }}
    >
      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
        {label}
      </div>
      <div
        style={{
          fontSize: '14px',
          fontWeight: 700,
          fontFamily: "'DM Mono', monospace",
          color: '#4ade80',
        }}
      >
        {formatarMoeda(value)}
      </div>
    </div>
  );
}

/**
 * Gráfico de Barras — Dividendos últimos N meses.
 * 
 * Migra o Chart.js bar chart do legacy para Recharts BarChart:
 *   - Barras azuis com border radius 4px
 *   - Tooltip com valor formatado
 *   - Labels de mês abreviados
 * 
 * @ref legacy/Appliquei_v13.html — grafico barras dividendos
 */
export function DividendBarChart({
  data,
  meses = 12,
  className = '',
  height = 280,
}: DividendBarChartProps) {
  const chartData = useMemo(() => {
    // Agrupar por mês
    const hoje = new Date();
    const result: Array<{ name: string; total: number; ano: number; mes: number }> = [];

    for (let i = meses - 1; i >= 0; i--) {
      const ref = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const m = ref.getMonth();
      const a = ref.getFullYear();
      const label = `${MESES_ABREV[m]}/${String(a).slice(-2)}`;

      const total = data
        .filter((d) => d.ano === a && d.mes === m)
        .reduce((acc, d) => acc + d.total, 0);

      result.push({ name: label, total, ano: a, mes: m });
    }

    return result;
  }, [data, meses]);

  if (chartData.every((d) => d.total === 0)) {
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
        Nenhum dividendo registrado nos últimos {meses} meses.
      </div>
    );
  }

  return (
    <div className={className} style={{ width: '100%', height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
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
              if (v >= 1e3) return `${(v / 1e3).toFixed(0)}k`;
              return v.toString();
            }}
            width={50}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(5,150,105,0.06)' }} />

          <Bar
            dataKey="total"
            fill="#2563eb"
            radius={[4, 4, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default DividendBarChart;
