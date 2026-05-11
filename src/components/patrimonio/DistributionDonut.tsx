'use client';

import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { DistributionSlice } from '../../types/snapshots';
import { formatarMoeda } from '../../lib/formatters';

interface DistributionDonutProps {
  data: DistributionSlice[];
  className?: string;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
}

/**
 * Custom tooltip para o donut de distribuição.
 */
function CustomDonutTooltip({ active, payload }: any) {
  if (!active || !payload || payload.length === 0) return null;

  const slice = payload[0].payload as DistributionSlice;
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: slice.color,
            flexShrink: 0,
          }}
        />
        <span style={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}>{slice.label}</span>
      </div>
      <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>
        <span style={{ fontFamily: "'DM Mono', monospace" }}>{formatarMoeda(slice.value)}</span>
        <span style={{ marginLeft: '6px', opacity: 0.6 }}>({slice.percentage.toFixed(1)}%)</span>
      </div>
    </div>
  );
}

/**
 * Gráfico Donut de Distribuição por Categoria.
 * 
 * Migra o Chart.js doughnut do legacy para Recharts PieChart,
 * mantendo as mesmas cores por categoria:
 *   - RF: #059669
 *   - FIIs: #d97706
 *   - Ações: #7c3aed
 *   - ETFs: #2563eb
 *   - BDRs: #06b6d4
 * 
 * @ref legacy/Appliquei_v13.html:8244-8261
 */
export function DistributionDonut({
  data,
  className = '',
  height = 280,
  innerRadius = 65,
  outerRadius = 100,
  showLegend = true,
}: DistributionDonutProps) {
  const filteredData = useMemo(() => data.filter((d) => d.value > 0), [data]);
  const total = useMemo(
    () => filteredData.reduce((acc, d) => acc + d.value, 0),
    [filteredData]
  );

  if (filteredData.length === 0) {
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
        Sem dados para exibir.
      </div>
    );
  }

  return (
    <div className={className}>
      <div style={{ width: '100%', height: `${height}px`, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={filteredData}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={2}
              strokeWidth={2}
              stroke="var(--cor-branco, #ffffff)"
            >
              {filteredData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomDonutTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '16px',
              fontWeight: 700,
              fontFamily: "'DM Mono', monospace",
              color: 'var(--cor-texto-principal)',
              lineHeight: 1.1,
            }}
          >
            {formatarMoeda(total)}
          </div>
          <div
            style={{
              fontSize: '10px',
              color: 'var(--cor-texto-mutado)',
              fontWeight: 500,
              marginTop: '2px',
            }}
          >
            Total
          </div>
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            justifyContent: 'center',
            marginTop: '12px',
          }}
        >
          {filteredData.map((slice) => (
            <div
              key={slice.category}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                fontWeight: 500,
                color: 'var(--cor-texto-secundario)',
                background: 'var(--cor-superficie, #edf0ed)',
                padding: '4px 10px',
                borderRadius: '99px',
                border: '1px solid var(--cor-borda, #dfe7e0)',
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: slice.color,
                  flexShrink: 0,
                }}
              />
              {slice.label}
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontWeight: 600,
                  color: 'var(--cor-texto-principal)',
                }}
              >
                {slice.percentage.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DistributionDonut;
