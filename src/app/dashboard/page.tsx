'use client';

import React, { useMemo, useState } from 'react';
import { useSnapshotStore } from '../../store/snapshotStore';
import { useTransactionStore } from '../../store/transactionStore';
import { EvolutionChart } from '../../components/patrimonio/EvolutionChart';
import { DistributionDonut } from '../../components/patrimonio/DistributionDonut';
import { PeriodSelector } from '../../components/patrimonio/PeriodSelector';
import { formatarMoeda, formatarMoedaCompacta } from '../../lib/formatters';
import { calcularSerieEvolucao } from '../../lib/calculations/portfolio-evolution';
import type { EvolutionPeriod } from '../../types/snapshots';

/**
 * Dashboard Page — Visão Geral do Patrimônio.
 * 
 * Implementa a Phase 3 do Roadmap:
 *   - Gráfico de Evolução (Stacked Area)
 *   - Gráfico de Distribuição (Donut)
 *   - KPIs de Patrimônio Total, Investido e Rentabilidade
 * 
 * @ref legacy/Appliquei_v13.html:5350-5900
 */
export default function DashboardPage() {
  const { snapshots, periodoEvolucao, setPeriodo } = useSnapshotStore();
  const { transacoes } = useTransactionStore();

  // Mock de ativos de mercado para cálculo de evolução (em prod viria do Firebase/API)
  const [ativosMercado] = useState([
    { ticker: 'PETR4', preco_atual: 35.50, tipo: 'ação' },
    { ticker: 'VALE3', preco_atual: 68.20, tipo: 'ação' },
    { ticker: 'KNCR11', preco_atual: 102.30, tipo: 'fii' },
  ]);

  // Mock de cache de dividendos
  const [cacheDividendos] = useState({});

  // Cálculo da série de evolução
  const evolutionSeries = useMemo(() => {
    // Aqui converteríamos o histórico de compras do banco para o formato OperacaoCompra
    // Para o dashboard inicial, podemos usar os snapshots ou calcular em tempo real
    // Se snapshots existirem, usamos eles. Se não, calculamos das transações.
    return calcularSerieEvolucao(
      [], // históricoCompras
      ativosMercado,
      cacheDividendos,
      periodoEvolucao
    );
  }, [ativosMercado, cacheDividendos, periodoEvolucao]);

  const totalPatrimony = useMemo(() => {
    return evolutionSeries.length > 0 
      ? evolutionSeries[evolutionSeries.length - 1].mercado 
      : 0;
  }, [evolutionSeries]);

  const totalInvested = useMemo(() => {
    return evolutionSeries.length > 0 
      ? evolutionSeries[evolutionSeries.length - 1].investido 
      : 0;
  }, [evolutionSeries]);

  const profitability = totalInvested > 0 ? ((totalPatrimony / totalInvested) - 1) * 100 : 0;

  // Distribuição Mock (Phase 3)
  const distributionData = [
    { category: 'rf', label: 'Renda Fixa', value: 45000, percentage: 45, color: '#059669' },
    { category: 'fiis', label: 'FIIs', value: 25000, percentage: 25, color: '#d97706' },
    { category: 'acoes', label: 'Ações', value: 20000, percentage: 20, color: '#7c3aed' },
    { category: 'etfs', label: 'ETFs', value: 10000, percentage: 10, color: '#2563eb' },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header / Summary */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--cor-texto-principal)', marginBottom: '4px' }}>
          Dashboard Financeiro
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--cor-texto-mutado)' }}>
          Acompanhe sua evolução patrimonial e alocação estratégica.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <KPICard 
          title="Patrimônio Total" 
          value={formatarMoeda(totalPatrimony)} 
          subValue={`Aplicado: ${formatarMoeda(totalInvested)}`}
          trend={profitability >= 0 ? 'up' : 'down'}
          trendValue={`${profitability.toFixed(2)}%`}
        />
        <KPICard 
          title="Rentabilidade Geral" 
          value={`${profitability.toFixed(2)}%`} 
          subValue="Acumulado histórico"
          color="var(--cor-primaria)"
        />
        <KPICard 
          title="Dividendos (12m)" 
          value={formatarMoeda(1250.40)} 
          subValue="Yield Médio: 6.2%"
          color="var(--cor-info)"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px', flexWrap: 'wrap' }}>
        {/* Main Chart */}
        <div style={{ 
          background: 'var(--cor-branco)', 
          padding: '24px', 
          borderRadius: '16px', 
          border: '1px solid var(--cor-borda)',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Evolução Patrimonial</h2>
            <PeriodSelector selected={periodoEvolucao} onChange={setPeriodo} />
          </div>
          <EvolutionChart data={evolutionSeries} height={350} />
        </div>

        {/* Distribution Donut */}
        <div style={{ 
          background: 'var(--cor-branco)', 
          padding: '24px', 
          borderRadius: '16px', 
          border: '1px solid var(--cor-borda)',
          boxShadow: 'var(--shadow-card)'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '24px' }}>Distribuição</h2>
          <DistributionDonut data={distributionData} height={220} />
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, subValue, trend, trendValue, color }: any) {
  return (
    <div style={{ 
      background: 'var(--cor-branco)', 
      padding: '20px', 
      borderRadius: '16px', 
      border: '1px solid var(--cor-borda)',
      boxShadow: 'var(--shadow-card)'
    }}>
      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--cor-texto-mutado)', textTransform: 'uppercase', marginBottom: '8px' }}>
        {title}
      </div>
      <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: "'DM Mono', monospace", color: color || 'var(--cor-texto-principal)', marginBottom: '8px' }}>
        {value}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: 'var(--cor-texto-mutado)' }}>{subValue}</span>
        {trendValue && (
          <span style={{ 
            fontSize: '11px', 
            fontWeight: 700, 
            color: trend === 'up' ? 'var(--cor-primaria)' : 'var(--cor-erro)',
            background: trend === 'up' ? 'var(--cor-bg-primaria)' : 'rgba(239, 68, 68, 0.1)',
            padding: '2px 6px',
            borderRadius: '4px'
          }}>
            {trend === 'up' ? '▲' : '▼'} {trendValue}
          </span>
        )}
      </div>
    </div>
  );
}
