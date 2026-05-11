'use client';

import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  ComposedChart,
} from 'recharts';
import type { EvolutionDataPoint } from '../../types/snapshots';
import { formatarMoeda, formatarMoedaCompacta } from '../../lib/formatters';
import { PALETA_EVOLUCAO } from '../../lib/constants';

interface EvolutionChartProps {
  data: EvolutionDataPoint[];
  showDividends?: boolean;
  className?: string;
  height?: number;
}

/**
 * Custom tooltip reproduzindo o visual do legacy evolucaoHtmlTooltip().
 * 
 * @ref legacy/Appliquei_v13.html:5727-5771
 */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;

  const dataPoint = payload[0]?.payload as EvolutionDataPoint;
  if (!dataPoint) return null;

  const patrimonio = dataPoint.investido + dataPoint.ganhoCapital + dataPoint.perdaCapital;
  const variacaoRS = dataPoint.ganhoCapital + dataPoint.perdaCapital;
  const variacaoPerc = dataPoint.investido > 0 ? (variacaoRS / dataPoint.investido) * 100 : 0;
  const corVar = variacaoRS >= 0 ? 'var(--cor-primaria, #059669)' : 'var(--cor-erro, #dc2626)';
  const sinal = variacaoRS >= 0 ? '+' : '';

  return (
    <div
      style={{
        background: 'var(--cor-texto-principal, #101e13)',
        padding: '14px 16px',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        border: '1px solid rgba(255,255,255,0.08)',
        minWidth: '200px',
        fontFamily: "'Figtree', sans-serif",
      }}
    >
      <div
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color: 'rgba(255,255,255,0.5)',
          marginBottom: '10px',
          textTransform: 'capitalize',
        }}
      >
        {label}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}
      >
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Patrimônio</span>
        <strong
          style={{
            color: '#fff',
            fontFamily: "'DM Mono', monospace",
            fontSize: '14px',
          }}
        >
          {formatarMoeda(patrimonio)}
        </strong>
      </div>

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '6px 0' }} />

      <TooltipRow
        dot="var(--cor-primaria, #059669)"
        label="Capital aplicado"
        value={formatarMoeda(dataPoint.investido)}
      />

      {dataPoint.ganhoCapital > 0 && (
        <TooltipRow
          dot="var(--cor-primaria, #059669)"
          dotOpacity={0.4}
          label="Ganho capital"
          value={`+${formatarMoeda(dataPoint.ganhoCapital)}`}
          valueColor="var(--cor-primaria, #059669)"
        />
      )}

      {dataPoint.perdaCapital < 0 && (
        <TooltipRow
          dot="var(--cor-erro, #dc2626)"
          label="Perda capital"
          value={formatarMoeda(dataPoint.perdaCapital)}
          valueColor="var(--cor-erro, #dc2626)"
        />
      )}

      {dataPoint.dividendos > 0 && (
        <TooltipRow
          dot="var(--cor-info, #2563eb)"
          label="Dividendos"
          value={`+${formatarMoeda(dataPoint.dividendos)}`}
          valueColor="var(--cor-info, #2563eb)"
        />
      )}

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '6px 0' }} />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Variação no mês</span>
        <strong
          style={{
            color: corVar,
            fontFamily: "'DM Mono', monospace",
            fontSize: '13px',
          }}
        >
          {sinal}{variacaoPerc.toFixed(2)}%
        </strong>
      </div>
    </div>
  );
}

function TooltipRow({
  dot,
  dotOpacity = 1,
  label,
  value,
  valueColor,
}: {
  dot: string;
  dotOpacity?: number;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '2px 0',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: dot,
            opacity: dotOpacity,
            flexShrink: 0,
          }}
        />
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>{label}</span>
      </span>
      <span
        style={{
          color: valueColor || 'rgba(255,255,255,0.9)',
          fontFamily: "'DM Mono', monospace",
          fontSize: '12px',
        }}
      >
        {value}
      </span>
    </div>
  );
}

/**
 * Gráfico de Evolução Patrimonial — Stacked Area Chart.
 * 
 * Migra o Chart.js stacked bar do legacy para Recharts ComposedChart,
 * mantendo as mesmas cores e layout visual:
 *   - Investido: cor sólida verde
 *   - Ganho capital: verde com alpha 35%
 *   - Perda capital: vermelho com alpha 35%
 *   - Dividendos: barras azuis sobrepostas
 * 
 * @ref legacy/Appliquei_v13.html:5800+ (renderizarGraficoEvolucao)
 */
export function EvolutionChart({
  data,
  showDividends = true,
  className = '',
  height = 300,
}: EvolutionChartProps) {
  const chartData = useMemo(() => {
    return data.map((d) => ({
      ...d,
      name: d.label,
    }));
  }, [data]);

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
        Sem dados de evolução para o período selecionado.
      </div>
    );
  }

  return (
    <div className={className} style={{ width: '100%', height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="gradInvestido" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PALETA_EVOLUCAO.investido} stopOpacity={0.3} />
              <stop offset="100%" stopColor={PALETA_EVOLUCAO.investido} stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="gradGanho" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PALETA_EVOLUCAO.investido} stopOpacity={0.2} />
              <stop offset="100%" stopColor={PALETA_EVOLUCAO.investido} stopOpacity={0.02} />
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
              fill: 'var(--cor-texto-secundario, #3b5440)',
            }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tick={{
              fontSize: 11,
              fontFamily: "'DM Mono', monospace",
              fill: 'var(--cor-texto-mutado, #7a9480)',
            }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => formatarMoedaCompacta(v).replace('R$ ', '')}
            width={60}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Investido (base) */}
          <Area
            type="monotone"
            dataKey="investido"
            stackId="1"
            stroke={PALETA_EVOLUCAO.investido}
            strokeWidth={2}
            fill="url(#gradInvestido)"
            dot={false}
            activeDot={{ r: 4, stroke: PALETA_EVOLUCAO.investido, strokeWidth: 2, fill: '#fff' }}
          />

          {/* Ganho Capital */}
          <Area
            type="monotone"
            dataKey="ganhoCapital"
            stackId="1"
            stroke="transparent"
            fill="url(#gradGanho)"
            dot={false}
          />

          {/* Perda Capital (valor negativo, renderiza como área negativa) */}
          <Area
            type="monotone"
            dataKey="perdaCapital"
            stackId="1"
            stroke="transparent"
            fill={PALETA_EVOLUCAO.perdaCapital}
            dot={false}
          />

          {/* Dividendos como barras */}
          {showDividends && (
            <Bar
              dataKey="dividendos"
              fill={PALETA_EVOLUCAO.dividendos}
              radius={[4, 4, 0, 0]}
              barSize={12}
              opacity={0.7}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export default EvolutionChart;
