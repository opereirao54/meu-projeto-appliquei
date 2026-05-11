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
  LabelList,
} from 'recharts';
import type { TransactionSummary } from '../../types/transactions';
import { formatarMoeda, formatarMoedaCompacta } from '../../lib/formatters';
import { CORES_COMPOSICAO } from '../../lib/constants';

interface CompositionBarProps {
  resumo: TransactionSummary;
  className?: string;
  height?: number;
}

/**
 * Custom tooltip para composição do mês.
 */
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || payload.length === 0) return null;

  const { name, value, fill } = payload[0].payload;
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '3px',
            background: fill,
            flexShrink: 0,
          }}
        />
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>{name}</span>
      </div>
      <div
        style={{
          color: '#fff',
          fontFamily: "'DM Mono', monospace",
          fontSize: '14px',
          fontWeight: 700,
          marginTop: '4px',
        }}
      >
        {formatarMoeda(value)}
      </div>
    </div>
  );
}

/**
 * Gráfico de Barras Horizontais — Composição do Mês.
 * 
 * Migra o Chart.js bar chart do legacy para Recharts BarChart:
 *   - Eixo Y horizontal (indexAxis: 'y' no legacy)
 *   - Cores por categoria
 *   - Data labels com valor formatado
 * 
 * @ref legacy/Appliquei_v13.html:7862-7901
 */
export function CompositionBar({
  resumo,
  className = '',
  height = 300,
}: CompositionBarProps) {
  const chartData = useMemo(() => {
    const sobra =
      resumo.receita + resumo.resgate -
      resumo.cartao - resumo.despFixa - resumo.despVar -
      (resumo.invFixo + resumo.invVar) - resumo.sonho;

    // Sort by value desc (ref: legacy 7879)
    const items = [
      { name: 'Receita', value: resumo.receita, fill: CORES_COMPOSICAO.receita },
      { name: 'Resgate', value: resumo.resgate, fill: CORES_COMPOSICAO.resgate },
      { name: 'Cartão', value: resumo.cartao, fill: CORES_COMPOSICAO.cartao },
      { name: 'Fixa', value: resumo.despFixa, fill: CORES_COMPOSICAO.despFixa },
      { name: 'Var.', value: resumo.despVar, fill: CORES_COMPOSICAO.despVar },
      { name: 'Aportes Mês', value: resumo.invFixo + resumo.invVar, fill: CORES_COMPOSICAO.investimentos },
      { name: 'Sonhos', value: resumo.sonho, fill: CORES_COMPOSICAO.sonhos },
    ];

    items.sort((a, b) => b.value - a.value);

    items.push({
      name: 'Sobra',
      value: sobra,
      fill: sobra >= 0 ? CORES_COMPOSICAO.sobra : '#e11d48',
    });

    return items.filter((item) => Math.abs(item.value) > 0.01);
  }, [resumo]);

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
          fontStyle: 'italic',
        }}
      >
        Adicione lançamentos para visualizar a composição.
      </div>
    );
  }

  return (
    <div className={className} style={{ width: '100%', height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 80, left: 5, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--cor-borda, #dfe7e0)"
            opacity={0.5}
            horizontal={false}
          />

          <XAxis
            type="number"
            tick={{
              fontSize: 11,
              fontFamily: "'DM Mono', monospace",
              fill: 'var(--cor-texto-mutado)',
            }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => formatarMoedaCompacta(v).replace('R$ ', '')}
          />

          <YAxis
            type="category"
            dataKey="name"
            tick={{
              fontSize: 12,
              fontFamily: "'Figtree', sans-serif",
              fill: 'var(--cor-texto-secundario)',
              fontWeight: 600,
            }}
            axisLine={false}
            tickLine={false}
            width={85}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />

          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={24}>
            {chartData.map((entry, index) => (
              <rect key={`bar-${index}`} fill={entry.fill} />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              formatter={(v: number) => (v === 0 ? '' : formatarMoeda(v))}
              style={{
                fontSize: '10px',
                fontWeight: 700,
                fontFamily: "'DM Mono', monospace",
                fill: 'var(--cor-texto-principal, #0f172a)',
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CompositionBar;
